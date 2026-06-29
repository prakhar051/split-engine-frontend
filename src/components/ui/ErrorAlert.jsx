import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 text-sm flex items-center space-x-3 shadow-sm">
      <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
      <span>{message}</span>
    </div>
  );
}
