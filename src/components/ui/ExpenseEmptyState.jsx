import { Inbox, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExpenseEmptyState({ type = 'expenses', title, message, actionButton }) {
  const Icon = type === 'attachments' ? FileImage : Inbox;
  const defaultTitle = type === 'attachments' ? 'No attachments found' : 'No expenses recorded';
  const defaultMessage = type === 'attachments' 
    ? 'No receipt files have been uploaded for this expense yet.' 
    : 'Get started by creating the first expense for this group.';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 w-full"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500 shadow-md">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-200">{title || defaultTitle}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">{message || defaultMessage}</p>
      {actionButton && <div className="mt-5">{actionButton}</div>}
    </motion.div>
  );
}
