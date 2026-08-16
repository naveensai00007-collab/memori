import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useCreateItem, useUpdateItem } from '../../hooks/useItems';
import { useLocations } from '../../hooks/useLocations';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SensitiveDataField } from './SensitiveDataField';
import { CATEGORIES, STATUSES } from '../../lib/constants';
import { Category, Status } from '../../../../shared/types';
import { X } from 'lucide-react';

export function ItemForm() {
  const { isItemModalOpen, editingItem, closeItemModal } = useUIStore();
  const { data: locations } = useLocations();

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const isEditing = Boolean(editingItem && editingItem.id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('identity');
  const [subcategory, setSubcategory] = useState('');
  const [status, setStatus] = useState<Status>('missing');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [locationId, setLocationId] = useState<string>('');
  const [digitalCopyUri, setDigitalCopyUri] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [sensitiveData, setSensitiveData] = useState<string>('');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setCategory(editingItem.category || 'identity');
      setSubcategory(editingItem.subcategory || '');
      setStatus(editingItem.status || 'missing');
      setDescription(editingItem.description || '');
      setNotes(editingItem.notes || '');
      setTags(editingItem.tags || []);
      setPhysicalLocation(editingItem.physical_location || '');
      setLocationId(editingItem.location_id || '');
      setDigitalCopyUri(editingItem.digital_copy_uri || '');
      setExpiryDate(editingItem.expiry_date || '');
      setReminderDate(editingItem.reminder_date || '');
      setSensitiveData(editingItem.sensitive_data || '');
    } else {
      // Reset form
      setTitle('');
      setCategory('identity');
      setSubcategory('');
      setStatus('missing');
      setDescription('');
      setNotes('');
      setTags([]);
      setTagInput('');
      setPhysicalLocation('');
      setLocationId('');
      setDigitalCopyUri('');
      setExpiryDate('');
      setReminderDate('');
      setSensitiveData('');
    }
  }, [editingItem, isItemModalOpen]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      category,
      subcategory: subcategory.trim() || undefined,
      status,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      tags,
      physical_location: physicalLocation.trim() || undefined,
      location_id: locationId || undefined,
      digital_copy_uri: digitalCopyUri.trim() || undefined,
      expiry_date: expiryDate || undefined,
      reminder_date: reminderDate || undefined,
      sensitive_data: sensitiveData || undefined,
    };

    if (isEditing && editingItem?.id) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        data: payload,
      });
      closeItemModal();
    } else {
      await createMutation.mutateAsync(payload);
      closeItemModal();
    }
  };

  const selectedCategoryMeta = CATEGORIES.find(c => c.id === category);

  return (
    <Modal
      open={isItemModalOpen}
      onOpenChange={(open) => {
        if (!open) closeItemModal();
      }}
      title={isEditing ? 'Edit Life Map Record' : 'Catalog New Record'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Document / Item Title"
          placeholder="e.g. Passport, Health Insurance Policy, Property Deed"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-memori-secondary">
              Life Domain / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="flex h-10 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-xs text-memori-text focus:border-accent focus:outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-memori-secondary">
              Readiness Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="flex h-10 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-xs text-memori-text focus:border-accent focus:outline-none"
            >
              {STATUSES.map(st => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subcategory suggestions */}
        <div className="space-y-1.5">
          <Input
            label="Subcategory / Type"
            placeholder="e.g. Identity, Policy, Vehicle Title"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          />
          {selectedCategoryMeta && selectedCategoryMeta.suggestedSubcategories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedCategoryMeta.suggestedSubcategories.map((sub: string, idx: number) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSubcategory(sub)}
                  className="rounded bg-memori-subtle px-2 py-0.5 text-[10px] text-memori-secondary hover:bg-memori-border/70 hover:text-primary transition-colors"
                >
                  +{sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vault Location Mapping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-memori-secondary">
              Vault Index Location (Linked)
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="flex h-10 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-xs text-memori-text focus:border-accent focus:outline-none"
            >
              <option value="">-- Select Saved Location --</option>
              {locations?.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.type})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Specific Drawer / Sub-location"
            placeholder="e.g. Shelf 2, Blue Binder"
            value={physicalLocation}
            onChange={(e) => setPhysicalLocation(e.target.value)}
          />
        </div>

        {/* Temporal Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Input
            label="Expiration Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <Input
            label="Reminder / Renewal Date"
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
          />
        </div>

        {/* Digital URI */}
        <Input
          label="Digital Storage URI"
          placeholder="https://drive.google.com/... or /path/to/scan.pdf"
          value={digitalCopyUri}
          onChange={(e) => setDigitalCopyUri(e.target.value)}
        />

        {/* Zero-Knowledge Encrypted Secrets Field */}
        <div className="pt-2">
          <SensitiveDataField
            value={sensitiveData}
            onChange={(encrypted) => setSensitiveData(encrypted)}
            isEditing={true}
          />
        </div>

        {/* Description & Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-memori-secondary">
            Context Notes
          </label>
          <textarea
            rows={2}
            placeholder="Important instructions, renewal requirements, emergency contacts..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-xs text-memori-text placeholder:text-memori-tertiary focus:border-accent focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-memori-secondary">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 h-8 rounded-input border border-memori-border bg-memori-surface px-3 text-xs text-memori-text focus:border-accent focus:outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              className="h-8"
            >
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded bg-memori-subtle px-2 py-0.5 text-xs text-memori-secondary border border-memori-border/60"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-memori-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-memori-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={closeItemModal}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Save Changes' : 'Save to Life Map'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
