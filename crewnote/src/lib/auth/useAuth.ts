'use client';

// ===========================================
// Firebase 인증 훅 (구글 로그인)
// ===========================================
// - 익명 로그인 제거, 구글 로그인 필수
// - 로그인 시 users/{uid} 문서를 자동 생성/보강
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase/client';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

function errCode(e: unknown): string {
  return (e as { code?: string })?.code ?? '';
}
function errMsg(e: unknown): string {
  return (e as { message?: string })?.message ?? '알 수 없는 오류';
}

/** 로그인한 유저의 users 문서를 없으면 생성, 있으면 프로필 정보만 보강 */
async function ensureUserDoc(u: User) {
  const db = getFirebaseDb();
  if (!db) return;
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: u.uid,
      displayName: u.displayName || '이름없음',
      email: u.email || '',
      photoURL: u.photoURL || '',
      role: null,
      teamId: null,
      sparkTotal: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastRecordedDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    const d = snap.data();
    // 이름/이메일/사진이 비어있으면 구글 프로필로 채워줌
    if (!d.email || !d.displayName || d.displayName === '게스트') {
      await setDoc(
        ref,
        {
          displayName: u.displayName || d.displayName || '이름없음',
          email: u.email || d.email || '',
          photoURL: u.photoURL || d.photoURL || '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Firebase가 초기화되지 않았습니다. 환경변수를 확인하세요.');
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        // 익명 로그인은 더 이상 쓰지 않음 → 남아있는 익명 세션은 '로그인 안 됨'으로 취급
        const effectiveUser = firebaseUser && !firebaseUser.isAnonymous ? firebaseUser : null;
        setUser(effectiveUser);
        setLoading(false);
        if (effectiveUser) {
          try {
            await ensureUserDoc(effectiveUser);
          } catch (e) {
            console.error('유저 문서 생성 실패:', e);
          }
        }
      },
      (err) => {
        console.error('인증 상태 에러:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError('Firebase가 초기화되지 않았습니다.');
      return;
    }
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
    } catch (e) {
      const code = errCode(e);
      // 사용자가 팝업을 닫은 경우는 에러로 취급하지 않음
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setError(errMsg(e));
      throw e;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  return { user, loading, error, signInWithGoogle, signOutUser, getIdToken };
}
