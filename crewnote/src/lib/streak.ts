/**
 * 스트릭(연속 기록일) 계산 유틸
 * - 모든 날짜 비교는 KST(Asia/Seoul) 기준 "날짜"로만 수행 (시:분 무시)
 */

/** KST 기준으로 오늘 날짜 (YYYY-MM-DD 문자열) */
export function getKSTDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  })
    .format(date)
    .replace(/\./g, '')
    .replace(/\s/g, '-')
    .replace(/-$/, '')
    .trim();
  // 결과 예: "2026-6-29" 형식이므로 정규화 필요
}

/** YYYY-MM-DD 형식으로 정규화 */
export function normalizeDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date).split('-');
  return parts.join('-');
}

/** 주어진 날짜의 "어제"에 해당하는 YYYY-MM-DD 반환 */
function getYesterdayKST(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return normalizeDate(d);
}

/** 두 날짜 문자열(YYYY-MM-DD)의 차이(일) 계산 */
function dateDiffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const dateA = new Date(ay, am - 1, ad);
  const dateB = new Date(by, bm - 1, bd);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((dateA.getTime() - dateB.getTime()) / msPerDay);
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastRecordedDate: string;
}

/**
 * 스트릭 계산
 * @param currentStreak  - 현재 연속일 (DB에 저장된 값, 없으면 0)
 * @param longestStreak  - 최고 연속일 (DB에 저장된 값, 없으면 0)
 * @param lastRecordedDate - 마지막 기록일 (YYYY-MM-DD or null/undefined)
 * @param savedAt - 이번에 저장하는 시점 (생략 시 서버 timestamp 사용 불가하므로 클라이언트 Date)
 */
export function calculateNewStreak(
  currentStreak: number,
  longestStreak: number,
  lastRecordedDate: string | null | undefined,
): StreakResult {
  const today = normalizeDate();

  // 오늘 이미 기록했다면 unchanged (중복 증가 금지)
  if (lastRecordedDate === today) {
    return {
      currentStreak: currentStreak || 1, // 없으면 1로 초기화
      longestStreak: Math.max(longestStreak, currentStreak || 1),
      lastRecordedDate: today,
    };
  }

  // 마지막 기록일이 없으면 첫 기록
  if (!lastRecordedDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      lastRecordedDate: today,
    };
  }

  const diff = dateDiffDays(today, lastRecordedDate);

  // 어제의 기록이라면 연속 +1
  if (diff === 1) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastRecordedDate: today,
    };
  }

  // 2일 이상 지났다면 스트릭 끊김 → 리셋
  if (diff > 1) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1), // 과거 최고는 유지
      lastRecordedDate: today,
    };
  }

  // diff <= 0 이어야 하는데(today 이전만 올 것이므로), 안전장치
  return {
    currentStreak: currentStreak || 1,
    longestStreak: Math.max(longestStreak, currentStreak || 1),
    lastRecordedDate: today,
  };
}

/**
 * 스트릭 보호권 소모 자리 (향후 구현 예정)
 *
 * TODO: streakSaver > 0 이고 diff === 2 인 경우,
 *       streakSaver를 1 차감하고 currentStreak를 유지하는 로직을 여기에 추가.
 *       UI: "스트릭 보호권이 스트릭을 지켜줬어요!" 토스트
 *
 * export function tryStreakSaver(...): boolean { ... }
 */

export const STREAK_SAVER_PLACEHOLDER =
  'TODO: 스트릭 보호권 소모 로직은 이곳에 추가합니다. (MVP2)';