// ===========================================
// Note 데이터 모델 (Firestore 스키마와 매핑)
// ===========================================

import { Timestamp } from 'firebase/firestore';

/** LLM이 구조화한 결과 */
export interface StructuredNote {
  summary: string; // 한 줄 요약
  mainTasks: string[]; // 오늘의 주요 업무
  collaborators: string[]; // 협업한 동료
  problemSolved: string; // 문제 해결 내용
  learned: string; // 배운 점
}

/** 입력 소스 */
export type NoteSource = 'voice' | 'text';

/** Firestore notes 컬렉션 문서 */
export interface NoteDoc {
  id?: string; // 문서 ID (클라이언트에서 자동 생성된 경우)
  userId: string; // Firebase Auth UID
  createdAt: Timestamp;
  rawInput: string; // 원본 입력 (두서없는 텍스트)
  source: NoteSource;
  // LLM 구조화 결과 ↓
  summary: string;
  mainTasks: string[];
  collaborators: string[];
  problemSolved: string;
  learned: string;
  // 게임 요소 ↓
  sparkAwarded: number; // 이 Note로 받은 Spark
}

/** Firestore users 컬렉션 문서 */
export interface UserDoc {
  uid: string; // Firebase Auth UID
  displayName: string;
  sparkTotal: number; // 누적 Spark
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** LLM 구조화 성공 응답 */
export interface StructureResponse {
  success: true;
  data: StructuredNote;
}

/** LLM 구조화 실패 응답 */
export interface StructureError {
  success: false;
  error: string;
  // 부분적으로 파싱된 데이터 (fallback용)
  partial?: Partial<StructuredNote>;
}