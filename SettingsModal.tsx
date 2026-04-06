import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSave: (token: string) => void;
}

export default function SettingsModal({ isOpen, onClose, token, onSave }: SettingsModalProps) {
  const [tempToken, setTempToken] = useState(token);

  useEffect(() => {
    setTempToken(token);
  }, [token]);

  const handleSave = () => {
    onSave(tempToken);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#151619] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-white/5 p-2">
                  <Settings className="h-5 w-5 text-white/70" />
                </div>
                <h2 className="text-xl font-semibold text-white">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Hugging Face API Token
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                  <input
                    type="password"
                    value={tempToken}
                    onChange={(e) => setTempToken(e.target.value)}
                    placeholder="hf_..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="mt-2 flex items-start gap-2 text-xs text-white/30">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>
                    Your token is stored locally in your browser. You can find it in your{' '}
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 underline hover:text-white"
                    >
                      Hugging Face settings
                    </a>.
                  </span>
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="w-full rounded-xl bg-white py-3 font-semibold text-black transition-transform active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
