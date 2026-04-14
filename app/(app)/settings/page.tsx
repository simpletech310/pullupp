'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import { toast } from 'sonner';

const INTEREST_OPTIONS = [
  'Music', 'Comedy', 'Art', 'Food', 'Networking', 'Sports', 'Theater', 'Wellness',
] as const;

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`
        relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${enabled ? 'bg-orange' : 'bg-surface-alt border border-border'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
          transform transition-transform duration-200 ease-in-out mt-[3px]
          ${enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'}
        `}
      />
    </button>
  );
}

interface SettingRowProps {
  label: string;
  value?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ label, value, onClick, children, danger }: SettingRowProps) {
  const isClickable = !!onClick;
  const Tag = isClickable ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-3.5
        transition-colors duration-150
        ${isClickable ? 'active:bg-surface-hover cursor-pointer' : ''}
        ${danger ? 'text-error' : 'text-text-primary'}
      `}
    >
      <span className={`text-sm font-medium ${danger ? 'text-error' : ''}`}>{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-text-muted truncate max-w-[180px]">{value}</span>}
        {children}
        {isClickable && !children && (
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        )}
      </div>
    </Tag>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="px-4 pt-6 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
      {title}
    </h3>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface border-y border-border divide-y divide-border">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile } = useAuthContext();

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests ?? []
  );

  const [notifications, setNotifications] = useState({
    eventReminders: true,
    bookingUpdates: true,
    newMessages: true,
    tipsReceived: true,
    marketing: false,
  });

  const [darkMode] = useState(true);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      const next = prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest];
      toast.success(
        prev.includes(interest)
          ? `Removed ${interest} from interests`
          : `Added ${interest} to interests`
      );
      return next;
    });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(
        next[key] ? `${formatNotifLabel(key)} enabled` : `${formatNotifLabel(key)} disabled`
      );
      return next;
    });
  };

  return (
    <div className="pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center active:bg-surface-hover transition-colors"
        >
          <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-xl">Settings</h1>
      </div>

      {/* Profile */}
      <SectionHeader title="Profile" />
      <SectionCard>
        <SettingRow
          label="Name"
          value={profile?.name ?? ''}
          onClick={() => toast.info('Edit name coming soon')}
        />
        <SettingRow
          label="Email"
          value={profile?.email ?? ''}
          onClick={() => toast.info('Edit email coming soon')}
        />
      </SectionCard>

      {/* Interests */}
      <SectionHeader title="Interests" />
      <div className="px-4 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`
                  px-2 py-2.5 rounded-xl text-xs font-semibold text-center
                  transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-orange text-white shadow-[0_0_12px_rgba(255,107,53,0.25)]'
                      : 'bg-surface border border-border text-text-secondary hover:border-border-light'
                  }
                `}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <SectionHeader title="Notifications" />
      <SectionCard>
        <SettingRow label="Event Reminders">
          <ToggleSwitch
            enabled={notifications.eventReminders}
            onChange={() => toggleNotification('eventReminders')}
          />
        </SettingRow>
        <SettingRow label="Booking Updates">
          <ToggleSwitch
            enabled={notifications.bookingUpdates}
            onChange={() => toggleNotification('bookingUpdates')}
          />
        </SettingRow>
        <SettingRow label="New Messages">
          <ToggleSwitch
            enabled={notifications.newMessages}
            onChange={() => toggleNotification('newMessages')}
          />
        </SettingRow>
        <SettingRow label="Tips Received">
          <ToggleSwitch
            enabled={notifications.tipsReceived}
            onChange={() => toggleNotification('tipsReceived')}
          />
        </SettingRow>
        <SettingRow label="Marketing">
          <ToggleSwitch
            enabled={notifications.marketing}
            onChange={() => toggleNotification('marketing')}
          />
        </SettingRow>
      </SectionCard>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <SectionCard>
        <SettingRow label="Dark Mode">
          <ToggleSwitch enabled={darkMode} onChange={() => {}} disabled />
        </SettingRow>
      </SectionCard>

      {/* Payments */}
      <SectionHeader title="Payments" />
      <SectionCard>
        <SettingRow
          label="Manage Payment Methods"
          onClick={() => toast.info('Payment methods coming soon')}
        />
        <SettingRow
          label="Stripe Connect"
          value={profile?.stripe_connect_onboarded ? 'Connected' : 'Not Connected'}
          onClick={() => router.push('/stripe-connect')}
        />
      </SectionCard>

      {/* Account */}
      <SectionHeader title="Account" />
      <SectionCard>
        <SettingRow
          label="Change Password"
          onClick={() => toast.info('Change password coming soon')}
        />
        <SettingRow
          label="Delete Account"
          onClick={() => toast.error('Contact support to delete your account')}
          danger
        />
      </SectionCard>

      {/* About */}
      <SectionHeader title="About" />
      <SectionCard>
        <SettingRow label="Version" value="v2.0.0" />
        <SettingRow
          label="Terms of Service"
          onClick={() => toast.info('Terms of Service coming soon')}
        />
        <SettingRow
          label="Privacy Policy"
          onClick={() => toast.info('Privacy Policy coming soon')}
        />
      </SectionCard>

      <div className="h-8" />
    </div>
  );
}

function formatNotifLabel(key: string): string {
  const labels: Record<string, string> = {
    eventReminders: 'Event Reminders',
    bookingUpdates: 'Booking Updates',
    newMessages: 'New Messages',
    tipsReceived: 'Tips Received',
    marketing: 'Marketing',
  };
  return labels[key] ?? key;
}
