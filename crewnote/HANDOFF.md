# CrewNote 인수인계 노트

> Claude Code → Cline 인수인계용
> 작성: 2026-06-29

---

## 1. 현재 상태 요약

**핵심 아키텍처**: Firebase Client SDK 직접 CRUD (Admin SDK 제거됨)
- `/api/structure` 만 서버 라우트 (OpenRouter LLM 호출)
- 나머지 Firestore CRUD는 클라이언트에서 직접 처리

**배포 환경**: Vercel (Root Directory: `crewnote`)
**인증**: Firebase Anonymous Auth (익명 로그인)
**DB**: Firebase Firestore

---

## 2. Claude Code 세션에서 완료한 작업

### ✅ 코드 버그 수정 (커밋 필요)
1. `src/app/record/page.tsx:116` — 오타 수정
   - `'Firestore 초기화 실'` → `'Firestore 초기화 실패'`

2. `src/app/record/page.tsx:69-71` — React 안티패턴 수정
   - 렌더 중 `setState` 직접 호출 → `useEffect`로 이동
   - 수정 전:
     ```ts
     if (!authLoading && user && state === 'auth') {
       setState('input');
     }
     ```
   - 수정 후:
     ```ts
     useEffect(() => {
       if (!authLoading && user && state === 'auth') {
         setState('input');
       }
     }, [authLoading, user, state]);
     ```

### ✅ Phase 0 외부 설정 (사용자가 완료)
- Firebase Console → Anonymous Auth 활성화 확인
- Firebase Console → Firestore 보안 규칙 적용

---

## 3. 아직 미검증 (가장 중요)

dev 서버(`npm run dev`)는 정상 실행되나, **실제 저장/조회 흐름을 브라우저에서 아직 검증 못함**.

### 확인해야 할 것
1. `http://localhost:3000/record` 접속 후:
   - 상단에 🟢 로그인됨 배지가 뜨는지 (익명 인증 성공 여부)
   - 텍스트 입력 → "정리해주세요" → LLM 구조화 결과 나오는지
   - "저장하기" 클릭 → Firestore에 저장되는지
   - `/feed` 페이지에서 저장된 노트가 보이는지

2. **F12 Console에서 예상 에러 시나리오**:
   - `permission-denied` → Firestore 보안 규칙 문제 → Firebase Console에서 rules 수정
   - `Firebase App not initialized` → `.env.local` 환경변수 문제
   - `POST /api/structure 500` → Vercel의 `OPENROUTER_API_KEY` 미등록 (로컬엔 `.env.local`에 있어야 함)
   - 에러 없음 → 전체 흐름 정상 ✅

---

## 4. 파일 구조 (현재 기준)

```
crewnote/src/
├── app/
│   ├── page.tsx                  # / → /record 리다이렉트
│   ├── record/page.tsx           # ⭐ 기록 입력 + 저장 (핵심)
│   ├── feed/page.tsx             # 피드 (저장된 노트 목록)
│   └── api/structure/route.ts   # LLM 구조화 서버 엔드포인트
├── lib/
│   ├── firebase/client.ts        # Firebase 초기화 (클라이언트 전용)
│   ├── auth/useAuth.ts           # 익명 로그인 훅
│   ├── llm/structure.ts          # OpenRouter 호출 로직
│   ├── models/note.ts            # Note 타입 정의
│   ├── constants.ts              # SPARK, BRAND 상수
│   └── hooks/useSpeechRecognition.ts  # Web Speech API 훅
└── components/
    └── common/TopBar.tsx
```

---

## 5. 환경변수 현황

### `.env.local` (로컬) — 있어야 할 것들
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3-5-haiku
```

### Vercel Production — 등록된 것들
- `NEXT_PUBLIC_FIREBASE_*` 6개 모두 등록됨
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` 등록됨
- `FIREBASE_SERVICE_ACCOUNT_KEY` — 더 이상 불필요 (Admin SDK 제거됨)

---

## 6. Firestore 보안 규칙 (적용 권장)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /notes/{noteId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 7. 다음 작업 우선순위

### 🔴 P0: 즉시 확인
- [ ] 브라우저에서 전체 흐름 테스트 (기록 → 저장 → 피드)
- [ ] Console 에러 없는지 확인
- [ ] 변경된 코드 `git commit` & `git push` (Vercel 자동 재배포)

### 🟡 P1: MVP 완성
- [ ] `next.config.ts`에 `turbopack.root` 설정 (경고 제거)
- [ ] TopBar에 Spark 총합 표시
- [ ] 피드에서 노트 상세 보기
- [ ] 빈 피드 상태에서 "기록하기" CTA 개선

### 🟢 P2: 이후
- [ ] 실시간 피드 (onSnapshot)
- [ ] 노트 삭제/수정
- [ ] Whisper API 음성 품질 업그레이드
- [ ] 파트너 매칭, 리워드 시스템

---

## 8. 로컬 실행 방법

```bash
# VS Code 터미널을 Command Prompt로 변경 후
cd crewnote
npm run dev
# → http://localhost:3000 접속
```

> ⚠️ PowerShell에서 `npm run dev` 실행 시 보안 정책 오류 발생함
> → 반드시 **Command Prompt(cmd)** 사용
