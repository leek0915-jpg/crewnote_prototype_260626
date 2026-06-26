// ===========================================
// GET /api/notes — 내 노트 목록 조회
// POST /api/notes — 새 노트 저장
// ===========================================
// Firebase Admin SDK 사용 (서버 전용)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { getAdminAuth } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS, SPARK } from '@/lib/constants';
import type { StructuredNote } from '@/lib/models/note';

// -------------------------------------------
// GET: 내 노트 목록 조회
// -------------------------------------------
export async function GET(request: NextRequest) {
  try {
    // 인증 토큰에서 userId 추출
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin 초기화 실패' },
        { status: 500 }
      );
    }

    // 토큰 검증
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Firestore에서 내 노트 조회
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firestore 초기화 실패' },
        { status: 500 }
      );
    }

    // users 컬렉션에서 sparkTotal 조회
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    const sparkTotal = userDoc.exists ? (userDoc.data()?.sparkTotal || 0) : 0;

    // notes 컬렉션에서 내 노트 조회 (복합 인덱스 없이 동작)
    // 단일 필드(userId)로만 필터링 → 인덱스 불필요
    const notesSnapshot = await db
      .collection(COLLECTIONS.notes)
      .where('userId', '==', userId)
      .limit(50) // 최근 50개만
      .get();

    // 메모리에서 최신순 정렬 (복합 인덱스 우회)
    const notes = notesSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          summary: data.summary || '',
          mainTasks: data.mainTasks || [],
          collaborators: data.collaborators || [],
          problemSolved: data.problemSolved || '',
          learned: data.learned || '',
          sparkAwarded: data.sparkAwarded || SPARK.perNote,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      userId,
      sparkTotal,
      notes,
    });
  } catch (error) {
    console.error('/api/notes GET 에러:', error);
    return NextResponse.json(
      { success: false, error: '노트 조회 실패' },
      { status: 500 }
    );
  }
}

// -------------------------------------------
// POST: 새 노트 저장
// -------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // 인증 토큰에서 userId 추출
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin 초기화 실패' },
        { status: 500 }
      );
    }

    // 토큰 검증
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 요청 파싱
    const body = await request.json();
    const { rawInput, structuredNote, sparkAwarded } = body as {
      rawInput: string;
      structuredNote: StructuredNote;
      sparkAwarded?: number;
    };

    // 입력 검증
    if (!rawInput || !structuredNote) {
      return NextResponse.json(
        { success: false, error: 'rawInput과 structuredNote가 필요합니다.' },
        { status: 400 }
      );
    }

    // Firestore 저장
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firestore 초기화 실패' },
        { status: 500 }
      );
    }

    const spark = sparkAwarded ?? SPARK.perNote;
    const now = Timestamp.now();

    // notes 컬렉션에 문서 추가
    const noteRef = await db.collection(COLLECTIONS.notes).add({
      userId,
      createdAt: now,
      rawInput,
      source: 'text' as const,
      summary: structuredNote.summary || '',
      mainTasks: structuredNote.mainTasks || [],
      collaborators: structuredNote.collaborators || [],
      problemSolved: (structuredNote.problemSolved || '').trim(),
      learned: (structuredNote.learned || '').trim(),
      sparkAwarded: spark,
    });

    // users 컬렉션의 sparkTotal 증가
    // 트랜잭션 사용
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection(COLLECTIONS.users).doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        // 첫 기록: 새 유저 문서 생성
        transaction.set(userRef, {
          uid: userId,
          displayName: '게스트',
          sparkTotal: spark,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // 기존 유저: sparkTotal 증가
        const currentSpark = userDoc.data()?.sparkTotal || 0;
        transaction.update(userRef, {
          sparkTotal: currentSpark + spark,
          updatedAt: now,
        });
      }
    });

    return NextResponse.json({
      success: true,
      noteId: noteRef.id,
      sparkAwarded: spark,
    });
  } catch (error) {
    console.error('/api/notes POST 에러:', error);
    return NextResponse.json(
      { success: false, error: '노트 저장 실패' },
      { status: 500 }
    );
  }
}