// ===========================================
// CrewNote 상수 정의
// ===========================================

// -------------------------------------------
// 브랜드 & 디자인
// -------------------------------------------
export const BRAND = {
  name: 'CrewNote',
  tagline: '업무 기록 도구 — 게임처럼 느껴지게',
  mascot: {
    name: '노리', // 통통한 여우 마스코트
    emoji: '🦊',
  },
} as const;

export const COLORS = {
  primary: '#FF7A59', // 코랄-오렌지
  cream: '#FFF1E6',
  darkText: '#2B2B2B',
} as const;

// -------------------------------------------
// LLM 모델 (OpenRouter)
// -------------------------------------------
export const LLM = {
  // 기본 모델 — 환경변수 OPENROUTER_MODEL이 있으면 그걸 사용
  defaultModel: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
  temperature: 0.3, // 구조화 작업이므로 낮은 온도
  maxTokens: 1000,
} as const;

// -------------------------------------------
// 게임 요소 (MVP 맛보기)
// -------------------------------------------
export const SPARK = {
  // Note 1개당 기본 보상 Spark
  perNote: 10,
} as const;

// -------------------------------------------
// Firestore 컬렉션 이름
// -------------------------------------------
export const COLLECTIONS = {
  users: 'users',
  notes: 'notes',
} as const;