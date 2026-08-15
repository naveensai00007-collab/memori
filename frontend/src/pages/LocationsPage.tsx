import React, { useState } from 'react';
import { useLocations, useDeleteLocation } from '../hooks/useLocations';
import { useUIStore } from '../stores/uiStore';
import { LocationForm } from '../components/locations/LocationForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Vault, Plus, MapPin, HardDrive, Cloud, Lock, Trash2, ExternalLink } from 'lucide-react';

export function LocationsPage() {
  const { data: locations, isLoading } = useLocations();
  const { setLocationModalOpen } = useUIStore();
  const deleteMutation = useDeleteLocation();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return <MapPin className="w-5 h-5 text-accent-dark" />;
      case 'digital': return <HardDrive className="w-5 h-5 text-emerald-600" />;
      case 'cloud': return <Cloud className="w-5 h-5 text-blue-600" />;
      default: return <Lock className="w-5 h-5 text-purple-600" />;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vault location? Items linked to it will not be deleted, but will be unlinked.')) {
      setDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-memori-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Vault Index
          </h1>
          <p className="text-xs text-memori-secondary mt-1">
            Map where your physical documents, safe boxes, USB keys, and cloud folders reside.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setLocationModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vault Location</span>
        </Button>
      </div>

      {/* Grid of Locations */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-card border border-memori-border bg-memori-surface p-5 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : !locations || locations.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-memori-border bg-memori-surface/50 p-12 text-center my-8">
          <div className="rounded-full bg-accent/20 p-4 text-accent-dark mx-auto w-fit mb-4">
            <Vault className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-primary">No Vault Locations Defined</h3>
          <p className="text-xs text-memori-secondary max-w-sm mx-auto mt-1 mb-6">
            Create named locations like "Master Safe", "Office Drawer", or "Google Drive Documents" to link with your items.
          </p>
          <Button variant="primary" onClick={() => setLocationModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Create First Location</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc: any) => (
            <Card key={loc.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-memori-bg p-2 border border-memori-border/60">
                      {getTypeIcon(loc.type)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-primary tracking-tight">
                        {loc.name}
                      </h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-memori-secondary capitalize">
                        {loc.type} Storage
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(loc.id)}
                    disabled={deletingId === loc.id}
                    className="p-1.5 text-memori-tertiary hover:text-memori-error hover:bg-red-50 rounded transition-colors"
                    title="Delete Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {loc.address && (
                  <p className="text-xs text-memori-secondary flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-memori-tertiary" />
                    <span>{loc.address}</span>
                  </p>
                )}

                {loc.uri_template && (
                  <a
                    href={loc.uri_template}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-dark font-medium hover:underline inline-flex items-center gap-1 break-all"
                  >
                    <span>{loc.uri_template}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}

                {loc.description && (
                  <p className="text-xs text-memori-text bg-memori-bg p-2.5 rounded-btn border border-memori-border/40">
                    {loc.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-memori-border/60 flex items-center justify-between text-xs text-memori-secondary">
                <span>Linked Records:</span>
                <span className="font-bold text-primary font-mono bg-memori-bg px-2 py-0.5 rounded border border-memori-border/50">
                  {loc.item_count !== undefined ? loc.item_count : 0} items
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <LocationForm />
    </div>
  );
}
