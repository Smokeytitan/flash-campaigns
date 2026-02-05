'use client';

/**
 * Campaign Form
 * Form for creating and editing campaigns
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import { createCampaign } from '@/app/actions/campaigns';

export function CampaignForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<string[]>(['']);

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const filteredRequirements = requirements.filter((r) => r.trim() !== '');

    // Add requirements to form data as JSON
    formData.set('requirements', JSON.stringify(filteredRequirements));

    try {
      const result = await createCampaign(formData);

      if (result.success && result.campaignId) {
        router.push(`/admin/campaigns/${result.campaignId}`);
      } else {
        setError(result.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
          Basic Information
        </h2>

        {/* Title */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
          >
            Campaign Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g., Flash Campaign: Best Product Launch Tweet"
            className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
          />
        </div>

        {/* Brief */}
        <div>
          <label
            htmlFor="brief"
            className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
          >
            Campaign Brief *
          </label>
          <textarea
            id="brief"
            name="brief"
            required
            rows={4}
            placeholder="Describe what creators need to do..."
            className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            Requirements
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddRequirement}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={req}
                onChange={(e) => handleRequirementChange(index, e.target.value)}
                placeholder={`Requirement ${index + 1}`}
                className="flex-1 px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleRemoveRequirement(index)}
                className="p-2 text-[rgb(var(--color-text-tertiary))] hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
          Schedule
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startAt"
              className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
            >
              Start Date
            </label>
            <input
              type="datetime-local"
              id="startAt"
              name="startAt"
              className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="endAt"
              className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
            >
              End Date *
            </label>
            <input
              type="datetime-local"
              id="endAt"
              name="endAt"
              required
              className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Prizes */}
      <div className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
          Prizes
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="prizePoolAmount"
              className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
            >
              Total Prize Pool *
            </label>
            <input
              type="number"
              id="prizePoolAmount"
              name="prizePoolAmount"
              required
              min="0"
              step="0.01"
              placeholder="1000.00"
              className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="prizePoolCurrency"
              className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
            >
              Currency *
            </label>
            <input
              type="text"
              id="prizePoolCurrency"
              name="prizePoolCurrency"
              required
              defaultValue="USD"
              placeholder="USD"
              className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="winnersCount"
              className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2"
            >
              Number of Winners *
            </label>
            <input
              type="number"
              id="winnersCount"
              name="winnersCount"
              required
              min="1"
              placeholder="3"
              className="w-full px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Campaign'
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
