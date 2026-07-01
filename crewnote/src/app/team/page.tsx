'use client';

/**
 * 팀장 대시보드 — 실데이터
 * - 팀장만 접근 (팀원/비로그인은 리다이렉트)
 * - 팀원 목록 + 각자 최근 기록을 모아 본다
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { useProfile } from '@/lib/auth/useProfile';
import { getTeamMembers, getTeamNotes, type TeamMember, type MemberNote } from '@/lib/team';
import Nori from '@/components/common/Nori';

const AVATAR_COLORS = ['#FF7A59', '#4C9AFF', '#22C55E', '#A855F7', '#F59E0B', '#EC4899'];

export default function TeamDashboardPage() {
  const router = useRouter();
  const { profile, loading: profileLoading, user } = useProfile();

  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 접근 가드
  useEffect(() => {
    if (profileLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!profile?.teamId) {
      router.replace('/onboarding');
      return;
    }
    if (profile.role !== 'leader') {
      router.replace('/feed'); // 팀원은 대시보드 접근 불가
    }
  }, [user, profile, profileLoading, router]);

  // 데이터 로드
  useEffect(() => {
    if (profileLoading || !profile?.teamId || profile.role !== 'leader') return;
    const load = async () => {
      setLoading(true);
      try {
        const db = getFirebaseDb();
        if (db) {
          const teamSnap = await getDoc(doc(db, 'teams', profile.teamId!));
          const t = teamSnap.data();
          setTeamName(t?.name || '우리 팀');
          setJoinCode(t?.joinCode || '');
        }
        const [ms, ns] = await Promise.all([
          getTeamMembers(profile.teamId!),
          getTeamNotes(profile.teamId!),
        ]);
        setMembers(ms);
        setNotes(ns);
      } catch (e) {
        console.error('팀 데이터 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.teamId, profile?.role, profileLoading]);

  const latestByUser = useMemo(() => {
    const map: Record<string, MemberNote> = {};
    for (const n of notes) if (!map[n.userId]) map[n.userId] = n; // notes는 최신순 정렬됨
    return map;
  }, [notes]);

  const weekNotes = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return notes.filter((n) => new Date(n.createdAt).getTime() >= weekAgo).length;
  }, [notes]);

  const teamSpark = useMemo(() => members.reduce((s, m) => s + (m.sparkTotal || 0), 0), [members]);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const today = d.toDateString() === now.toDateString();
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return today ? `오늘 ${hh}:${mm}` : `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (profileLoading || loading || profile?.role !== 'leader') {
    return (
      <div className="min-h-screen bg-[#FFF1E6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Nori mood="think" size={110} />
          <p className="text-sm text-[#6B5D54]">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF1E6] text-[#2B2B2B]">
      <header className="sticky top-0 z-50 bg-[#FFF1E6]/85 backdrop-blur border-b border-[#FFE4CC]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push('/feed')}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FFE4CC] text-[#6B5D54] transition-colors"
            aria-label="피드로"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="text-sm font-bold">팀 대시보드</span>
          <span className="text-xs font-bold text-white bg-[#FF7A59] px-2.5 py-1 rounded-full">👑 팀장</span>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-5">
        {/* 팀 요약 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#FF9A7E] p-5 text-white shadow-lg shadow-[#FF7A59]/25">
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">{teamName}</p>
            <p className="text-2xl font-black mt-0.5">우리 팀, 오늘도 기록 중 🔥</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-white/15 rounded-xl py-2.5 text-center">
                <p className="text-xl font-black">{members.length}</p>
                <p className="text-[11px] opacity-90">팀원</p>
              </div>
              <div className="bg-white/15 rounded-xl py-2.5 text-center">
                <p className="text-xl font-black">{weekNotes}</p>
                <p className="text-[11px] opacity-90">이번 주 기록</p>
              </div>
              <div className="bg-white/15 rounded-xl py-2.5 text-center">
                <p className="text-xl font-black">{teamSpark}</p>
                <p className="text-[11px] opacity-90">팀 Spark</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1 right-1 opacity-90 pointer-events-none">
            <Nori mood="celebrate" sizeClass="h-[84px]" />
          </div>
        </div>

        {/* 참여 코드 */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#FFE4CC] px-4 py-3">
          <div>
            <p className="text-xs text-[#6B5D54]/70">팀원 초대 코드</p>
            <p className="text-lg font-black tracking-[0.2em] text-[#FF7A59]">{joinCode || '—'}</p>
          </div>
          <button
            onClick={copyCode}
            className="text-xs font-bold text-white bg-[#FF7A59] px-3 py-2 rounded-full hover:-translate-y-0.5 transition-all"
          >
            {copied ? '복사됨!' : '코드 복사'}
          </button>
        </div>

        {/* 팀원 리스트 */}
        <div>
          <h2 className="text-sm font-bold mb-3 px-1">팀원들의 최근 기록</h2>
          <div className="space-y-3">
            {members.map((m, i) => {
              const note = latestByUser[m.uid];
              return (
                <div key={m.uid} className="bg-white rounded-2xl p-4 border border-[#FFE4CC]">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                    >
                      {m.displayName[0] || '?'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate">{m.displayName}</p>
                        <span className="text-[11px] text-[#6B5D54]/60 flex-shrink-0">
                          {m.role === 'leader' ? '팀장' : '팀원'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B5D54]/70">{note ? fmt(note.createdAt) : '아직 기록 없음'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-[#FF7A59]">✨ {m.sparkTotal}</p>
                      <p className="text-[11px] text-[#6B5D54]/70">🔥 {m.currentStreak}일</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-[#FFF1E6] rounded-xl px-3 py-2.5">
                    {note ? (
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold text-[#FF7A59]">요약 · </span>
                        {note.summary || '(요약 없음)'}
                      </p>
                    ) : (
                      <p className="text-xs text-[#6B5D54]/50">이 팀원은 아직 기록을 남기지 않았어요.</p>
                    )}
                  </div>
                </div>
              );
            })}
            {members.length === 0 && (
              <p className="text-center text-sm text-[#6B5D54]/60 py-8">
                아직 팀원이 없어요. 위 초대 코드를 공유해보세요!
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-[#6B5D54]/50 pt-2">
          팀장은 팀원이 남긴 기록을 모아 볼 수 있어요.
        </p>
      </main>
    </div>
  );
}
