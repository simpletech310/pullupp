'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROLE_CONFIG, type UserRole } from '@/lib/utils/constants';
import { toast } from 'sonner';

const SELECTABLE_ROLES: UserRole[] = ['guest', 'organizer', 'venue_owner', 'artist'];

const ROLE_ICONS: Record<string, React.ReactNode> = {
  guest: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  organizer: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  venue_owner: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><path d="M9 18h6"/></svg>,
  artist: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
};

export default function RegisterPage() {
  const [step, setStep] = useState<'info' | 'role'>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthContext();
  const router = useRouter();

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setStep('role');
  };

  const handleRegister = async () => {
    if (!selectedRole) return;
    setLoading(true);

    const { error } = await signUp(email, password, { name, role: selectedRole });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm.');
      // For development, go straight to onboarding
      router.push('/onboarding');
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-dvh flex flex-col px-6 pt-16 pb-8">
        <button
          onClick={() => setStep('info')}
          className="self-start p-2 -ml-2 mb-6 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h1 className="font-headline font-bold text-3xl mb-2">How will you use PullUpp?</h1>
        <p className="font-body text-on-surface-variant text-sm mb-6">Choose your primary role. You can change this later.</p>

        <div className="flex flex-col gap-3 mb-8">
          {SELECTABLE_ROLES.map((role) => {
            const config = ROLE_CONFIG[role];
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-orange bg-orange/8 shadow-[0_0_20px_rgba(255,107,53,0.15)]'
                    : 'border-white/5 hover:border-white/10 bg-surface-container'
                  }
                `}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${config.color}20`, color: config.color }}
                >
                  {ROLE_ICONS[role]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{config.label}</div>
                  <div className="font-body text-xs text-on-surface-variant mt-0.5">{config.description}</div>
                </div>
                {isSelected && (
                  <div className="ml-auto shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          size="lg"
          fullWidth
          loading={loading}
          disabled={!selectedRole}
          onClick={handleRegister}
        >
          Create Account
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-16 pb-8">
      <button
        onClick={() => router.back()}
        className="self-start p-2 -ml-2 mb-6 rounded-lg hover:bg-surface-container-high transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <h1 className="font-headline font-bold text-3xl mb-2">Create account</h1>
      <p className="font-body text-on-surface-variant text-sm mb-8">Join PullUpp and discover amazing events</p>

      <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" fullWidth className="mt-2">
          Continue
        </Button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-container font-semibold hover:text-orange-light">
          Sign In
        </Link>
      </p>
    </div>
  );
}
