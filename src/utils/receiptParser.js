/**
 * Utility to parse merchant, date, amount, tax, and currency from raw receipt text.
 */

const FORBIDDEN_WORDS = [
  /total/i,
  /grand/i,
  /tax/i,
  /gst/i,
  /bill/i,
  /receipt/i,
  /change/i,
  /cash/i,
  /date/i,
  /time/i,
  /phone/i,
  /invoice/i,
  /welcome/i,
  /thank/i,
  /tel:/i,
  /tel\s*:/i,
  /fax/i,
  /www\./i,
  /http/i,
  /amount/i,
  /subtotal/i
];

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/**
 * Clean line to detect clean merchant names.
 */
const getCleanMerchant = (rawText) => {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    const hasForbidden = FORBIDDEN_WORDS.some(regex => regex.test(line));
    const hasLetter = /[a-zA-Z]/.test(line);
    if (!hasForbidden && hasLetter && line.length >= 3) {
      const cleaned = line.replace(/^[^\w\s&]+|[^\w\s&]+$/g, '').trim(); // clean leading/trailing punctuation except &
      if (cleaned.length >= 3) {
        return cleaned;
      }
    }
  }
  return null;
};

/**
 * Match and normalize date formats.
 */
const getCleanDate = (text) => {
  // 1. YYYY-MM-DD or YYYY/MM/DD
  const r1 = /\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/;
  let match = text.match(r1);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    }
  }

  // 2. DD/MM/YYYY or MM/DD/YYYY
  const r2 = /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/;
  match = text.match(r2);
  if (match) {
    const val1 = parseInt(match[1], 10);
    const val2 = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    let d = val1;
    let m = val2;
    if (val1 > 12) {
      d = val1;
      m = val2;
    } else if (val2 > 12) {
      d = val2;
      m = val1;
    }
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    }
  }

  // 3. DD/MM/YY or MM/DD/YY
  const r3 = /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})\b/;
  match = text.match(r3);
  if (match) {
    const val1 = parseInt(match[1], 10);
    const val2 = parseInt(match[2], 10);
    const yy = parseInt(match[3], 10);
    const y = yy > 50 ? 1900 + yy : 2000 + yy;
    let d = val1;
    let m = val2;
    if (val1 > 12) {
      d = val1;
      m = val2;
    } else if (val2 > 12) {
      d = val2;
      m = val1;
    }
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    }
  }

  // 4. DD Mon YYYY or Mon DD YYYY (e.g. 26 Jun 2026 or Jun 26 2026)
  const monthRegexStr = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*';
  const r4_1 = new RegExp(`\\b(\\d{1,2})\\s+(${monthRegexStr})\\s+(\\d{4})\\b`, 'i');
  match = text.match(r4_1);
  if (match) {
    const d = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase().substring(0, 3);
    const y = parseInt(match[4], 10);
    const m = MONTHS[monthName] + 1;
    return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }

  const r4_2 = new RegExp(`\\b(${monthRegexStr})\\s+(\\d{1,2})\\s*,?\\s*(\\d{4})\\b`, 'i');
  match = text.match(r4_2);
  if (match) {
    const monthName = match[1].toLowerCase().substring(0, 3);
    const d = parseInt(match[3], 10);
    const y = parseInt(match[4], 10);
    const m = MONTHS[monthName] + 1;
    return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }

  return null;
};

/**
 * Parse amount based on prioritization and largest fallback.
 */
const getCleanAmount = (rawText) => {
  const lines = rawText.split('\n');
  let grandTotalVal = null;
  let totalVal = null;
  let netTotalVal = null;
  let amountVal = null;
  let balanceDueVal = null;
  let maxVal = null;

  const allPrices = [];
  const allMatches = rawText.match(/\b\d+[\.,]\d{2}\b/g) || [];
  allMatches.forEach((m) => {
    const val = parseFloat(m.replace(',', '.'));
    if (!isNaN(val)) allPrices.push(val);
  });
  if (allPrices.length > 0) {
    maxVal = Math.max(...allPrices);
  }

  for (const line of lines) {
    const cleanLine = line.toLowerCase();
    const lineMatches = line.match(/\b\d+[\.,]\d{2}\b/g) || [];
    if (lineMatches.length === 0) continue;

    const linePrice = parseFloat(lineMatches[lineMatches.length - 1].replace(',', '.'));
    if (isNaN(linePrice)) continue;

    if (cleanLine.includes('grand total')) {
      if (grandTotalVal === null) grandTotalVal = linePrice;
    } else if (cleanLine.includes('total') && !cleanLine.includes('subtotal') && !cleanLine.includes('tax')) {
      if (totalVal === null) totalVal = linePrice;
    } else if (cleanLine.includes('net total')) {
      if (netTotalVal === null) netTotalVal = linePrice;
    } else if (cleanLine.includes('amount') && !cleanLine.includes('tax')) {
      if (amountVal === null) amountVal = linePrice;
    } else if (cleanLine.includes('balance due') || cleanLine.includes('amount due') || cleanLine.includes('bal due')) {
      if (balanceDueVal === null) balanceDueVal = linePrice;
    }
  }

  let finalAmountFloat = null;
  if (grandTotalVal !== null) finalAmountFloat = grandTotalVal;
  else if (totalVal !== null) finalAmountFloat = totalVal;
  else if (netTotalVal !== null) finalAmountFloat = netTotalVal;
  else if (amountVal !== null) finalAmountFloat = amountVal;
  else if (balanceDueVal !== null) finalAmountFloat = balanceDueVal;
  else if (maxVal !== null) finalAmountFloat = maxVal;

  return finalAmountFloat !== null ? Math.round(finalAmountFloat * 100) : null;
};

/**
 * Match tax values on receipt.
 */
const getCleanTax = (rawText) => {
  const lines = rawText.split('\n');
  let taxFloat = null;
  for (const line of lines) {
    const cleanLine = line.toLowerCase();
    if (cleanLine.includes('tax') || cleanLine.includes('gst') || cleanLine.includes('vat') || cleanLine.includes('cgst') || cleanLine.includes('sgst')) {
      const lineMatches = line.match(/\b\d+[\.,]\d{2}\b/g) || [];
      if (lineMatches.length > 0) {
        const val = parseFloat(lineMatches[lineMatches.length - 1].replace(',', '.'));
        if (!isNaN(val)) {
          taxFloat = val;
          break;
        }
      }
    }
  }
  return taxFloat !== null ? Math.round(taxFloat * 100) : null;
};

/**
 * Match currency codes/symbols.
 */
const getCleanCurrency = (rawText) => {
  if (rawText.includes('₹') || /\bINR\b/i.test(rawText)) {
    return 'INR';
  } else if (rawText.includes('$') || /\bUSD\b/i.test(rawText)) {
    return 'USD';
  } else if (rawText.includes('€') || /\bEUR\b/i.test(rawText)) {
    return 'EUR';
  } else if (rawText.includes('£') || /\bGBP\b/i.test(rawText)) {
    return 'GBP';
  }
  return null;
};

/**
 * Parse the raw OCR text into structured receipt details.
 *
 * @param {string} rawText - Raw OCR text
 * @returns {Object} Parsed receipt info
 */
export const parseReceiptText = (rawText) => {
  if (!rawText) {
    return {
      merchant: null,
      title: null,
      date: null,
      amount: null,
      tax: null,
      currency: null,
      rawText: '',
      items: [],
      confidence: null,
      aiCategory: null
    };
  }

  const merchant = getCleanMerchant(rawText);
  const date = getCleanDate(rawText);
  const amount = getCleanAmount(rawText);
  const tax = getCleanTax(rawText);
  const currency = getCleanCurrency(rawText);

  return {
    merchant,
    title: merchant, // default suggested title to merchant name
    date,
    amount,
    tax,
    currency,
    rawText,
    items: [], // defaults to empty array per requirements
    confidence: null, // will be updated from Tesseract result
    aiCategory: null  // reserved for Phase 21
  };
};
