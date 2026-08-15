import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { encryptSensitive, decryptSensitive } from '../../lib/encryption';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Lock, Unlock, Eye, EyeOff, Plus, Trash2, ShieldCheck, Key } from 'lucide-react';

export function SensitiveDataField({
  encryptedPayload,
  onChange,
  suggestedFields = [],
}: {
  encryptedPayload?: string | null;
  onChange: (newEncryptedPayload: string) => void;
  suggestedFields?: { key: string; label: string; placeholder: string }[];
}) {
  const { encryptionPassword, user } = useAuthStore();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [tempPassword, setTempPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const activePassword = encryptionPassword || tempPassword;

  // Decrypt when unlocked
  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activePassword) {
      setError('Master password is required to decrypt.');
      return;
    }
    if (!user?.encryption_salt) {
      setError('Missing encryption salt.');
      return;
    }

    try {
      setError(null);
      if (encryptedPayload && encryptedPayload.trim()) {
        const decrypted = await decryptSensitive(encryptedPayload, activePassword, user.encryption_salt);
        setFields(decrypted);
      } else {
        setFields({});
      }
      setIsUnlocked(true);
    } catch (err) {
      setError('Decryption failed. Incorrect master password.');
    }
  };

  // Automatically attempt unlock if encryptionPassword is already held in memory
  useEffect(() => {
    if (encryptionPassword && user?.encryption_salt && !isUnlocked && encryptedPayload) {
      handleUnlock();
    }
  }, [encryptionPassword, user]);

  const handleFieldChange = async (key: string, value: string) => {
    const updated = { ...fields, [key]: value };
    if (!value.trim()) {
      delete updated[key];
    }
    setFields(updated);

    if (activePassword && user?.encryption_salt) {
      setIsEncrypting(true);
      try {
        const encrypted = await encryptSensitive(updated, activePassword, user.encryption_salt);
        onChange(encrypted);
      } finally {
        setIsEncrypting(false);
      }
    }
  };

  const handleAddField = (key: string) => {
    if (!fields[key]) {
      setFields({ ...fields, [key]: '' });
    }
  };

  const handleRemoveField = async (key: string) => {
    const updated = { ...fields };
    delete updated[key];
    setFields(updated);

    if (activePassword && user?.encryption_salt) {
      const encrypted = await encryptSensitive(updated, activePassword, user.encryption_salt);
      onChange(encrypted);
    }
  };

  return (
    <div className="rounded-card border border-memori-border bg-memori-bg/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-100 p-1.5 text-emerald-800">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary">Zero-Knowledge Encrypted Secrets</h4>
            <p className="text-[11px] text-memori-secondary">
              Encrypted in your browser with AES-GCM-256 before leaving your device.
            </p>
          </div>
        </div>

        {isUnlocked && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Decrypted Locally
          </span>
        )}
      </div>

      {!isUnlocked ? (
        <div className="pt-2">
          {encryptedPayload ? (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="password"
                placeholder="Enter master password to unlock secrets..."
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="h-10 w-full rounded-input border border-memori-border bg-memori-surface px-3 text-xs focus:border-accent focus:outline-none"
              />
              <Button type="button" size="sm" onClick={() => handleUnlock()} className="whitespace-nowrap w-full sm:w-auto">
                <Unlock className="w-3.5 h-3.5 mr-1" />
                Unlock Secrets
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsUnlocked(true);
              }}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Encrypted Sensitive Fields
            </Button>
          )}

          {error && <p className="text-xs text-memori-error font-medium mt-1">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {/* List of active fields */}
          {Object.entries(fields).map(([k, v]) => {
            const fieldMeta = suggestedFields.find(s => s.key === k);
            return (
              <div key={k} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    label={fieldMeta?.label || k.replace(/_/g, ' ').toUpperCase()}
                    value={v}
                    onChange={(e) => handleFieldChange(k, e.target.value)}
                    placeholder={fieldMeta?.placeholder || `Enter ${k}...`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveField(k)}
                  className="mt-6 p-2 text-memori-tertiary hover:text-memori-error transition-colors"
                  title="Remove Field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Suggested field triggers */}
          {suggestedFields.filter(s => !(s.key in fields)).length > 0 && (
            <div className="pt-2 border-t border-memori-border/50">
              <span className="text-[11px] font-medium text-memori-secondary block mb-1.5">
                Suggested Encrypted Attributes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedFields.filter(s => !(s.key in fields)).map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleAddField(s.key)}
                    className="rounded-full border border-memori-border bg-memori-surface px-2.5 py-0.5 text-xs text-memori-text hover:border-accent hover:text-accent-dark transition-colors"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
