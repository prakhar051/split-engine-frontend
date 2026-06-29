import { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';

export default function ProfileForm({ initialName, onSubmit, isLoading }) {
  const [name, setName] = useState(initialName || '');
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setName(initialName || '');
  }, [initialName]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setValidationError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError('Name cannot be empty.');
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 100) {
      setValidationError('Name must be between 3 and 100 characters.');
      return;
    }

    onSubmit(trimmed);
  };

  const isUnchanged = name.trim() === (initialName || '').trim();

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <User className="w-4 h-4 text-violet-400" />
          <span>Profile Info</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">Update your display name here.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="name-input" className="text-xs font-semibold text-slate-450 block">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={handleNameChange}
            disabled={isLoading}
            placeholder="John Doe"
            className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none transition duration-150"
          />
        </div>
        {validationError && (
          <p className="text-[11px] font-medium text-rose-450">{validationError}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading || isUnchanged}
          className="flex items-center space-x-1.5 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-500/10 disabled:shadow-none"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}
