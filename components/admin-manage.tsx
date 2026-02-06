/**
 * AdminManage Component
 * Reusable wrapper for admin management pages
 * Provides consistent layout, navigation, and admin checks
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminManageProps {
  title: string;
  backUrl?: string;
  backLabel?: string;
  showCreateButton?: boolean;
  createUrl?: string;
  createLabel?: string;
  children: ReactNode;
}

export function AdminManage({
  title,
  backUrl = '/admin',
  backLabel = 'Back to Dashboard',
  showCreateButton = false,
  createUrl = '/admin/campaigns/new',
  createLabel = 'New Campaign',
  children,
}: AdminManageProps) {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border-primary))] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {backUrl && (
            <Link
              href={backUrl}
              className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">{backLabel}</span>
            </Link>
          )}

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
              {title}
            </h1>

            {showCreateButton && createUrl && (
              <Link href={createUrl}>
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {createLabel}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

interface AdminManageSectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * AdminManageSection Component
 * Reusable section component for consistent styling
 */
export function AdminManageSection({
  title,
  description,
  action,
  children,
  className = '',
}: AdminManageSectionProps) {
  return (
    <div
      className={`bg-white border border-[rgb(var(--color-border-primary))] rounded-xl overflow-hidden ${className}`}
    >
      {(title || description || action) && (
        <div className="p-6 border-b border-[rgb(var(--color-border-secondary))] flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {description}
              </p>
            )}
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface AdminManageStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    variant?: 'default' | 'accent' | 'success' | 'warning';
  }>;
}

/**
 * AdminManageStats Component
 * Display statistics in a grid
 */
export function AdminManageStats({ stats }: AdminManageStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const colorClasses = {
          default: 'text-[rgb(var(--color-text-primary))]',
          accent: 'text-[rgb(var(--color-accent-primary))]',
          success: 'text-green-600',
          warning: 'text-amber-600',
        };

        return (
          <div
            key={index}
            className="bg-white border border-[rgb(var(--color-border-primary))] rounded-xl p-6"
          >
            <div className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
              {stat.label}
            </div>
            <div
              className={`text-3xl font-bold ${
                colorClasses[stat.variant || 'default']
              }`}
            >
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AdminManageEmptyProps {
  message: string;
  action?: ReactNode;
}

/**
 * AdminManageEmpty Component
 * Empty state display
 */
export function AdminManageEmpty({ message, action }: AdminManageEmptyProps) {
  return (
    <div className="text-center py-12">
      <p className="text-[rgb(var(--color-text-secondary))] mb-4">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
