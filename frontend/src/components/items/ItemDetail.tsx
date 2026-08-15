import React, { useState } from 'react';
import { Item, Status } from '../../../../shared/types';
import { useUpdateItem, useDeleteItem, useMarkReviewed } from '../../hooks/useItems';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { SensitiveDataField } from './SensitiveDataField';
import { CATEGORIES, STATUSES } from '../../lib/constants';
import { formatDate, isExpiringSoon, isPastDate } from '../../lib/utils';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Tag, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  History,
  Lock
} from 'lucide-react';

export function ItemDetailModal({
  item,
  open,
  onClose,
}: {
  item: Item | null;
  open: boolean;
  onClose: () => void;
}) {
  const { openEditItemModal } = useUIStore();
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();
  const markReviewedMutation = useMarkReviewed();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!item) return null;

  const catMeta = CATEGORIES.find(c => c.id === item.category);
  const expiring = isExpiringSoon(item.expiry_date);
  const expired = isPastDate(item.expiry_date);

  const handleStatusChange = async (newStatus: Status) => {
    await updateMutation.mutateAsync({
      id: item.id,
      data: { status: newStatus },
    });
  };

  const handleMarkReviewed = async () => {
    await markReviewedMutation.mutateAsync(item.id);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(item.id);
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 pt-1">
        {/* Header: Category, Title, and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-memori-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-memori-secondary bg-memori-bg px-2.5 py-0.5 rounded-md border border-memori-border">
                {catMeta?.label || item.category}
              </span>
              {item.subcategory && (
                <span className="text-xs text-memori-secondary">
                  • {item.subcategory}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              {item.title}
            </h2>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                openEditItemModal(item);
              }}
              className="gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmingDelete(true)}
              className="text-memori-error hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {isConfirmingDelete && (
          <div className="rounded-card border border-red-200 bg-red-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-memori-error font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you sure you want to delete this record?</span>
            </div>
            <p className="text-xs text-memori-secondary">
              This will remove the item from your Life Map and delete associated reminders.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                Yes, Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* 2-Column Specification Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Columns: Main Info, Secrets, Notes */}
          <div className="md:col-span-2 space-y-5">
            {/* Status Dropdown selector */}
            <div className="rounded-card border border-memori-border bg-memori-surface p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-memori-secondary uppercase tracking-wider block mb-1">
                  Life Status
                </span>
                <StatusBadge status={item.status} />
              </div>
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                className="rounded-input border border-memori-border bg-memori-bg px-3 py-1.5 text-xs text-primary font-medium focus:border-accent focus:outline-none"
              >
                {STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Zero-Knowledge Encrypted Secrets Viewer */}
            <SensitiveDataField
              encryptedPayload={item.sensitive_data}
              onChange={async (newEncrypted) => {
                await updateMutation.mutateAsync({
                  id: item.id,
                  data: { sensitive_data: newEncrypted },
                });
              }}
              suggestedFields={catMeta?.suggestedSensitiveFields}
            />

            {/* Notes & Description */}
            <div className="rounded-card border border-memori-border bg-memori-surface p-4 space-y-2">
              <h4 className="text-xs font-semibold text-memori-secondary uppercase tracking-wider">
                Notes & Instructions
              </h4>
              <p className="text-sm text-memori-text whitespace-pre-wrap leading-relaxed">
                {item.description || item.notes || 'No extra notes recorded for this item.'}
              </p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-memori-secondary uppercase tracking-wider block">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded bg-memori-bg px-2 py-0.5 text-xs text-memori-secondary border border-memori-border"
                    >
                      <Tag className="w-3 h-3 opacity-60" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Vault Index & Timeline */}
          <div className="space-y-5">
            {/* Vault Index Card */}
            <div className="rounded-card border border-memori-border bg-memori-surface p-4 space-y-3">
              <h4 className="text-xs font-semibold text-memori-secondary uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent-dark" />
                Vault Index
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-memori-secondary block">Physical Location:</span>
                  <span className="font-semibold text-primary">
                    {item.location?.name || item.physical_location || 'Not specified'}
                  </span>
                </div>

                {item.digital_copy_uri && (
                  <div className="pt-2 border-t border-memori-border/50">
                    <span className="text-memori-secondary block mb-1">Digital Copy:</span>
                    <a
                      href={item.digital_copy_uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent-dark font-medium hover:underline break-all"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Expiry & Reminders Card */}
            <div className="rounded-card border border-memori-border bg-memori-surface p-4 space-y-3">
              <h4 className="text-xs font-semibold text-memori-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-dark" />
                Dates & Renewal
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-memori-secondary block">Expiry Date:</span>
                  <span className={`font-semibold ${expired ? 'text-memori-error' : expiring ? 'text-amber-700' : 'text-primary'}`}>
                    {formatDate(item.expiry_date)}
                  </span>
                </div>

                {item.reminder_date && (
                  <div>
                    <span className="text-memori-secondary block">Next Reminder:</span>
                    <span className="font-semibold text-primary">{formatDate(item.reminder_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline & Life Review Check */}
            <div className="rounded-card border border-memori-border bg-memori-surface p-4 space-y-3">
              <h4 className="text-xs font-semibold text-memori-secondary uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Timeline & Review
              </h4>

              <div className="space-y-2 text-[11px] text-memori-secondary">
                <div>Created: {formatDate(item.created_at)}</div>
                <div>Updated: {formatDate(item.updated_at)}</div>
                <div>Last Reviewed: {item.last_reviewed_at ? formatDate(item.last_reviewed_at) : 'Never'}</div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkReviewed}
                isLoading={markReviewedMutation.isPending}
                className="w-full gap-1.5 text-xs h-9 mt-2"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark as Reviewed</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
