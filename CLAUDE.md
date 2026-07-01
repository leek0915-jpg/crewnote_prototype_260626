# CrewNote — Claude Code 인계 문서

## 프로젝트 개요
직장인 업무 기록 앱. 두서없이 말해도 AI(Nori 🦊)가 구조화해주고 Spark 포인트로 동기부여.

**스택:** Next.js 16.2.9 (Turbopack) · TypeScript · Tailwind CSS v4 · Firebase (Auth + Firestore) · Vercel 배포 예정

**앱 디렉토리:** `crewnote/` (여기서 `npm run dev` 실행)

---

## 현재 버그 — 최우선 수정 필요

### 🔴 노트 상세 페이지 무한로딩
**파일:** `crewnote/src/app/notes/[id]/page.tsx`

**원인:** `useAuth`의 `loading`(Firebase 인증 로딩)이 끝나는 순간 Firestore 노트 조회는 아직 진행 중인데, 별도 노트 로딩 상태가 없어서 `note === null` → 즉시 "찾을 수 없음" 화면으로 전환됨.

**수정 방법:**
```tsx
// noteLoading 상태 추가
const [noteLoading, setNoteLoading] = useState(true);

// useEffect를 auth loading까지 기다리도록 수정
useEffect(() => {
  if (loading) return; // auth 끝날 때까지 대기
  if (!user || !id) {
    setNoteLoading(false);
    return;
  }
  const load = async () => {
    const db = getFirebaseDb();
    if (!db) { setNoteLoading(false); return; }
    const snap = await getDoc(doc(db, 'notes', id));
    if (snap.exists()) setNote({ id: snap.id, ...snap.data() });
    setNoteLoading(false);
  };
  load();
}, [id, user, loading]);

// 로딩 조건: auth 또는 note 중 하나라도 로딩 중이면 스피너
if (loading || noteLoading) { return <spinner> }
```

---

## 라우트 구조
```
/           → 루트 (리디렉션)
/landing    → 랜딩페이지 (비로그인)
/feed       → 내 노트 목록 + Spark 현황 (메인)
/record     → 새 기록 작성
/notes/[id] → 노트 상세 ← 현재 버그 있음
/achievements → 업적/뱃지 페이지
/api/structure → AI 구조화 API 엔드포인트
```

## 디자인 토큰 (globals.css)
```
primary:      #FF7A59  (코랄 오렌지)
primary-light: #FF9A7E
cream:        #FFF1E6  (배경)
cream-dark:   #FFE4CC
foreground:   #2B2B2B
muted-text:   #666666
card:         #ffffff
border:       #FFE4CC
spark:        #FF7A59  (Spark 포인트 색)
```

## 핵심 컴포넌트/훅
- `useAuth()` — Firebase 익명 인증. `{ user, loading, error, retryAuth }` 반환
- `getFirebaseDb()` — Firestore 인스턴스
- `getFirebaseAuth()` — Auth 인스턴스
- `TopBar` — 공통 상단 바 컴포넌트
- `BRAND` — 브랜드 상수 (`lib/constants`)

## Firestore 데이터 구조
```
notes/{id}
  userId: string
  summary: string          // AI 요약
  mainTasks: string[]      // 주요 업무 목록
  collaborators: string[]  // 함께한 동료
  problemSolved: string    // 해결한 문제
  learned: string          // 배운 점
  rawInput: string         // 사용자 원본 입력
  sparkAwarded: number     // 획득 Spark (기본 10)
  createdAt: Timestamp

users/{uid}
  sparkTotal: number       // 누적 Spark
```

## Spark / 뱃지 시스템
누적 Spark 임계값으로 뱃지 달성:
10 🌱 첫 발걸음 → 50 → 100 ⭐ → 300 → 500 🏆 → 1000 👑

## 개발 명령어
```bash
cd crewnote
npm run dev    # 개발 서버 (localhost:3000)
npm run build  # 프로덕션 빌드 + 타입 체크
```

## 주의사항
- Next.js 16 (Turbopack) — 일부 API가 기존 버전과 다름. `node_modules/next/dist/docs/` 참고
- Tailwind CSS v4 — `@theme inline` 방식으로 커스텀 토큰 정의
- 익명 인증 기반 (Firebase Anonymous Auth) — `user.uid`로 데이터 구분
