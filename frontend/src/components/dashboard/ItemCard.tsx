import React from 'react';
import { Item } from '../../../../shared/types';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { CATEGORIES } from '../../lib/constants';
import { formatDate, isExpiringSoon, isPastDate } from '../../lib/utils';
import { Calendar, MapPin, Link2, Tag, Lock } from 'lucide-react';

export function ItemCard({
  item,
  onClick,
}: {
  item: Item;
  onClick: () => void;
}) {
  const categoryMeta = CATEGORIES.find(c => c.id === item.category);
  const expiring = isExpiringSoon(item.expiry_date);
  const expired = isPastDate(item.expiry_date);

  return (
    <Card
      onClick={onClick}
      className="group relative flex flex-col justify-between hover:border-primary/40 hover:shadow-card-hover transition-all duration-200"
    >
      <div className="space-y-3">
        {/* Top bar: Category chip & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-memori-secondary bg-memori-bg px-2 py-0.5 rounded-md border border-memori-border/60">
            {categoryMeta?.label || item.category}
          </span>
          <StatusBadge status={item.status} />
        </div>

        {/* Title & Subcategory */}
        <div>
          <h3 className="text-base font-bold text-primary tracking-tight group-hover:text-primary-light transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.subcategory && (
            <p className="text-xs text-memori-secondary mt-0.5">
              {item.subcategory}
            </p>
          )}
        </div>

        {/* Description / Notes snippet */}
        {item.description && (
          <p className="text-xs text-memori-secondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Metadata footer */}
      <div className="mt-4 pt-3 border-t border-memori-border/60 space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-memori-secondary">
          {/* Expiry Date */}
          {item.expiry_date && (
            <div className={`flex items-center gap-1 font-medium ${expired ? 'text-memori-error font-semibold' : expiring ? 'text-amber-700 font-semibold' : ''}`}>
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{expired ? 'Expired ' : expiring ? 'Expiring ' : 'Exp: '}{formatDate(item.expiry_date)}</span>
            </div>
          )}

          {/* Location reference */}
          {(item.physical_location || item.location?.name) && (
            <div className="flex items-center gap-1 text-memori-secondary truncate max-w-[180px]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-accent-dark" />
              <span className="truncate">{item.location?.name || item.physical_location}</span>
            </div>
          )}

          {/* Digital Link indicator */}
          {item.digital_copy_uri && (
            <div className="flex items-center gap-1 text-primary">
              <Link2 className="w-3.5 h-3.5 shrink-0" />
              <span>Digital Copy</span>
            </div>
          )}

          {/* Encrypted Vault Data indicator */}
          {item.sensitive_data && (
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-medium" title="Client-Side Encrypted Secrets">
              <Lock className="w-3 h-3 shrink-0" />
              <span>Encrypted</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 rounded bg-memori-bg px-1.5 py-0.5 text-[10px] text-memori-secondary border border-memori-border/50"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[10px] text-memori-tertiary">+{item.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
