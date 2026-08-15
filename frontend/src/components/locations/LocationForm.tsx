import React, { useState } from 'react';
import { Location, LocationType } from '../../../../shared/types';
import { useCreateLocation } from '../../hooks/useLocations';
import { useUIStore } from '../../stores/uiStore';
import { LOCATION_TYPES } from '../../lib/constants';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function LocationForm() {
  const { isLocationModalOpen, setLocationModalOpen } = useUIStore();
  const createMutation = useCreateLocation();

  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('physical');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [uriTemplate, setUriTemplate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Location name is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        type,
        description: description.trim() || null,
        address: address.trim() || null,
        uri_template: uriTemplate.trim() || null,
      });

      setName('');
      setDescription('');
      setAddress('');
      setUriTemplate('');
      setLocationModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create location');
    }
  };

  return (
    <Modal
      open={isLocationModalOpen}
      onOpenChange={setLocationModalOpen}
      title="Add Vault Location"
      description="Define a physical shelf, safe deposit box, or cloud storage path to organize your files."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Location Name *"
          placeholder="e.g. Master Bedroom Safe, Bank Locker #42, Family Google Drive"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-memori-secondary">
            Storage Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LOCATION_TYPES.map((lt) => (
              <button
                key={lt.id}
                type="button"
                onClick={() => setType(lt.id)}
                className={`p-2.5 rounded-btn border text-xs font-semibold text-center transition-all ${
                  type === lt.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-memori-border bg-memori-surface text-memori-secondary hover:border-primary/40'
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
        </div>

        {type === 'physical' ? (
          <Input
            label="Physical Address / Room Details"
            placeholder="e.g. 2nd Floor Home Office, Top Shelf"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        ) : (
          <Input
            label="URL / Path Template"
            placeholder="e.g. https://drive.google.com/drive/folders/..."
            value={uriTemplate}
            onChange={(e) => setUriTemplate(e.target.value)}
          />
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-memori-secondary">
            Description & Access Notes
          </label>
          <textarea
            rows={2}
            placeholder="Who has the key, combination code, or backup password..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-input border border-memori-border bg-memori-surface p-3 text-xs text-memori-text focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-memori-error font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-memori-border/60">
          <Button type="button" variant="ghost" onClick={() => setLocationModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
            Save Vault Location
          </Button>
        </div>
      </form>
    </Modal>
  );
}
