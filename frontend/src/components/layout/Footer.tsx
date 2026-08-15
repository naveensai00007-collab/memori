import React from 'react';
import { Shield, Lock, HardDrive } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-memori-border/60 bg-memori-surface py-8 px-4 text-xs text-memori-secondary">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MEMORI" className="w-5 h-5" />
          <span className="font-semibold text-primary">MEMORI</span>
          <span>— Your life. Organized. Remembered.</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-accent-dark" />
            <span>Zero-Knowledge Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>Offline-First (IndexedDB)</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Self-Hostable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
