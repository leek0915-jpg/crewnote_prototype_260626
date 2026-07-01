'use client';

// ===========================================
// 사용자 프로필 훅 (users/{uid} 문서 구독)
// - role(팀장/팀원), teamId 등 앱 데이터를 실시간으로 제공
// ===========================================

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { useAuth } from './useAuth';

export interface Profile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'leader' | 'member' | null;
  teamId: string | null;
  sparkTotal: number;
  currentStreak?: number;
  longestStreak?: number;
}

export function useProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    if (!db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setProfile(snap.exists() ? ({ uid: user.uid, ...snap.data() } as Profile) : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user, authLoading]);

  return { profile, loading: authLoading || loading, user };
}
