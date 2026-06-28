# CrewNote 현황 보고서

> Claude에게 전달하기 위한 맥락/현황 정리 문서
> 업데이트: 2026-06-28

---

## 1. 제품 개요

- **제품명**: CrewNote
- **한 줄 정의**: "사람들이 진짜로 쓰는 업무 기록 도구 — 게임처럼 느껴지게 만들어서."
- **MVP 범위**: 핵심 루프 하나만 완성 (기록 → 구조화 → 피드 + Spark 맛보기)
- **디자인 톤**: 코랄-오렌지 (#FF7A59) / 크림 (#FFF1E6) / 다크 텍스트 (#2B2B2B)
- **마스코트**: 통통한 여우 "노리/Nori" 🦊

---

## 2. 기술 스택

| 영역 | 선택 |
|------|------|
| 프론트 | Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| 호스팅 | Vercel (Root Directory: `crewnote`, 자동 배포) |
| DB | Firebase Firestore (NoSQL) |
| 인증 | Firebase Auth — **익명 로그인(Anonymous Auth)**으로 시작. 로그인 화면 없음 |
| LLM 구조화 | OpenRouter API (`POST https://openrouter.ai/api/v1/chat/completions`)<br>서버에서만 호출 (API 라우트 `/api/structure`). 클라이언트 노출 금지 |
| 추천 모델 | `anthropic/claude-3-5-haiku` (싼데 한국어 구조화 잘 됨) |
| 음성 (MVP에선 후순위) | Web Speech API (브라우저 내장) — 텍스트 fallback 우선 |

---

## 3. 현재 파일 구조 (최신 커밋 기준)

```
crewnote/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # / → /record 리다이렉트
│   │   ├── globals.css           # Tailwind + CSS 변수 (코랄-오렌지 테마)
│   │   ├── record/page.tsx       # [1] 기록하기 화면 (← 핵심 작업물)
│   │   ├── feed/page.tsx         # [2] 오늘의 피드 화면
│   │   └── api/
│   │       └── structure/route.ts  # [3] LLM 구조화 서버 엔드포인트 (살려둠)
│   │           └── (notes/route.ts 는 삭제됨 — 아래 참고)
│   ├── lib/
│   │   ├── firebase/
│   │   │   └── client.ts          # Firebase 클라이언트 초기화 (Auth + Firestore)
│   │   │       └── (admin.ts 는 삭제됨)
│   │   ├── llm/structure.ts       # OpenRouter 호출 로직
│   │   ├── models/note.ts         # Note 타입 정의
│   │   ├── constants.ts           # 상수 (BRAND, SPARK, COLLECTIONS 등)
│   │   ├── auth/useAuth.ts        # 익명 로그인 + onAuthStateChanged 훅
│   │   └── hooks/useSpeechRecognition.ts  # Web Speech API 훅
│   └── components/
│       ├── record/  (VoiceButton, TextInput, NotePreview)
│       ├── feed/    (NoteCard, SparkCounter)
│       └── common/  (TopBar, Mascot placeholder)
├── .env.local          # 로컬 환경변수 (.gitignore됨)
├── .env.example        # 템플릿 (키값 비움)
├── vercel.json         # Vercel 설정
├── package.json        # firebase, next, openai, react 등
└── next.config.ts
```

### 삭제된 파일 (의사결정 기록)
- ❌ `src/app/api/notes/route.ts` — Firebase Admin SDK 기반으로 `/api/notes`를 서버 라우트로 구현했으나, Vercel 환경에서 서비스 계정 키 문제 persist → **클라이언트 SDK 직접 호출로 대체**
- ❌ `src/lib/firebase/admin.ts` — Firebase Admin SDK 초기화 코드 (서비스 계정 키 필요)
-  `firebase-service-account.json` — 서비스 계정 키 파일 (로컬에만 존재했음)

---

## 4. 데이터 모델 (Firestore)

### `users` 컬렉션 (문서 ID = uid)
```ts
{
  uid: string;
  displayName: string;  // '게스트'
  sparkTotal: number;   // 누적 Spark
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `notes` 컬렉션
```ts
{
  id: string;
  userId: string;               // FK → users.uid
  createdAt: Timestamp;
  rawInput: string;             // 원본 입력 (두서없는 텍스트/음성)
  source: 'voice' | 'text';     // MVP에선 일단 text만
  summary: string;              // 한 줄 요약
  mainTasks: string[];          // 오늘의 주요 업무
  collaborators: string[];      // 협업한 동료
  problemSolved: string;        // 문제 해결 내용
  learned: string;              // 배운 점
  sparkAwarded: number;         // 이 기록으로 얻은 Spark (예: 10)
}
```

### 쿼리
- **피드**: `notes` 컬렉션에서 `where('userId', '==', myUid)` → 메모리에서 `createdAt` desc 정렬 (복합 인덱스 생략용)
- **Spark 합계**: `users/{uid}`에서 `sparkTotal` 읽기
- **필요 인덱스**: (userId ASC, createdAt DESC) — 피드에서 복합 인덱스 대신 메모리 정렬로 우회 중

---

## 5. 커밋 히스토리 (최신순)

| 커밋 | 설명 | 비고 |
|------|------|------|
| `aec498a` | feat: 로그인 상태 표시 + 저장하기 버튼 disabled 개선 | 로그인 미완료 시 버튼에 "로그인 필요" 표시, 재시도 버튼 추가 |
| `7d7eb06` | fix: 저장하기 버튼 user null 체크 개선 | user가 null일 때 silently return → 에러 메시지 표시로 변경 |
| `02d3d39` | **refactor: Firebase Admin SDK 제거, 클라이언트 SDK 직접 호출로 변경** | 🔑 큰 전환 — 서버 라우트 `api/notes` 버리고 클라이언트에서 addDoc/getDocs 직접 사용 |
| `30bd4d7` | fix: Firebase Admin 서비스 계정 환경변수 지원 추가 | `FIREBASE_SERVICE_ACCOUNT_KEY` 환경변수 파싱 추가 (하지만 Vercel에 미등록) |
| `329cc7f` | fix: firebase, firebase-admin, openai 의존성을 crewnote/package.json에 추가 | 빌드 에러 해결용 |
| `5e6d9e5` | trigger: redeploy with Root Directory=crewnote | Vercel에서 Root Directory를 `crewnote`으로 설정해서 재배포 트리거 |
| `b30290a` | fix: Vercel 배포 설정 (vercel.json 추가, 루트 package.json 제거) | `npx next build`가 루트를 참조하는 문제 해결용 |
| `2ded4f0` | feat: 음성 입력 추가 (Web Speech API, ko-KR) | 🎤 버튼 추가, 브라우저 미지원 시 텍스트 fallback |
| `240b5a4` | feat: CrewNote MVP - core loop (text to LLM structure to Firestore to feed) | 프로젝트 시작 |

---

## 6. 지금까지 겪은 주요 문제 & 해결 경로

### 🔴 문제 1: Vercel 빌드 에러 — `firebase-admin` 의존성 없음
- **증상**: Vercel 빌드 시 `Module not found: Error: Can't resolve 'firebase-admin'`
- **원인**: `crewnote/package.json`에 `firebase-admin`이 의존성으로 없음 (로컬에만 전역 설치된 상태)
- **해결**: `crewnote/package.json`에 `firebase`, `firebase-admin`, `openai` 추가 후 재배포
- **커밋**: `329cc7f`

###  문제 2: `npm install` / `npx next build`가 루트 `package.json`을 참조함
- **증상**: `ENOENT: no such file or directory, open 'c:\...\package.json'`
- **원인**: 루트 디렉토리(`CrewNote(260626)`)에 `node_modules/`가 생성된 채로 있어서 npm이 루트를 프로젝트 경로를 잘못 인식
- **해결**: 루트 `package.json`/`node_modules/` 제거 + `vercel.json`에 `"buildCommand": "next build"` 명시 + `pushd`/`--prefix`로 디렉토리 지정
- **커밋**: `b30290a`, `5e6d9e5`

###  문제 3: `/api/structure` 500 에러 (LLM 호출 실패)
- **증상**: 브라우저 Console에 `POST /api/structure 500 (Internal Server Error)`
- **원인**: Vercel에 `OPENROUTER_API_KEY` 환경변수 미등록
- **해결**: Vercel 대시보드 → Settings → Environment Variables에 `OPENROUTER_API_KEY` 등록 (`OPENROUTER_MODEL=anthropic/claude-3-5-haiku` 함께)
- **커밋**: 코드 변경 없음. Vercel 대시보드 수동 작업
- **결과**: ✅ LLM 구조화 정상 작동 확인 (사용자 스크린샷 참조)

### 🔴🔴 문제 4: `/api/notes` 500 에러 (Firestore 저장/조회 실패) — **가장 오래 끈 이슈**
- **증상**: "저장하기" 버튼 클릭 시 `POST /api/notes 500`. 피드도 빈 화면.
- **원인 추적**:
  1. Firebase Admin SDK가 서버리스 환경에서 초기화 실패
  2. `firebase-service-account.json` 파일이 로컬에만 존재, Vercel엔 없음
  3. `FIREBASE_SERVICE_ACCOUNT_KEY` 환경변수 등록 가이드 전달했으나 **사용자가 미등록** (Vercel 대시보드에 등록 안 된 상태)
  4. fallback으로 `projectId`만으로는 `getAuth()`/`getFirestore()` 작동 불가
- **시도한 해결책들**:
  - `admin.ts`에 `FIREBASE_SERVICE_ACCOUNT_KEY` 환경변수 파싱 추가 (`30bd4d7`)
  - Git push까지 완료, Vercel 재배포 가이드 안내
  - **하지만 사용자는 환경변수 등록을 완료하지 않은 채 persist**
- **최종 해결책**: ✅ **Firebase Admin SDK 자체를 버림**. 클라이언트 SDK로 직접 Firestore 호출하도록 전체 아키텍처 변경 (`02d3d39`)
  - `/api/notes/route.ts` 삭제
  - `admin.ts` 삭제
  - `firebase-service-account.json` 삭제
  - `package.json`에서 `firebase-admin` 의존성 제거
  - `record/page.tsx`: `addDoc` + `updateDoc`/`setDoc`으로 직접 저장
  - `feed/page.tsx`: `getDocs` + `getDoc`으로 직접 조회
- **핵심 설계 변경점**: **`/api/structure`만 서버 라우트로 남기고, CRUD는 모두 클라이언트 SDK로 직접 처리**

### 🟡 문제 5: "저장하기" 버튼이 클릭이 안  (사용자 체감)
- **증상**: 미리보기 화면에서 "저장하기" 버튼이 눌리지 않음 (사용자 screenshot 참조: 버튼이 회색)
- **실제 원인**: 버튼 자체는 clickable했지만, `handleSave` 내부에서 `if (!user) return;`으로 **조용히 반환**하면서 아무 반응이 없었음. "클릭 안 된다"고 체감
- **왜 user가 null이었을까**: 익명 로그인(`signInAnonymously`)이 아직 완료되기 전에 미리보기 화면 진입 or `onAuthStateChanged`가 user를 내려주지 못한 상태
- **해결**:
  1. 미리보기 화면 상단에 **로그인 상태 배지** 추가 (🟢 로그인됨 / 🔴 로그인 안됨) (`aec498a`)
  2. "저장하기" 버튼에 명시적 `disabled={!user || authLoading}` 속성 추가
  3. 버튼 텍스트 동적 변경: `authLoading`→"로그인 중...", `!user`→"로그인 필요", 정상→"저장하기"
  4. `!user`일 때 `retryAuth()` 호출하는 **"🔐 로그인 재시도하기"** 버튼 추가
- **커밋**: `7d7eb06`, `aec498a`
- **주의**: 최신 commit `aec498a`까지 push는 됐으나, **Vercel 재배포 후 실제 동작 확인은 미완료** (사용자가 응답 중단 시점)

---

## 7. 현재 Vercel 환경변수 현황 (Production 기준)

### ✅ 등록된 변수
| 변수명 | 용도 |
|--------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 클라이언트 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 클라이언트 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 클라이언트 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase 클라이언트 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 클라이언트 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 클라이언트 |
| `OPENROUTER_API_KEY` | LLM 구조화 (서버 전용) |
| `OPENROUTER_MODEL` | `anthropic/claude-3-5-haiku` |

### ❌ 불필요하게 된 변수 (Admin SDK 제거로 인해)
- `FIREBASE_SERVICE_ACCOUNT_KEY` — 더 이상 필요 없음 (관리 안 해도 됨)
- `GOOGLE_APPLICATION_CREDENTIALS` — 더 이상 필요 없음

---

## 8. 현재 작동하는 것 vs 안 되는 것 (최신 기준)

### ✅ 작동 확인된 것
1. **LLM 구조화 (`/api/structure`)** — 텍스트 입력 → Gemini가 5개 필드 요약 → 미리보기 표시까지 OK
2. **음성 입력 버튼** — 브라우저 지원 환경에서 Web Speech API로 음성 인식 (ko-KR)
3. **Vercel 자동 배포** — GitHub push에 자동 트리거
4. **Firebase 익명 로그인** — 앱 진입 시 자동 `signInAnonymously`
5. **Firebase 초기화** — `client.ts`에 `getFirebaseApp()`/`getFirebaseAuth()`/`getFirebaseDb()` export

### ⚠️ 작동했지만 검증 필요한 것 (배포 후 실사용 테스트 필요)
1. **Firestore 직접 저장** (`record/page.tsx`의 `addDoc`) — 사용자 UID로 notes 컬렉션 add
2. **users 문서 sparkTotal 신** (`updateDoc` + fallback `setDoc`)
3. **피드 화면에서 getDocs 조회** (`feed/page.tsx`의 `where('userId', '==', uid)` → 메모리 정렬)
4. **"저장하기" 버튼** — 로그인 상태 배지 정상 표시, disabled 동작 확인 필요

### ❌ 아직 확인 안 된 것
- Vercel 재배포 후 실제로 노트가 Firestore에 저장되는지
- 피드 화면에 저장된 노트가 표시되는지
- 사용자 Console에 어떤 에러가 찍히는지
- 사용자가 **Firebase Console → Firestore Database → rules**가 어떻게 설정되어 있는지 (본인 document만 read/write 가능한지 확인 필요, MVP에서 아직 미설정일 가능성)

---

## 9. Firestore 보안 규칙 현황 (미확인)

아직 사용자로부터 확인받지 못했음. **현재 기본이 "잠겨 있다(tested mode false)"면 CRUD 모두 차단**될 수 있다.

### MVP에 필요한 최소 규칙 (권장)
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

## 10. 다음 단계 제안 (우선순위)

### 🔥 P0: 즉시 확인 필요
1. **사용자 Console 로그 수집** — 브라우져 F12 → Console 탭 → 전체 메시지 캡처
   - `Firebase Admin 초기화` 관련 경고가 더 이상 안 떠야 함 (admin.ts 제거됨)
   - `permission-denied` 에러가 뜨면 Firestore 보안 규칙이 문제
   - `getFirebaseDb()`이 `null` 반환하면 Firebase 클라이언트 초기화 환경변수 문제
2. **Firestore 보안 규칙 확인** — Firebase Console → Firestore → Rules에서 위 규칙 적용 권장
3. **로그인 상태 배지 테스트** — 배포 후 미리보기 화면에서 🟢/🔴 둘 중 뭐가 뜨는지

### 🟡 P1: 다음에 붙일 기능 (현재는 안 함)
- 파트너 매칭, 리워드 상점, 인사이트 대시보드, 감정 HP/MP → 전부 2차
- "회의 빼주기 / 조퇴권" → 아예 제외 (제품 컨셉 위반)
- Whisper API로 음성 품질 업그레이드
- 실시간 피드 (onSnapshot)
- Note 상세/수정 화면
- Vercel 환경변수 관리 자동화 (Vercel CLI `vercel env add`)

---

## 11. Claude에게 전달할 핵심 질문 (이 MD 파일의 목적)

1. **`record/page.tsx`의 `addDoc`이 실제로 Firestore에 문서를 만드는지 확인하는 방법?**
   - `getFirebaseDb()`이 null 반환하면 뭘 확인해야 하나?
   - `auth.currentUser.uid`가 유효한지 런타임 체크 코드 추가 필요?

2. **Firestore 보안 규칙이 막고 있는 경우, 어떤 에러 로그가 찍히나?**
   - `permission-denied`가 맞나? 아니면 다른 에러?

3. **`feed/page.tsx`의 `getDocs` 쿼리에서 메모리 정렬하는 게 MVP 기준으로 충분한가?**
   - 50개 limit이라 성능 이슈 없을 것으로 예상

4. **`useAuth` 훅의 `onAuthStateChanged`가 익명 로그인 후 user를 확실히 내려주는가?**
   - 현재 `signInAnonymously`를 `useEffect` 안에서 호출, `onAuthStateChanged`가 따로 listening
   - timing issue 가능성: `signInAnonymously` 비동기 완료 전에 `onAuthStateChanged`가 먼저 fire될 수 있는지?

5. **Vercel 재배포를 "Use existing Build Cache" 끄고 해야 하는가?**
   - `admin.ts`/`notes/route.ts` 삭제 같은 구조 변경은 반드시 캐시 끄고 재배포해야 함

---

## 12. 참고 링크

- GitHub: https://github.com/leek0915-jpg/crewnote_prototype_260626
- Vercel 프로젝트: https://vercel.com/leek0915-5076s-projects/crewnote
- Vercel 배포 목록: https://vercel.com/leek0915-5076s-projects/crewnote/deployments
- Vercel 환경변수: https://vercel.com/leek0915-5076s-projects/crewnote/settings/environment-variables
- Firebase Console: https://console.firebase.google.com/
- 프로덕션 URL: https://crewnote-iihelhatl-leek0915-5076s-projects.vercel.app
- 기존 디버깅 리포트: `crewnote/DEBUG_REPORT.md` ( outdated — 이 파일이 최신)

---

## 13. 결론 & 현재 블록커

**핵심 블록커는 "Firestore에 실제로 저장/조회가 되는지 미확인"이다.**

최신 코드는 클라이언트 SDK로 직접 CRUD하도록 완전히 갈아엎은 상태이고, 코드 자체는 정상이다. 하지만:
- Firestore 보안 규칙이 기본 잠금 상태일 수 있음
- Firebase 콘솔에서 Anonymous Auth가 enable인지 확인 안 됨
- 사용자 Console 로그를 안 받아봐서 에러 원인을 정확히 모름

**Claude에게 먼저 요청할 작업**: "브라우저 Console 로그를 알려주세요." 그 다음 로그에 따라 분기:
- `permission-denied` → 보안 규칙 수정 가이드
- `Firebase App not initialized` → 환경변수 확인
- `null db` → Firebase config 값 확인
- 성공 로그 → 피드/저장 동작 정상으로 판단