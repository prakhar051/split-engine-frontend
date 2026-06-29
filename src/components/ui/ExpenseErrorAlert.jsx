import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExpenseErrorAlert({ error }) {
  if (!error) return null;

  const isArray = Array.isArray(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 text-sm shadow-sm space-y-2"
    >
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
        <span className="font-bold">Error Occurred</span>
      </div>
      
      {isArray ? (
        <ul className="list-disc pl-8 space-y-1">
          {error.map((err, index) => (
            <li key={index} className="text-rose-400">
              <span className="capitalize font-semibold">{err.field.replace(/_/g, ' ')}</span>: {err.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="pl-8 text-rose-400">{error}</p>
      )}
    </motion.div>
  );
}
