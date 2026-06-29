import { Inbox } from 'lucide-react';

export default function EmptyState({ title, message, icon: Icon = Inbox, actionButton }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 w-full">
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">{message}</p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
}
