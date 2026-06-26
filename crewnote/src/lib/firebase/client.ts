'use client';

// ===========================================
// Firebase 클라이언트 초기화
// ===========================================
// 브라우저에서 실행되는 클라이언트 코드
// 클라이언트 환경 변수 (NEXT_PUBLIC_*)만 사용
// ===========================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase 설정 (클라이언트 환경변수)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 환경변수 검증 (개발 모드에서만 경고)
function validateConfig(): boolean {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId
  ) {
    console.warn(
      '⚠️ Firebase 환경변수가 설정되지 않았습니다.\n' +
        '.env.local 파일을 확인하고 NEXT_PUBLIC_FIREBASE_* 값을 설정하세요.'
    );
    return false;
  }
  return true;
}

// Firebase 앱 초기화 (SSR 안전: 클라이언트에서만 실행)
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

function initializeFirebase() {
  if (firebaseApp) return;

  if (!validateConfig()) {
    // 개발 환경에서 환경변수 없으면 더미 앱 생성 (빌드 에러 방지)
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 개발 모드: Firebase 더미 초기화');
    }
    return;
  }

  // 이미 초기화된 앱이 있으면 재사용
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
  } else {
    firebaseApp = initializeApp(firebaseConfig);
  }

  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
}

// 클라이언트 환경에서만 초기화
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// -------------------------------------------
// Export
// -------------------------------------------
export function getFirebaseApp(): FirebaseApp | null {
  initializeFirebase();
  return firebaseApp;
}

export function getFirebaseAuth(): Auth | null {
  initializeFirebase();
  return firebaseAuth;
}

export function getFirebaseDb(): Firestore | null {
  initializeFirebase();
  return firebaseDb;
}