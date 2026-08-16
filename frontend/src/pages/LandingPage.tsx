import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Lock, WifiOff, HardDrive, ArrowRight, Check, Key, EyeOff } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-memori-bg text-memori-text selection:bg-accent/25 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-memori-border bg-memori-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="MEMORI" className="w-8 h-8" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold text-base tracking-tight text-primary">MEMORI</span>
              <span className="text-xs text-memori-tertiary font-serif italic hidden sm:inline">personal life OS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="primary" size="sm">Create Vault</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Editorial Hero & Thesis */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 lg:py-24 space-y-24">
        {/* Thesis Statement */}
        <section className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-badge border border-memori-border bg-memori-surface px-3 py-1 text-xs font-mono text-memori-secondary">
            <span>COGNITIVE EXTERNALIZATION</span>
            <span>•</span>
            <span className="text-accent-dark">ZERO-KNOWLEDGE PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.1]">
            Your life is scattered across drawers, emails, and apps.
            <br />
            <span className="font-serif font-normal italic text-memori-secondary">
              Let your mind stop holding the index.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-memori-secondary leading-relaxed max-w-2xl">
            Human working memory holds only four items at a time. The rest is cognitive background friction. 
            MEMORI is an immutable, client-side encrypted operating system that maps your entire administrative reality into one verifiable index.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link to="/auth">
              <Button size="lg" variant="primary" className="gap-2 text-sm font-semibold">
                <span>Initialize Your Life Map</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <span className="text-xs font-mono text-memori-tertiary">
              100% Free • Zero Paid APIs • No Lock-In
            </span>
          </div>
        </section>

        {/* Structural Interactive Preview / Architecture */}
        <section className="border border-memori-border rounded-card bg-memori-surface p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-memori-border pb-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary font-mono">
                The 7 Life Domains
              </h3>
              <p className="text-xs text-memori-secondary mt-0.5">
                Every administrative record in an adult life maps deterministically into seven structured categories.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-memori-secondary bg-memori-subtle px-3 py-1.5 rounded border border-memori-border">
              <Lock className="w-3.5 h-3.5 text-emerald-800" />
              <span>AES-GCM-256 Client-Side Encrypted</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-btn border border-memori-border/80 bg-memori-bg/50 space-y-2">
              <div className="text-xs font-bold text-primary font-mono">01. IDENTITY</div>
              <p className="text-xs text-memori-secondary leading-relaxed">
                Passports, national ID numbers, birth records, citizenship certificates, voter registrations.
              </p>
            </div>

            <div className="p-4 rounded-btn border border-memori-border/80 bg-memori-bg/50 space-y-2">
              <div className="text-xs font-bold text-primary font-mono">02. MONEY & ACCOUNTS</div>
              <p className="text-xs text-memori-secondary leading-relaxed">
                Primary bank accounts, retirement pensions, brokerage accounts, life insurance policies, tax filings.
              </p>
            </div>

            <div className="p-4 rounded-btn border border-memori-border/80 bg-memori-bg/50 space-y-2">
              <div className="text-xs font-bold text-primary font-mono">03. ASSETS & PROPERTY</div>
              <p className="text-xs text-memori-secondary leading-relaxed">
                Real estate deeds, vehicle registrations, warranty cards, physical locker keys, lease agreements.
              </p>
            </div>

            <div className="p-4 rounded-btn border border-memori-border/80 bg-memori-bg/50 space-y-2">
              <div className="text-xs font-bold text-primary font-mono">04. DIGITAL RECOVERY</div>
              <p className="text-xs text-memori-secondary leading-relaxed">
                2FA backup seeds, password manager emergency kits, domain registries, recovery key vault locations.
              </p>
            </div>
          </div>
        </section>

        {/* The 3 Zero Principles */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-btn bg-memori-subtle border border-memori-border flex items-center justify-center text-primary">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-primary">Zero-Knowledge Architecture</h4>
            <p className="text-xs text-memori-secondary leading-relaxed">
              Your sensitive document numbers and notes are encrypted on your device using PBKDF2 (100,000 SHA-512 iterations) + AES-GCM-256 before any data is sent. The server never holds your keys.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-9 h-9 rounded-btn bg-memori-subtle border border-memori-border flex items-center justify-center text-primary">
              <WifiOff className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-primary">Offline-First IndexedDB Engine</h4>
            <p className="text-xs text-memori-secondary leading-relaxed">
              No internet? No problem. MEMORI writes locally to your browser’s IndexedDB database and seamlessly synchronizes with Lamport clocks when connectivity returns.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-9 h-9 rounded-btn bg-memori-subtle border border-memori-border flex items-center justify-center text-primary">
              <HardDrive className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-primary">Decoupled Vault Indexing</h4>
            <p className="text-xs text-memori-secondary leading-relaxed">
              Never hunt for a physical deed or cold-storage USB drive again. MEMORI separates the index from the storage, linking physical shelves, safes, and cloud URIs to each item.
            </p>
          </div>
        </section>

        {/* Final Editorial Callout */}
        <section className="border-t border-memori-border pt-12 text-center space-y-4 max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-primary">Ready to externalize your administrative index?</h3>
          <p className="text-xs text-memori-secondary">
            Zero sign-up cost. Zero ads. Export your data as raw structured JSON anytime.
          </p>
          <div className="pt-2">
            <Link to="/auth">
              <Button size="lg" variant="primary" className="gap-2">
                <span>Create Your Encrypted Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-memori-border bg-memori-surface py-8 text-center text-xs text-memori-tertiary">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <img src="/logo.svg" alt="MEMORI" className="w-4 h-4" />
            <span>MEMORI — Built for human autonomy.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>AES-GCM-256</span>
            <span>•</span>
            <span>IndexedDB PWA</span>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
