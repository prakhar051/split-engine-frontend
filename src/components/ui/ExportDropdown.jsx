import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import api from '../../api/api';

const ExportDropdown = ({ groupId = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeExportType, setActiveExportType] = useState(null); // 'expenses-csv', 'expenses-pdf', etc.
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const dropdownRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type, path, defaultFilename) => {
    if (isExporting) return;
    setIsExporting(true);
    setActiveExportType(type);
    setIsOpen(false);

    try {
      const response = await api.get(path, { responseType: 'blob' });
      
      // Determine filename from header
      const contentDisposition = response.headers['content-disposition'];
      let filename = defaultFilename;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // Trigger browser download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast('Report downloaded successfully!', 'success');
    } catch (err) {
      console.error('[Export Error]', err);
      showToast('Failed to export report. Access denied or server error.', 'error');
    } finally {
      setIsExporting(false);
      setActiveExportType(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const groupOptions = [
    {
      type: 'expenses-csv',
      label: 'Export Expenses CSV',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
      action: () => handleExport(
        'expenses-csv',
        `/groups/${groupId}/export/csv`,
        `expenses-${groupId}-${todayStr}.csv`
      )
    },
    {
      type: 'expenses-pdf',
      label: 'Export Expenses PDF',
      icon: <FileText className="w-4 h-4 text-rose-400" />,
      action: () => handleExport(
        'expenses-pdf',
        `/groups/${groupId}/export/pdf`,
        `expenses-${groupId}-${todayStr}.pdf`
      )
    },
    {
      type: 'settlements-csv',
      label: 'Export Settlements CSV',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
      action: () => handleExport(
        'settlements-csv',
        `/groups/${groupId}/export/settlements/csv`,
        `settlements-${groupId}-${todayStr}.csv`
      )
    },
    {
      type: 'settlements-pdf',
      label: 'Export Settlements PDF',
      icon: <FileText className="w-4 h-4 text-rose-400" />,
      action: () => handleExport(
        'settlements-pdf',
        `/groups/${groupId}/export/settlements/pdf`,
        `settlements-${groupId}-${todayStr}.pdf`
      )
    }
  ];

  const dashboardOptions = [
    {
      type: 'dashboard-pdf',
      label: 'Export Dashboard PDF',
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      action: () => handleExport(
        'dashboard-pdf',
        '/dashboard/export/pdf',
        `dashboard-${todayStr}.pdf`
      )
    }
  ];

  const options = groupId ? groupOptions : dashboardOptions;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Toast Alert Popup */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all duration-300 animate-slide-in ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertTriangle className="w-4.5 h-4.5" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => !isExporting && setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
          isExporting 
            ? 'bg-slate-800/50 border-slate-700/50 text-slate-500' 
            : 'bg-slate-900 border-slate-850 hover:border-slate-700/60 hover:bg-slate-850 text-slate-200'
        }`}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl z-30 py-2 divide-y divide-white/5 animate-fade-in">
          {options.map((option) => (
            <button
              key={option.type}
              onClick={option.action}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 text-left transition duration-150"
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
