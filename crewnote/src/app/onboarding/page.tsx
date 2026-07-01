'use client';

/**
 * 팀 온보딩 — 로그인 후 팀이 없을 때
 * - 팀 만들기(→ 팀장) 또는 참여 코드로 팀 참여(→ 팀원)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nori from '@/components/common/Nori';
import { useAuth } from '@/lib/auth/useAuth';
import { useProfile } from '@/lib/auth/useProfile';
import { createTeam, joinTeam } from '@/lib/team';

type Mode = 'choose' | 'create' | 'join';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [mode, setMode] = useState<Mode>('choose');
  const [teamName, setTeamName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // 로그인 안 됐으면 로그인으로, 이미 팀 있으면 피드로
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!profileLoading && profile?.teamId && !createdCode) {
      router.replace('/feed');
    }
  }, [user, loading, profile, profileLoading, router, createdCode]);

  const handleCreate = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const { joinCode } = await createTeam(user, teamName);
      setCreatedCode(joinCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : '팀 생성에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await joinTeam(user, code);
      router.replace('/feed');
    } catch (e) {
      setError(e instanceof Error ? e.message : '팀 참여에 실패했어요.');
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FFF1E6] flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-3 border-[#FF7A59] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1E6] flex flex-col items-center justify-center px-6 py-10 text-[#2B2B2B]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Nori mood="think" sizeClass="h-[120px]" />
          <h1 className="mt-3 text-2xl font-black tracking-tight">
            {createdCode ? '팀이 만들어졌어요!' : '팀에 들어가볼까요?'}
          </h1>
          <p className="mt-1.5 text-sm text-[#6B5D54]">
            {mode === 'choose' && !createdCode && '팀을 새로 만들거나, 참여 코드로 합류하세요.'}
            {mode === 'create' && !createdCode && '팀 이름을 정하면 당신이 팀장이 돼요.'}
            {mode === 'join' && '팀장에게 받은 참여 코드를 입력하세요.'}
          </p>
        </div>

        {/* 팀 생성 완료 → 코드 안내 */}
        {createdCode ? (
          <div className="space-y-5 text-center">
            <p className="text-sm text-[#6B5D54]">팀원에게 아래 <b>참여 코드</b>를 공유하세요</p>
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#FF7A59] py-6">
              <p className="text-4xl font-black tracking-[0.3em] text-[#FF7A59]">{createdCode}</p>
            </div>
            <button
              onClick={() => router.replace('/team')}
              className="w-full py-4 rounded-2xl bg-[#FF7A59] text-white font-bold shadow-lg shadow-[#FF7A59]/30 hover:-translate-y-0.5 transition-all"
            >
              팀 대시보드로 가기 →
            </button>
          </div>
        ) : mode === 'choose' ? (
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setMode('create')}
              className="rounded-2xl bg-white border border-[#E5DCD3] p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-1">👑</div>
              <p className="font-bold">팀 만들기</p>
              <p className="text-sm text-[#6B5D54]/70 mt-0.5">내가 팀장이 되어 팀을 시작해요</p>
            </button>
            <button
              onClick={() => setMode('join')}
              className="rounded-2xl bg-white border border-[#E5DCD3] p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-1">🙋</div>
              <p className="font-bold">참여 코드로 팀 참여</p>
              <p className="text-sm text-[#6B5D54]/70 mt-0.5">팀장에게 받은 코드로 합류해요</p>
            </button>
          </div>
        ) : mode === 'create' ? (
          <div className="space-y-3">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: 마케팅 2팀"
              maxLength={20}
              className="w-full rounded-2xl border border-[#E5DCD3] bg-white px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/40"
            />
            {error && <p className="text-sm text-red-500 px-1">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={busy || !teamName.trim()}
              className="w-full py-4 rounded-2xl bg-[#FF7A59] text-white font-bold shadow-lg shadow-[#FF7A59]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {busy ? '만드는 중...' : '팀 만들기'}
            </button>
            <button onClick={() => { setMode('choose'); setError(null); }} className="w-full py-2 text-sm text-[#6B5D54]/60">← 뒤로</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="참여 코드 (예: ABC123)"
              maxLength={6}
              className="w-full rounded-2xl border border-[#E5DCD3] bg-white px-4 py-4 tracking-[0.2em] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/40"
            />
            {error && <p className="text-sm text-red-500 px-1">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={busy || !code.trim()}
              className="w-full py-4 rounded-2xl bg-[#FF7A59] text-white font-bold shadow-lg shadow-[#FF7A59]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {busy ? '참여 중...' : '팀 참여하기'}
            </button>
            <button onClick={() => { setMode('choose'); setError(null); }} className="w-full py-2 text-sm text-[#6B5D54]/60">← 뒤로</button>
          </div>
        )}
      </div>
    </div>
  );
}
