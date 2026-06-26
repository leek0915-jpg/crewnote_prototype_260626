// ===========================================
// Firebase Admin SDK 초기화 (서버 전용)
// ===========================================
// API Routes, Server Components, Server Actions에서 사용
// 서버 환경변수 (접두사 없음)만 사용 — 절대 클라이언트에 노출 금지!
// ===========================================

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let initialized = false;

function initializeAdmin() {
  if (initialized) return;

  try {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      // 서비스 계정 인증 방식 선택
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (credentialsPath && fs.existsSync(credentialsPath)) {
        // 로컬: 서비스 계정 키 파일 사용
        const serviceAccount = JSON.parse(
          fs.readFileSync(path.resolve(credentialsPath), 'utf-8')
        );
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
      } else if (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        // Vercel 배포: Application Default Credentials 사용
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else {
        console.warn('⚠️ Firebase Admin 초기화 실패: 서비스 계정 키가 없습니다.');
        return;
      }
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    initialized = true;
  } catch (error) {
    console.error('Firebase Admin 초기화 에러:', error);
  }
}

// -------------------------------------------
// Export
// -------------------------------------------
export function getAdminApp(): App | null {
  initializeAdmin();
  return adminApp;
}

export function getAdminAuth(): Auth | null {
  initializeAdmin();
  return adminAuth;
}

export function getAdminDb(): Firestore | null {
  initializeAdmin();
  return adminDb;
}