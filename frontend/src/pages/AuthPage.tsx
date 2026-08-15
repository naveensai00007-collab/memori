import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Lock, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import zxcvbn from 'zxcvbn';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isAuthenticated, isLoading } = useAuthStore();

  const [isRegister, setIsRegister] = useState(searchParams.get('register') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Evaluate password strength with zxcvbn
  const passwordStrength = password ? zxcvbn(password) : null;
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and master password.');
      return;
    }

    if (isRegister && password.length < 8) {
      setError('Master password must be at least 8 characters long.');
      return;
    }

    try {
      if (isRegister) {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Authentication failed.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-memori-bg flex flex-col items-center justify-center p-4 selection:bg-accent/30">
      {/* Brand Header */}
      <div className="mb-6 text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/logo.svg" alt="MEMORI" className="w-10 h-10" />
          <span className="text-2xl font-bold tracking-tight text-primary font-mono">MEMORI</span>
        </Link>
        <p className="text-xs text-memori-secondary">
          Your life. Organized. Remembered.
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-[420px] p-6 sm:p-8 bg-memori-surface shadow-modal border-memori-border">
        {/* Toggle Login / Register */}
        <div className="flex rounded-btn bg-memori-bg p-1 border border-memori-border mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 rounded-btn py-2 text-xs font-semibold transition-all ${
              !isRegister
                ? 'bg-memori-surface text-primary shadow-xs'
                : 'text-memori-secondary hover:text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 rounded-btn py-2 text-xs font-semibold transition-all ${
              isRegister
                ? 'bg-memori-surface text-primary shadow-xs'
                : 'text-memori-secondary hover:text-primary'
            }`}
          >
            Create Vault
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-memori-secondary">
                Master Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-memori-secondary hover:text-primary flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-4 text-sm text-memori-text focus:border-accent focus:outline-none"
            />
          </div>

          {/* Password Strength Meter (Registration only) */}
          {isRegister && password && passwordStrength && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-memori-secondary">
                <span>Strength: <strong>{strengthLabels[passwordStrength.score]}</strong></span>
                <span>{passwordStrength.score >= 3 ? '✓ Secure' : 'Min 8 chars'}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-memori-border/50 rounded-full overflow-hidden">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all ${
                      passwordStrength.score >= step + 1
                        ? strengthColors[passwordStrength.score]
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs text-memori-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2 h-12"
          >
            {isRegister ? 'Create Encrypted Vault' : 'Open My Life Map'}
          </Button>
        </form>

        {/* Security & Privacy Badge */}
        <div className="mt-6 pt-4 border-t border-memori-border/60 flex items-center justify-center gap-2 text-[11px] text-memori-secondary text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Client-side zero-knowledge encrypted. We never see your data.</span>
        </div>
      </Card>
    </div>
  );
}
