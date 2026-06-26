'use client';

// ===========================================
// Firebase 익명 인증 훅
// ===========================================
// 앱 진입 시 자동으로 익명 로그인
// ID 토큰을 제공하여 API 호출에 사용
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';
import {
  signInAnonymously,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  getIdToken: () => Promise<string | null>;
  retryAuth: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      // 환경변수 미설정 시
      setError('Firebase가 초기화되지 않았습니다. 환경변수를 확인하세요.');
      setLoading(false);
      return;
    }
    setAuth(firebaseAuth);

    // 인증 상태 리스너
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        console.error('인증 상태 변경 에러:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // 익명 로그인 시도
    if (!firebaseAuth.currentUser) {
      signInAnonymously(firebaseAuth).catch((err) => {
        console.error('익명 로그인 실패:', err);
        setError(err.message);
      });
    }

    return () => unsubscribe();
  }, []);

  // ID 토큰 가져오기 (API 호출용)
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (err) {
      console.error('토큰 갱신 실패:', err);
      return null;
    }
  }, [user]);

  // 인증 재시도
  const retryAuth = useCallback(() => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    signInAnonymously(auth)
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [auth]);

  return { user, loading, error, getIdToken, retryAuth };
}