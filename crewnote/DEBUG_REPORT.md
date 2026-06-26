# CrewNote 디버깅 리포트

## 프로젝트 개요
- **제품**: CrewNote — 업무 기록 도구 (MVP)
- **기술 스택**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Firebase (Auth + Firestore) + OpenRouter API
- **배포**: Vercel (Root Directory: `crewnote`)
- **GitHub**: https://github.com/leek0915-jpg/crewnote_prototype_260626
- **Vercel URL**: https://crewnote-iihelhatl-leek0915-5076s-projects.vercel.app

---

## 현재 상태
- ✅ 로컬 개발 서버 (`npm run dev`) 정상 작동
- ✅ Vercel 빌드 성공 (빌드 에러는 firebase-admin 의존성 추가로 해결)
- ✅ LLM 구조화 (`/api/structure`) 정상 작동 — 텍스트 입력 → 구조화된 Note 미리보기까지 표시
- ❌ **"저장하기" 버튼 클릭 시 에러** — `/api/notes` POST 요청이 500 Internal Server Error 반환
- ❌ `/api/notes` GET 요청도 실패 — 피드 화면에 노트가 표시되지 않음

---

## 에러 상세

### 브라우저 Console 에러
```
POST https://crewnote-xxx.vercel.app/api/structure 500 (Internal Server Error)
구조화 에러: Error: LLM API 호출 실패 (400)
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### 문제 분석
1. `/api/structure` — 처음에는 500 에러였으나, Vercel에 `OPENROUTER_API_KEY` 환경변수 등록 후 **해결됨**
2. `/api/notes` — 여전히 500 에러. 원인은 **Firebase Admin SDK 초기화 실패**

---

## Firebase Admin SDK 초기화 문제

### 현재 코드 (`crewnote/src/lib/firebase/admin.ts`)
```typescript
function initializeAdmin() {
  if (initialized) return;
  try {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      // 1. Vercel 배포: 환경변수에 JSON 전체 저장
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        initialized = true;
        return;
      }
      // 2. 로컬: 서비스 계정 키 파일 사용
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (credentialsPath && fs.existsSync(credentialsPath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(path.resolve(credentialsPath), 'utf-8')
        );
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        initialized = true;
        return;
      }
      // 3. fallback: projectId만
      if (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
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
```

### 문제점
- Vercel 서버리스 환경에서는 `firebase-service-account.json` 파일이 없음
- `FIREBASE_SERVICE_ACCOUNT_KEY` 환경변수가 Vercel에 등록되지 않으면 fallback으로 `projectId`만 사용
- `projectId`만으로는 `getAuth()`와 `getFirestore()`가 제대로 작동하지 않음 (인증 불가)
- 결과적으로 `/api/notes` 라우트에서 `getAdminAuth()`가 `null`을 반환 → 500 에러

### 시도한 해결책
1. `FIREBASE_SERVICE_ACCOUNT_KEY` 환경변수 지원 추가 (admin.ts 수정) ✅ 코드 수정 완료
2. Git commit + push 완료 (commit `30bd4d7`)
3. **남은 작업**: Vercel 대시보드에서 `FIREBASE_SERVICE_ACCOUNT_KEY` 환경변수 등록 필요

---

## Vercel 환경변수 현황

### 등록된 변수 (Production)
| 변수명 | 상태 |
|--------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ 등록됨 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ 등록됨 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ 등록됨 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ 등록됨 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ 등록됨 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ 등록됨 |
| `OPENROUTER_API_KEY` | ✅ 등록됨 (LLM 구조화 해결) |
| `OPENROUTER_MODEL` | ✅ 등록됨 |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | ❌ **미등록** ← 이게 문제 |

### 필요한 조치
Vercel 대시보드 → Settings → Environment Variables에서:
- Key: `FIREBASE_SERVICE_ACCOUNT_KEY`
- Value: `firebase-service-account.json` 파일의 전체 JSON 내용
- Environment: Production 체크
- 저장 후 재배포 (Use existing Build Cache 체크 해제)

---

## 프로젝트 파일 구조
```
crewnote/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # / → /record 리다이렉트
│   │   ├── record/page.tsx       # 기록하기 화면
│   │   ├── feed/page.tsx         # 오늘의 피드
│   │   ── api/
│   │       ├── structure/route.ts  # LLM 구조화 API (✅ 작동)
│   │       └── notes/route.ts      # 노트 저장/조회 API (❌ 500 에러)
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts          # Firebase 클라이언트 (익명 인증)
│   │   │   ── admin.ts           # Firebase Admin SDK (서버 전용) ← 문제 발생
│   │   ├── llm/structure.ts       # OpenRouter 호출 로직
│   │   ├── models/note.ts         # Note 타입 정의
│   │   ├── constants.ts           # 상수
│   │   └── auth/useAuth.ts        # 인증 훅
│   └── components/
│       ├── record/                # 기록하기 컴포넌트
│       ├── feed/                  # 피드 컴포넌트
│       └── common/                # 공통 컴포넌트
├── firebase-service-account.json  # 서비스 계정 키 (로컬 전용, .gitignore됨)
├── .env.local                     # 로컬 환경변수
├── .env.example                   # 환경변수 템플릿
├── vercel.json                    # Vercel 빌드 설정
├── package.json                   # 의존성 (firebase, firebase-admin, openai 포함)
└── next.config.ts
```

---

## 핵심 질문 (Claude에게)

1. **Firebase Admin SDK를 Vercel 서버리스에서 올바르게 초기화하는 방법**은?
   - 서비스 계정 키를 환경변수로 저장하는 방식이 맞나?
   - 아니면 다른 방법(예: Vercel Integration, Workload Identity Federation)이 더 나은가?

2. **`/api/notes` 라우트가 500을 반환하는 정확한 원인**은?
   - Firebase Admin 초기화 실패가 맞나?
   - 아니면 다른 문제(예: Next.js 16 호환성, 서버리스 함수 타임아웃)일 가능성은?

3. **더 간단한 대안**이 있는가?
   - Firebase Admin SDK 대신 Firebase REST API를 직접 호출하는 방식은 어떤가?
   - 클라이언트 SDK를 서버에서 사용하는 방식은 가능한가?

4. **Vercel + Firebase Admin SDK의 모범 사례**는 무엇인가?