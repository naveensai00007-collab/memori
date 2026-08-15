import React, { useState, useEffect } from 'react';
import { Item, Category, Status } from '../../../../shared/types';
import { useCreateItem, useUpdateItem } from '../../hooks/useItems';
import { useLocations } from '../../hooks/useLocations';
import { useUIStore } from '../../stores/uiStore';
import { CATEGORIES, STATUSES } from '../../lib/constants';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SensitiveDataField } from './SensitiveDataField';
import { Tag, Plus, X, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';

export function ItemForm() {
  const { isItemModalOpen, editingItem, closeItemModal } = useUIStore();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const { data: locations } = useLocations();

  const isEditing = !!(editingItem && editingItem.id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('identity');
  const [subcategory, setSubcategory] = useState('');
  const [status, setStatus] = useState<Status>('missing');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [digitalCopyUri, setDigitalCopyUri] = useState('');
  const [locationId, setLocationId] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [sensitiveData, setSensitiveData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Populate form when modal opens or editingItem changes
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
      setDigitalCopyUri(editingItem.digital_copy_uri || '');
      setLocationId(editingItem.location_id || '');
      setExpiryDate(editingItem.expiry_date || '');
      setReminderDate(editingItem.reminder_date || '');
      setSensitiveData(editingItem.sensitive_data || '');
    } else {
      setTitle('');
      setCategory('identity');
      setSubcategory('');
      setStatus('missing');
      setDescription('');
      setNotes('');
      setTags([]);
      setPhysicalLocation('');
      setDigitalCopyUri('');
      setLocationId('');
      setExpiryDate('');
      setReminderDate('');
      setSensitiveData('');
    }
    setError(null);
  }, [editingItem, isItemModalOpen]);

  const catMeta = CATEGORIES.find(c => c.id === category);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
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
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const payload: Partial<Item> = {
        title: title.trim(),
        category,
        subcategory: subcategory.trim() || null,
        status,
        description: description.trim() || null,
        notes: notes.trim() || null,
        tags,
        physical_location: physicalLocation.trim() || null,
        digital_copy_uri: digitalCopyUri.trim() || null,
        location_id: locationId || null,
        expiry_date: expiryDate || null,
        reminder_date: reminderDate || null,
        sensitive_data: sensitiveData || null,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      closeItemModal();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to save item');
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={isItemModalOpen}
      onOpenChange={(open) => !open && closeItemModal()}
      title={isEditing ? 'Edit Life Item' : 'Add to Life Map'}
      description="Catalog your document, asset, credential, or responsibility."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Title */}
        <Input
          label="Title *"
          placeholder="e.g. Passport, Term Insurance Policy, Degree Certificate"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        {/* Category & Subcategory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-memori-secondary">
              Life Domain / Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-memori-secondary">
              Subcategory / Type
            </label>
            <input
              type="text"
              placeholder="e.g. Identity, Policy, RC Book"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              list="subcategory-suggestions"
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
            />
            <datalist id="subcategory-suggestions">
              {catMeta?.suggestedSubcategories.map((sub, idx) => (
                <option key={idx} value={sub} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Status Radio Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-memori-secondary">
            Status *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-btn border text-xs font-semibold transition-all ${
                  status === s.id
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-memori-border bg-memori-surface text-memori-secondary hover:border-primary/40'
                }`}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expiry Date & Reminder Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-memori-secondary">
              <Calendar className="w-3.5 h-3.5" />
              Expiry / Renewal Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                // Auto-suggest reminder 30 days prior if not set
                if (e.target.value && !reminderDate) {
                  const d = new Date(e.target.value);
                  d.setDate(d.getDate() - 30);
                  setReminderDate(d.toISOString().split('T')[0]);
                }
              }}
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-memori-secondary">
              <Calendar className="w-3.5 h-3.5 text-accent-dark" />
              Alert / Reminder Date
            </label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Vault Index & Physical Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-memori-secondary">
              <MapPin className="w-3.5 h-3.5 text-accent-dark" />
              Vault Location
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
            >
              <option value="">-- No Vault Assigned --</option>
              {locations?.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-memori-secondary">
              Physical Location Details
            </label>
            <input
              type="text"
              placeholder="e.g. Blue Folder, Shelf 2, Safe Box"
              value={physicalLocation}
              onChange={(e) => setPhysicalLocation(e.target.value)}
              className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Digital Copy URI */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-memori-secondary">
            <LinkIcon className="w-3.5 h-3.5" />
            Digital Copy Link / URI (Google Drive, DigiLocker, Local Path)
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/... or file:///..."
            value={digitalCopyUri}
            onChange={(e) => setDigitalCopyUri(e.target.value)}
            className="flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-3 py-2 text-sm text-memori-text focus:border-accent focus:outline-none"
          />
        </div>

        {/* Zero-Knowledge Encrypted Secrets */}
        <SensitiveDataField
          encryptedPayload={sensitiveData}
          onChange={setSensitiveData}
          suggestedFields={catMeta?.suggestedSensitiveFields}
        />

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-memori-secondary">
            <Tag className="w-3.5 h-3.5" />
            Tags
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="flex h-10 flex-1 rounded-input border border-memori-border bg-memori-surface px-3 py-1 text-xs text-memori-text focus:border-accent focus:outline-none"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded bg-memori-bg px-2 py-0.5 text-xs text-memori-secondary border border-memori-border"
                >
                  <span>{t}</span>
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    <X className="w-3 h-3 hover:text-memori-error" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description / Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-memori-secondary">
            Notes & Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Important instructions, renewal steps, or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-input border border-memori-border bg-memori-surface p-3 text-xs text-memori-text focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-memori-error font-medium">{error}</p>}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-memori-border/60">
          <Button type="button" variant="ghost" onClick={closeItemModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
