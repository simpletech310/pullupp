'use client';

import { useAuthContext } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AVATAR_COLORS, ROLE_CONFIG } from '@/lib/utils/constants';
import { getInitials } from '@/lib/utils/format';
import type { UserRole } from '@/types/database';

const ROLE_BADGE_VARIANT: Record<UserRole, 'orange' | 'teal' | 'purple' | 'error' | 'warning'> = {
  guest: 'orange',
  organizer: 'teal',
  venue_owner: 'purple',
  artist: 'warning',
  superadmin: 'error',
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, sublabel, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors active:bg-surface-container-high ${
        danger ? 'text-error' : 'text-on-surface'
      }`}
    >
      <span className={`w-5 h-5 flex items-center justify-center shrink-0 ${danger ? 'text-error' : 'text-on-surface-variant'}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">
        <span className="block text-sm font-body font-medium">{label}</span>
        {sublabel && <span className="block text-xs text-on-surface-variant font-body mt-0.5">{sublabel}</span>}
      </span>
      <svg className="w-4 h-4 text-outline shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 mb-3">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-outline mb-2 px-1">{title}</p>
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
        {children}
      </div>
    </div>
  );
}

const icons = {
  ticket: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
  bookmark: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>,
  tip: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  following: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
  settings: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  stripe: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
  help: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
  calendar: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  plus: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  building: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  chart: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  music: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>,
  user: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  live: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
};

export default function ProfilePage() {
  const { profile, signOut } = useAuthContext();
  const router = useRouter();

  const role = (profile?.role ?? 'guest') as UserRole;
  const roleConfig = ROLE_CONFIG[role];
  const avatarColor = AVATAR_COLORS[profile?.avatar_color_index ?? 0];
  const initials = profile?.name ? getInitials(profile.name) : '?';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="pb-10">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        {/* Avatar */}
        <div className="relative mb-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-outline-variant/30"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-headline font-bold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)` }}
            >
              {initials}
            </div>
          )}
          <button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center"
            onClick={() => router.push('/settings')}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-on-surface-variant">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
          </button>
        </div>

        <h1 className="font-headline font-bold text-2xl text-on-surface">{profile?.name || 'User'}</h1>

        <div className="mt-2">
          <Badge variant={ROLE_BADGE_VARIANT[role]}>{roleConfig.label}</Badge>
        </div>

        {profile?.email && (
          <p className="text-on-surface-variant text-sm font-body mt-2">{profile.email}</p>
        )}
      </div>

      {/* Stats Row */}
      <div className="px-4 mb-6">
        <div className="glass-card rounded-2xl border border-white/5 flex divide-x divide-white/5">
          {[
            { value: '12', label: 'Events' },
            { value: '48', label: 'Following' },
            { value: '5', label: 'Tickets' },
          ].map(({ value, label }) => (
            <div key={label} className="flex-1 py-4 text-center">
              <div className="font-headline font-bold text-xl text-on-surface">{value}</div>
              <div className="text-xs text-on-surface-variant font-body mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      {profile?.interests && profile.interests.length > 0 && (
        <div className="px-4 mb-4 flex flex-wrap gap-2">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1.5 bg-surface-container-high border border-white/5 rounded-full text-xs font-body font-medium text-on-surface-variant"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      {/* Menu Sections */}
      <MenuSection title="Activity">
        <MenuItem icon={icons.ticket} label="My Tickets" onClick={() => router.push('/tickets')} />
        <MenuItem icon={icons.bookmark} label="Saved Events" onClick={() => router.push('/saved')} />
        <MenuItem icon={icons.tip} label="Tip History" onClick={() => router.push('/tip-history')} />
        <MenuItem icon={icons.following} label="Following" onClick={() => router.push('/following')} />
      </MenuSection>

      <MenuSection title="Account">
        <MenuItem icon={icons.settings} label="Settings" onClick={() => router.push('/settings')} />
        <MenuItem icon={icons.stripe} label="Stripe Connect" onClick={() => router.push('/stripe-connect')} />
        <MenuItem icon={icons.help} label="Help & Support" onClick={() => router.push('/help')} />
      </MenuSection>

      {role === 'organizer' && (
        <MenuSection title="For Organizers">
          <MenuItem icon={icons.calendar} label="My Events" onClick={() => router.push('/my-events')} />
          <MenuItem icon={icons.plus} label="Create Event" onClick={() => router.push('/create-event')} />
        </MenuSection>
      )}

      {role === 'venue_owner' && (
        <MenuSection title="For Venue Owners">
          <MenuItem icon={icons.building} label="My Venue" onClick={() => router.push('/my-venue')} />
          <MenuItem icon={icons.chart} label="Dashboard" onClick={() => router.push('/venue-dashboard')} />
        </MenuSection>
      )}

      {role === 'artist' && (
        <MenuSection title="For Artists">
          <MenuItem icon={icons.user} label="My Profile" onClick={() => router.push('/artist-profile')} />
          <MenuItem icon={icons.chart} label="Dashboard" onClick={() => router.push('/artist-dashboard')} />
          <MenuItem icon={icons.live} label="Go Live" onClick={() => router.push('/go-live')} />
        </MenuSection>
      )}

      {/* Sign Out */}
      <div className="px-4 mt-4">
        <Button variant="danger" fullWidth onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
