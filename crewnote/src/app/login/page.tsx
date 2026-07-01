'use client';

/**
 * 로그인 화면 (시연용 목업)
 * - 실제 인증 연결은 아직 없음. 구글 버튼/역할 선택은 화면 이동만 한다.
 * - 방향성(구글 로그인 + 팀원/팀장 구분)을 시연에서 보여주기 위한 UI.
 */

import { useRouter } from 'next/navigation';
import Nori from '@/components/common/Nori';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF1E6] flex flex-col items-center justify-center px-6 py-10 text-[#2B2B2B]">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* 마스코트 */}
        <Nori mood="wave" sizeClass="h-[150px]" />

        <h1 className="mt-4 text-3xl font-black text-[#FF7A59] tracking-tight">CrewNote</h1>
        <p className="mt-2 text-[#6B5D54] font-medium">우리 팀의 오늘을 기록해요</p>

        {/* 구글 로그인 (목업) */}
        <button
          onClick={() => router.push('/feed')}
          className="mt-8 w-full flex items-center justify-center gap-3 bg-white border border-[#E5DCD3] rounded-2xl py-4 font-bold text-[#2B2B2B] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <GoogleIcon />
          Google 계정으로 계속하기
        </button>

        <p className="mt-3 text-xs text-[#6B5D54]/60">
          로그인하면 팀에서 나의 기록이 안전하게 관리돼요
        </p>

        {/* 역할 미리보기 (시연용) */}
        <div className="mt-10 w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E5DCD3]" />
            <span className="text-xs font-bold text-[#6B5D54]/50 uppercase tracking-widest">데모 미리보기</span>
            <div className="flex-1 h-px bg-[#E5DCD3]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/feed')}
              className="rounded-2xl bg-white border border-[#E5DCD3] p-4 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-1">🙋</div>
              <p className="font-bold text-sm">팀원으로 둘러보기</p>
              <p className="text-xs text-[#6B5D54]/70 mt-0.5">내 기록 화면</p>
            </button>
            <button
              onClick={() => router.push('/team')}
              className="rounded-2xl bg-[#FF7A59] text-white p-4 text-left hover:-translate-y-0.5 hover:shadow-lg shadow-[#FF7A59]/30 transition-all"
            >
              <div className="text-2xl mb-1">👑</div>
              <p className="font-bold text-sm">팀장으로 둘러보기</p>
              <p className="text-xs text-white/80 mt-0.5">팀 대시보드</p>
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push('/landing')}
          className="mt-8 text-sm text-[#6B5D54]/60 hover:text-[#FF7A59] transition-colors"
        >
          ← 소개 페이지로
        </button>
      </div>
    </div>
  );
}
