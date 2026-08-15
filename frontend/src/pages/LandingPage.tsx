import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  Compass, 
  CheckCircle2, 
  Bell, 
  Lock, 
  HardDrive, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-memori-bg text-memori-text flex flex-col selection:bg-accent/30">
      {/* Public Header */}
      <header className="sticky top-0 z-30 border-b border-memori-border bg-memori-surface/90 backdrop-blur-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="MEMORI Logo" className="w-9 h-9" />
            <span className="text-xl font-bold tracking-tight text-primary font-mono">MEMORI</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?register=true">
              <Button variant="primary" size="sm" className="gap-1.5">
                <span>Start Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-6 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5 text-accent-dark" />
            <span>Zero-Cost • Zero-Knowledge • Privacy-First</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-primary tracking-tight leading-tight">
            Your life. Organized. <br />
            <span className="text-accent-dark">Remembered.</span>
          </h1>

          <p className="text-base sm:text-xl text-memori-secondary max-w-2xl mx-auto leading-relaxed">
            Eliminate cognitive overload and administrative chaos. Transform scattered documents, policies, accounts, and keys into a structured, searchable Life Map.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth?register=true" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 text-base px-8 h-14">
                <span>Start Your Life Map</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a
              href="#pillars"
              className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-6 text-sm font-semibold text-memori-secondary hover:text-primary rounded-btn border border-memori-border hover:bg-memori-surface transition-colors"
            >
              Explore Architecture
            </a>
          </div>

          {/* Trust Badges */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
            <div className="rounded-card border border-memori-border bg-memori-surface p-4 flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-primary">Client-Side Encrypted</div>
                <div className="text-memori-secondary">AES-GCM-256 in your browser</div>
              </div>
            </div>

            <div className="rounded-card border border-memori-border bg-memori-surface p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-2 text-blue-700">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-primary">Offline-First PWA</div>
                <div className="text-memori-secondary">IndexedDB local resilience</div>
              </div>
            </div>

            <div className="rounded-card border border-memori-border bg-memori-surface p-4 flex items-center gap-3">
              <div className="rounded-full bg-amber-50 p-2 text-amber-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-primary">100% Free & Open</div>
                <div className="text-memori-secondary">Zero paid APIs or lock-in</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Pillars */}
        <section id="pillars" className="py-16 px-6 bg-memori-surface border-y border-memori-border">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Designed to Free Your Working Memory
              </h2>
              <p className="text-sm text-memori-secondary">
                Human working memory holds only 4 chunks. MEMORI externalizes your life index so you never have to ask "what am I forgetting?"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="rounded-card border border-memori-border bg-memori-bg p-6 space-y-4">
                <div className="rounded-xl bg-primary text-white p-3 w-fit">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-primary">1. Discover Everything</h3>
                <p className="text-xs text-memori-secondary leading-relaxed">
                  Systematically categorize Identity, Education, Finance, Digital assets, Property deeds, and Government records into structured life domains.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-card border border-memori-border bg-memori-bg p-6 space-y-4">
                <div className="rounded-xl bg-accent text-primary p-3 w-fit">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-primary">2. Know Status Instantly</h3>
                <p className="text-xs text-memori-secondary leading-relaxed">
                  Clear visual signals (Complete, Missing, Needs Attention) show your life readiness score in sub-second glanceable dashboards.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-card border border-memori-border bg-memori-bg p-6 space-y-4">
                <div className="rounded-xl bg-status-complete text-white p-3 w-fit">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-primary">3. Remember Automatically</h3>
                <p className="text-xs text-memori-secondary leading-relaxed">
                  Proactive smart reminders for passport expiries, policy renewals, and guided monthly Life Reviews before deadlines become emergencies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Zero-Trust Promise */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
          <div className="rounded-card border border-memori-border bg-memori-surface p-8 sm:p-12 space-y-6 shadow-card">
            <div className="mx-auto rounded-full bg-primary/10 p-4 text-primary w-fit">
              <Database className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Zero-Trust by Design. Your Data Stays Yours.
            </h2>
            <p className="text-sm text-memori-secondary max-w-2xl mx-auto leading-relaxed">
              We believe your personal documents and financial IDs should never exist as readable plaintext on any cloud server. MEMORI derives cryptographic keys directly from your master password using 100,000 PBKDF2 iterations.
            </p>
            <div className="pt-2">
              <Link to="/auth?register=true">
                <Button variant="primary" size="md" className="gap-2">
                  <span>Create Encrypted Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-memori-border bg-memori-surface py-8 px-6 text-center text-xs text-memori-secondary">
        <p>© {new Date().getFullYear()} MEMORI. Fully open-source and self-hostable. Your life. Organized. Remembered.</p>
      </footer>
    </div>
  );
}
