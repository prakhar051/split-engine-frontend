import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, ArrowRight, FolderPlus, HelpCircle } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useGroupStore } from '../store/groupStore';
import OCRUploader from '../components/ocr/OCRUploader';
import OCRProgress from '../components/ocr/OCRProgress';
import OCRResultPreview from '../components/ocr/OCRResultPreview';
import ErrorAlert from '../components/ui/ErrorAlert';

export default function ReceiptScannerPage() {
  const navigate = useNavigate();
  const {
    ocrLoading,
    ocrProgress,
    ocrLoadingStage,
    ocrResult,
    scanReceipt,
    clearOCR,
    error: ocrError
  } = useExpenseStore();

  const { groups, getGroups } = useGroupStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [editedResult, setEditedResult] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [localError, setLocalError] = useState(null);

  // Initialize page: clear old OCR and fetch groups
  useEffect(() => {
    clearOCR();
    getGroups();
    return () => {
      clearOCR();
    };
  }, [clearOCR, getGroups]);

  // Keep local edited results in sync when scan completes
  useEffect(() => {
    if (ocrResult) {
      setEditedResult({ ...ocrResult });
    }
  }, [ocrResult]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setLocalError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    clearOCR();
    setEditedResult(null);
    setLocalError(null);
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    try {
      setLocalError(null);
      await scanReceipt(selectedFile);
    } catch (err) {
      console.error('Scan failed:', err);
    }
  };

  const handleChangeField = (field, value) => {
    setEditedResult((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        [field]: value
      };
      if (field === 'merchant' && prev.title === prev.merchant) {
        updated.title = value;
      }
      return updated;
    });
  };

  const handleContinue = () => {
    setLocalError(null);

    if (!selectedGroupId) {
      setLocalError('Please select a target group to log this expense.');
      return;
    }

    if (!editedResult) {
      setLocalError('Please scan a receipt first.');
      return;
    }

    // Navigate to create expense page, passing the parsed result in the state
    navigate(`/groups/${selectedGroupId}/expenses/new`, {
      state: { ocrResult: editedResult }
    });
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center space-x-2.5">
          <Cpu className="w-8 h-8 text-indigo-400" />
          <span>Receipt Scanner</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform instant, client-side character recognition on receipts to pre-fill expense title, amount, and date.
        </p>
      </div>

      {(localError || ocrError) && <ErrorAlert message={localError || ocrError} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload zone / Progress bar / Result Preview (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {!ocrResult && !ocrLoading && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Upload Receipt</h3>
                <p className="text-xs text-slate-500 mt-1">Select or drop a receipt image to extract its text.</p>
              </div>
              <OCRUploader
                selectedFile={selectedFile}
                onSelectFile={handleSelectFile}
                onRemoveFile={handleRemoveFile}
                disabled={ocrLoading}
              />
              
              {selectedFile && (
                <button
                  onClick={handleStartScan}
                  disabled={ocrLoading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-indigo-500/10 text-sm"
                >
                  Scan Receipt Image
                </button>
              )}
            </div>
          )}

          {ocrLoading && (
            <OCRProgress progress={ocrProgress} stage={ocrLoadingStage} />
          )}

          {ocrResult && editedResult && !ocrLoading && (
            <OCRResultPreview result={editedResult} onChangeField={handleChangeField} />
          )}
        </div>

        {/* Right Side: Destination & Setup */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 sticky top-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <span>Destination Group</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Which group does this expense belong to?</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Group</label>
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setLocalError(null);
                }}
                disabled={ocrLoading}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-350 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
              >
                <option value="">-- Choose a Group --</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Helper tips */}
            <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl text-xs space-y-1.5 text-slate-400">
              <p className="font-bold text-indigo-400 flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quick Tip</span>
              </p>
              <p className="leading-relaxed">
                Scan your receipt first, check the preview to make edits, select the group, and click "Continue". This will fill out the title, amount, and date automatically.
              </p>
            </div>

            {ocrResult && !ocrLoading && (
              <button
                onClick={handleContinue}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 text-sm cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                <span>Continue to Split</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
