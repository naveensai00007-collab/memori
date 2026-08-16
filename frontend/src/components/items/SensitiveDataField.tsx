import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { encryptSensitive, decryptSensitive } from '../../lib/encryption';
import { Button } from '../ui/Button';
import { Lock, Plus, Trash2, ShieldCheck } from 'lucide-react';

interface KeyValuePair {
  key: string;
  value: string;
}

export function SensitiveDataField({
  value,
  onChange,
  isEditing = false,
}: {
  value?: string | null;
  onChange?: (encryptedValue: string) => void;
  isEditing?: boolean;
}) {
  const { encryptionPassword, user } = useAuthStore();
  const [pairs, setPairs] = useState<KeyValuePair[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Decrypt when value or password is ready
  useEffect(() => {
    let isMounted = true;
    async function performDecrypt() {
      if (!value) {
        setPairs([]);
        return;
      }

      if (!encryptionPassword || !user?.encryption_salt) {
        return;
      }

      try {
        const decryptedObj = await decryptSensitive(value, encryptionPassword, user.encryption_salt);
        if (isMounted) {
          const formattedPairs = Object.entries(decryptedObj).map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
          setPairs(formattedPairs);
        }
      } catch (err) {
        if (isMounted) {
          setError('Decryption failed. Verify your encryption key.');
        }
      }
    }

    performDecrypt();
    return () => {
      isMounted = false;
    };
  }, [value, encryptionPassword, user?.encryption_salt]);

  // Handle updates during edit mode
  const handlePairChange = async (index: number, field: 'key' | 'value', text: string) => {
    const updated = [...pairs];
    updated[index][field] = text;
    setPairs(updated);

    if (onChange && encryptionPassword && user?.encryption_salt) {
      const obj: Record<string, string> = {};
      updated.forEach(p => {
        if (p.key.trim()) {
          obj[p.key.trim()] = p.value;
        }
      });
      const encrypted = await encryptSensitive(obj, encryptionPassword, user.encryption_salt);
      onChange(encrypted);
    }
  };

  const addPair = () => {
    setPairs([...pairs, { key: '', value: '' }]);
  };

  const removePair = async (index: number) => {
    const updated = pairs.filter((_, i) => i !== index);
    setPairs(updated);

    if (onChange && encryptionPassword && user?.encryption_salt) {
      const obj: Record<string, string> = {};
      updated.forEach(p => {
        if (p.key.trim()) {
          obj[p.key.trim()] = p.value;
        }
      });
      const encrypted = await encryptSensitive(obj, encryptionPassword, user.encryption_salt);
      onChange(encrypted);
    }
  };

  if (!isEditing && !value) {
    return (
      <div className="text-xs text-memori-tertiary font-serif italic">
        No zero-knowledge encrypted attributes recorded for this item.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-btn border border-memori-border/80 bg-memori-bg/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-800" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
            Zero-Knowledge Encrypted Secrets
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          AES-GCM-256
        </span>
      </div>

      {error && (
        <div className="text-xs text-rose-800 font-mono bg-rose-50 p-2 rounded">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2 pt-1">
          {pairs.map((pair, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Field name (e.g. Passport Number, Policy ID)"
                value={pair.key}
                onChange={(e) => handlePairChange(idx, 'key', e.target.value)}
                className="w-2/5 h-8 rounded-input border border-memori-border bg-memori-surface px-2.5 text-xs text-memori-text focus:border-accent focus:outline-none"
              />
              <input
                type="text"
                placeholder="Encrypted secret value"
                value={pair.value}
                onChange={(e) => handlePairChange(idx, 'value', e.target.value)}
                className="flex-1 h-8 rounded-input border border-memori-border bg-memori-surface px-2.5 text-xs font-mono text-memori-text focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removePair(idx)}
                className="p-1 text-memori-tertiary hover:text-memori-error rounded"
                title="Remove Secret"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addPair}
            className="gap-1 text-xs h-7 mt-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Encrypted Secret</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {pairs.length > 0 ? (
            pairs.map((pair, idx) => (
              <div
                key={idx}
                className="flex items-baseline justify-between rounded bg-memori-surface p-2.5 border border-memori-border/60 text-xs"
              >
                <span className="font-semibold text-memori-secondary text-[11px] uppercase tracking-wider">
                  {pair.key}:
                </span>
                <span className="font-mono text-primary font-bold selection:bg-accent/40">
                  {pair.value}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-memori-secondary italic">
              Encrypted payload stored securely. Decrypting...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
