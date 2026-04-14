'use client';
import { useAuthContext } from '@/providers/auth-provider';
export default function ProfilePage() {
  const { profile } = useAuthContext();
  return <div className="p-4"><h2 className="font-display font-bold text-xl">{profile?.name || 'Profile'}</h2><p className="text-text-secondary text-sm mt-1">{profile?.role}</p></div>;
}
