import React from 'react';
import { Item } from '../../../../shared/types';
import { useMarkReviewed, useDeleteItem } from '../../hooks/useItems';
import { useUIStore } from '../../stores/uiStore';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SensitiveDataField } from './SensitiveDataField';
import { CATEGORIES } from '../../lib/constants';
import { formatDate, isExpiringSoon, isPastDate } from '../../lib/utils';
import { 
  Calendar, 
  MapPin, 
  Link2, 
  Tag, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Clock
} from 'lucide-react';

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
}: {
  item?: Item | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { openEditItemModal } = useUIStore();
  const reviewMutation = useMarkReviewed();
  const deleteMutation = useDeleteItem();

  if (!item) return null;

  const categoryMeta = CATEGORIES.find(c => c.id === item.category);
  const expiring = isExpiringSoon(item.expiry_date);
  const expired = isPastDate(item.expiry_date);

  const handleReview = async () => {
    await reviewMutation.mutateAsync(item.id);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently remove "${item.title}" from your Life Map?`)) {
      await deleteMutation.mutateAsync(item.id);
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={item.title}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Metadata Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-memori-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-memori-secondary bg-memori-subtle px-2.5 py-1 rounded border border-memori-border/60">
              {categoryMeta?.label || item.category}
            </span>
            {item.subcategory && (
              <span className="text-xs text-memori-secondary font-medium">
                / {item.subcategory}
              </span>
            )}
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* 2-Column Architectural Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Description & Notes (2 Cols) */}
          <div className="md:col-span-2 space-y-4">
            {item.description ? (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                  Description / Purpose
                </span>
                <p className="text-xs text-primary leading-relaxed">
                  {item.description}
                </p>
              </div>
            ) : null}

            {item.notes ? (
              <div className="space-y-1 bg-memori-subtle/50 p-3 rounded-btn border border-memori-border/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                  Administrative Notes & Context
                </span>
                <p className="text-xs text-memori-secondary leading-relaxed whitespace-pre-wrap">
                  {item.notes}
                </p>
              </div>
            ) : null}

            {/* Zero-Knowledge Encrypted Secrets Field */}
            <SensitiveDataField value={item.sensitive_data} isEditing={false} />
          </div>

          {/* Sidebar Metadata (1 Col) */}
          <div className="space-y-4 border-t md:border-t-0 md:border-l border-memori-border pt-4 md:pt-0 md:pl-5">
            {/* Vault Location */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                Physical / Vault Location
              </span>
              <div className="flex items-start gap-1.5 text-xs text-primary font-medium">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span>{item.location?.name || item.physical_location || 'Not mapped yet'}</span>
              </div>
            </div>

            {/* Digital URI */}
            {item.digital_copy_uri && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                  Digital Storage URI
                </span>
                <a
                  href={item.digital_copy_uri}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-accent-dark hover:underline truncate"
                >
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.digital_copy_uri}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}

            {/* Expiry Date */}
            {item.expiry_date && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                  Expiration Date
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${expired ? 'text-rose-800' : expiring ? 'text-amber-800' : 'text-primary'}`}>
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatDate(item.expiry_date)}</span>
                </div>
              </div>
            )}

            {/* Last Reviewed */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                Last Verified
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-memori-secondary">
                <Clock className="w-3.5 h-3.5 shrink-0 text-memori-tertiary" />
                <span>{item.last_reviewed_at ? formatDate(item.last_reviewed_at) : 'Never verified'}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-0.5 rounded bg-memori-subtle px-2 py-0.5 text-[10px] text-memori-secondary border border-memori-border/60"
                    >
                      <Tag className="w-2.5 h-2.5 opacity-50" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-memori-border pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReview}
            isLoading={reviewMutation.isPending}
            className="gap-1.5 text-xs text-emerald-900 border-emerald-800/30 hover:bg-emerald-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
            <span>Mark Reviewed Today</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                openEditItemModal(item);
              }}
              className="gap-1.5 text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              className="gap-1.5 text-xs text-rose-800 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
