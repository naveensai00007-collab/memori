import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { generateSaltBase64 } from '../lib/encryption';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { 
  User, 
  Lock, 
  Bell, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Check, 
  AlertTriangle,
  FileJson
} from 'lucide-react';

export function SettingsPage() {
  const { user, updateSettings, logout } = useAuthStore();

  // Settings local state
  const [reminderEmail, setReminderEmail] = useState(user?.settings?.reminder_email ?? true);
  const [reviewInterval, setReviewInterval] = useState(user?.settings?.review_interval ?? 30);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Delete state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSettings({
        reminder_email: reminderEmail,
        review_interval: Number(reviewInterval),
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New master password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const newSalt = generateSaltBase64();
      await authApi.changePassword(oldPassword, newPassword, newSalt);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error?.message || err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await authApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memori-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export data: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Master password is required.');
      return;
    }

    setIsDeleting(true);
    try {
      await authApi.deleteAccount(deletePassword);
      logout();
      window.location.href = '/auth';
    } catch (err: any) {
      setDeleteError(err.response?.data?.error?.message || err.message || 'Account deletion failed.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-memori-border pb-4">
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          Settings & Security
        </h1>
        <p className="text-xs text-memori-secondary mt-1">
          Manage your encryption keys, notification cadence, and backup exports.
        </p>
      </div>

      {/* Profile & Notifications */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-base font-bold text-primary">
          <User className="w-5 h-5 text-accent-dark" />
          <h3>Account & Preferences</h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            className="bg-memori-bg opacity-75"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-memori-secondary">
              Life Review Cadence
            </label>
            <select
              value={reviewInterval}
              onChange={(e) => setReviewInterval(Number(e.target.value))}
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
            >
              <option value={7}>Weekly (Every 7 days)</option>
              <option value={14}>Bi-Weekly (Every 14 days)</option>
              <option value={30}>Monthly (Every 30 days)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-memori-border/50">
            <div>
              <span className="text-xs font-semibold text-primary block">Smart Email Reminders</span>
              <span className="text-[11px] text-memori-secondary">
                Receive proactive email alerts before passport and policy expirations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={reminderEmail}
              onChange={(e) => setReminderEmail(e.target.checked)}
              className="w-4 h-4 rounded border-memori-border text-primary focus:ring-accent"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            {settingsSuccess ? (
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Settings saved!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" size="sm" isLoading={isSavingSettings}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Master Password Change */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-base font-bold text-primary">
          <Lock className="w-5 h-5 text-accent-dark" />
          <h3>Master Password & Encryption Key</h3>
        </div>

        <p className="text-xs text-memori-secondary">
          Changing your master password will re-derive your client-side encryption key using 100,000 PBKDF2 iterations.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
          <Input
            label="Current Master Password"
            type="password"
            placeholder="••••••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <Input
            label="New Master Password (min 8 characters)"
            type="password"
            placeholder="••••••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          {passwordError && (
            <p className="text-xs text-memori-error font-medium">{passwordError}</p>
          )}

          {passwordSuccess && (
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Master password changed successfully!
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" isLoading={isChangingPassword}>
              Update Master Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Data Export */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-base font-bold text-primary">
          <Download className="w-5 h-5 text-accent-dark" />
          <h3>Export Personal Data</h3>
        </div>

        <p className="text-xs text-memori-secondary">
          Download your entire Life Map, Vault Index locations, and Smart Reminders in structured JSON format. Zero lock-in.
        </p>

        <div className="pt-2 flex justify-start">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportData}
            isLoading={isExporting}
            className="gap-2"
          >
            <FileJson className="w-4 h-4" />
            <span>Download Encrypted Backup (JSON)</span>
          </Button>
        </div>
      </Card>

      {/* Destructive Zone */}
      <Card className="p-6 space-y-4 border-red-200 bg-red-50/40">
        <div className="flex items-center gap-2.5 text-base font-bold text-memori-error">
          <Trash2 className="w-5 h-5" />
          <h3>Danger Zone: Delete Vault</h3>
        </div>

        <p className="text-xs text-memori-secondary">
          Permanently destroy your MEMORI account, all Life Map items, vault index mappings, and encrypted secrets. This action is irreversible.
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account & Vault
          </Button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-3 pt-2 max-w-md">
            <Input
              label="Enter Master Password to Confirm Deletion"
              type="password"
              placeholder="••••••••••••"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              error={deleteError || undefined}
              required
            />

            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" variant="destructive" size="sm" isLoading={isDeleting}>
                Permanently Delete Everything
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
