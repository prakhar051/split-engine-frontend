import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle, ShieldAlert, Brain, Loader2 } from 'lucide-react';
import { useExpenseStore } from '../../store/expenseStore';
import AISuggestionCard from './AISuggestionCard';

export default function OCRResultPreview({ result, onChangeField }) {
  const [showRawText, setShowRawText] = useState(false);

  const {
    aiLoading,
    aiSuggestion,
    aiError,
    categorizeReceipt,
    clearAISuggestion
  } = useExpenseStore();

  const confidence = result.confidence || 0;

  // Determine color and label for confidence score
  let confidenceColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  let confidenceIcon = <ShieldAlert className="w-4 h-4 text-rose-400" />;
  if (confidence >= 90) {
    confidenceColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    confidenceIcon = <CheckCircle className="w-4 h-4 text-emerald-400" />;
  } else if (confidence >= 70) {
    confidenceColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    confidenceIcon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
  }

  // Convert cents to decimal string for display, handling empty/null
  const displayAmount = result.amount !== null && result.amount !== undefined
    ? (result.amount / 100).toString()
    : '';

  const displayTax = result.tax !== null && result.tax !== undefined
    ? (result.tax / 100).toString()
    : '';

  const handlePriceChange = (field, value) => {
    const parsedVal = parseFloat(value);
    const cents = isNaN(parsedVal) ? null : Math.round(parsedVal * 100);
    onChangeField(field, cents);
  };

  const handleAnalyzeWithAI = async () => {
    try {
      await categorizeReceipt(result.rawText);
    } catch (err) {
      console.error('AI analysis failed:', err);
    }
  };

  const handleAcceptSuggestion = () => {
    const suggestion = aiSuggestion?.suggestion;
    if (suggestion) {
      onChangeField('merchant', suggestion.merchant);
      onChangeField('title', suggestion.title);
      onChangeField('category', suggestion.category);
      clearAISuggestion();
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Confidence Header Indicator */}
      <div className={`flex items-center justify-between p-4 border rounded-2xl ${confidenceColor}`}>
        <div className="flex items-center space-x-2.5">
          {confidenceIcon}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">OCR Scan Confidence</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">
              Tesseract engine returned a confidence rating of {Math.round(confidence)}%
            </p>
          </div>
        </div>
      </div>

      {/* Low Confidence warning */}
      {confidence < 70 && (
        <div className="flex items-start space-x-2.5 p-4 bg-rose-500/5 border border-rose-500/10 text-rose-455 rounded-2xl">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Verify Extracted Fields</p>
            <p className="text-slate-400">
              The scan confidence is low ({Math.round(confidence)}%). Some characters might have been misread. Please review and correct the fields below before continuing.
            </p>
          </div>
        </div>
      )}

      {/* AI Assistant Section */}
      {!aiSuggestion && !aiLoading && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
          <div className="flex items-start space-x-3 text-slate-350">
            <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Smart AI Assistant Suggestion</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Let Gemini analyze receipt text to classify category, title, and merchant.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeWithAI}
            className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 hover:text-white text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer flex items-center space-x-1.5 shrink-0 shadow-lg shadow-indigo-500/10"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Analyze with AI</span>
          </button>
        </div>
      )}

      {aiLoading && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col items-center justify-center space-y-3 font-sans">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-xs font-bold text-slate-300">Gemini is analyzing receipt text...</p>
          <p className="text-[10px] text-slate-500">Extracting merchant, suggested title, and category</p>
        </div>
      )}

      {(aiSuggestion || aiError) && (
        <AISuggestionCard
          suggestionEnvelope={aiSuggestion}
          error={aiError}
          onAccept={handleAcceptSuggestion}
          onDismiss={clearAISuggestion}
          onRetry={handleAnalyzeWithAI}
        />
      )}

      {/* Editable Fields Form */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Merchant */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Merchant Name</label>
            <input
              type="text"
              value={result.merchant || ''}
              onChange={(e) => onChangeField('merchant', e.target.value)}
              placeholder="Starbucks, Uber, etc."
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>

          {/* Suggested Title */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suggested Expense Title</label>
            <input
              type="text"
              value={result.title || ''}
              onChange={(e) => onChangeField('title', e.target.value)}
              placeholder="Expense description/title"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={displayAmount}
              onChange={(e) => handlePriceChange('amount', e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>

          {/* Tax */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tax amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={displayTax}
              onChange={(e) => handlePriceChange('tax', e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Date</label>
            <input
              type="date"
              value={result.date || ''}
              onChange={(e) => onChangeField('date', e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            />
          </div>
        </div>

        {/* Currency selection */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Currency</label>
          <select
            value={result.currency || ''}
            onChange={(e) => onChangeField('currency', e.target.value || null)}
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
          >
            <option value="">None / Detected Currency</option>
            <option value="USD">USD ($) - United States Dollar</option>
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound Sterling</option>
          </select>
        </div>
      </div>

      {/* Collapsible Raw Text Section */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-md">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="w-full px-5 py-4 flex items-center justify-between text-sm font-bold text-slate-350 hover:text-white bg-slate-900/20 hover:bg-slate-900/40 transition cursor-pointer"
        >
          <span>Raw OCR Extracted Text</span>
          {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawText && (
          <div className="px-5 py-4 border-t border-slate-850/80 bg-slate-950/40">
            <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-60">
              {result.rawText || 'No text recognized.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
