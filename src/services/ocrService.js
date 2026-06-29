import { createWorker } from 'tesseract.js';

let worker = null;
let currentOnProgress = null;

/**
 * Maps Tesseract's status messages and numeric progress values
 * into user-friendly stages and a scaled 0-100% progress value.
 */
const mapProgress = (m) => {
  const status = m.status;
  const progress = m.progress || 0;

  let stage = 'Loading OCR Engine';
  let percent = 0;

  if (status === 'loading tesseract core' || status === 'loading language traineddata' || status === 'initializing api') {
    stage = 'Loading OCR Engine';
    percent = Math.round(progress * 30); // 0 to 30%
  } else if (status === 'recognizing text') {
    if (progress < 0.5) {
      stage = 'Reading Image';
      percent = 30 + Math.round(progress * 80); // 30 to 70%
    } else {
      stage = 'Detecting Text';
      percent = 70 + Math.round((progress - 0.5) * 50); // 70 to 95%
    }
  } else if (status === 'done') {
    stage = 'Completed';
    percent = 100;
  } else {
    // Default fallback
    stage = 'Loading OCR Engine';
    percent = Math.round(progress * 30);
  }

  return { stage, percent: Math.min(100, Math.max(0, percent)) };
};

const globalLogger = (m) => {
  if (currentOnProgress) {
    const { stage, percent } = mapProgress(m);
    currentOnProgress({ stage, percent });
  }
};

/**
 * Scan a receipt file using Tesseract.js.
 * Lazy-loads the worker on first use and keeps it alive.
 *
 * @param {File|Blob|string} file - The file/source to scan
 * @param {Function} onProgress - Callback receiving { stage, percent }
 * @returns {Promise<Object>} rawText and confidence score
 */
export const scanReceipt = async (file, onProgress) => {
  currentOnProgress = onProgress;

  try {
    if (!worker) {
      if (onProgress) onProgress({ stage: 'Loading OCR Engine', percent: 5 });
      worker = await createWorker('eng', 1, {
        logger: globalLogger
      });
    }

    if (onProgress) onProgress({ stage: 'Reading Image', percent: 32 });

    const { data: { text, confidence } } = await worker.recognize(file);

    if (onProgress) {
      onProgress({ stage: 'Parsing Receipt', percent: 95 });
    }

    return {
      rawText: text,
      confidence: confidence
    };
  } catch (err) {
    console.error('[scanReceipt Error] Failed to scan receipt:', err);
    throw err;
  }
};

/**
 * Cleanly terminates the active Tesseract worker.
 */
export const terminateWorker = async () => {
  if (worker) {
    try {
      await worker.terminate();
    } catch (err) {
      console.error('[terminateWorker Error] Failed to terminate worker:', err);
    }
    worker = null;
  }
};

// Auto-clean up worker when the browser tab/application window is closed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    terminateWorker().catch(console.error);
  });
}
