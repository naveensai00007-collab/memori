import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import zxcvbn from 'zxcvbn';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordScore = isRegister && password ? zxcvbn(password).score : 0;
  const scoreLabels = ['Critical Risk', 'Weak', 'Fair', 'Strong', 'Cryptographically Robust'];
  const scoreColors = ['bg-rose-700', 'bg-rose-500', 'bg-amber-600', 'bg-emerald-600', 'bg-emerald-800'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (password.length < 8) {
          throw new Error('Master password must be at least 8 characters long');
        }
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-memori-bg text-memori-text flex flex-col justify-between selection:bg-accent/25 p-4 sm:p-6">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto pt-6 sm:pt-12 text-center space-y-2">
        <div className="flex justify-center mb-3">
          <img src="/logo.svg" alt="MEMORI" className="w-12 h-12" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-primary font-mono">
          MEMORI
        </h1>
        <p className="text-xs text-memori-secondary">
          {isRegister
            ? 'Initialize your personal zero-knowledge life vault'
            : 'Unlock your client-side encrypted life map'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <Card className="p-6 sm:p-8 bg-memori-surface shadow-card border-memori-border">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 rounded-btn bg-memori-subtle p-1 border border-memori-border/60 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-btn transition-all duration-120 ${
                !isRegister
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-memori-secondary hover:text-primary'
              }`}
            >
              Unlock Vault
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-btn transition-all duration-120 ${
                isRegister
                  ? 'bg-primary text-white shadow-xs'
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
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-memori-secondary">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-memori-tertiary hover:text-primary flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-xs font-mono text-memori-text placeholder:text-memori-tertiary focus:border-accent focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Password Strength Meter (Only for Register) */}
              {isRegister && password.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-memori-secondary">Key Entropy:</span>
                    <span className="font-semibold text-primary">{scoreLabels[passwordScore]}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full h-full transition-all ${
                          passwordScore >= step + 1 ? scoreColors[passwordScore] : 'bg-memori-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-memori-tertiary">
                    Your master password derives your AES-GCM-256 key via PBKDF2 with 100,000 SHA-512 iterations.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-2.5 rounded-btn bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-semibold"
              isLoading={isLoading}
            >
              {isRegister ? 'Generate Encrypted Vault' : 'Decrypt & Enter Vault'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Monastic Privacy Footer */}
      <div className="text-center pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-memori-tertiary font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>Zero-Knowledge Proof: Passwords and keys never touch the network unencrypted.</span>
        </div>
      </div>
    </div>
  );
}
