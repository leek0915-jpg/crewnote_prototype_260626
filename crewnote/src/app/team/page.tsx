'use client';

/**
 * 팀장 대시보드 (시연용 목업)
 * - 실제 데이터 연결 없음. 팀장이 팀원들의 기록을 한눈에 보는 방향성을 보여준다.
 * - 샘플 데이터로 구성.
 */

import { useRouter } from 'next/navigation';
import Nori from '@/components/common/Nori';

const TEAM = { name: '마케팅 2팀', memberCount: 4, weekNotes: 37, totalSpark: 1240 };

const MEMBERS = [
  { name: '김지영', spark: 420, streak: 12, color: '#FF7A59', when: '오늘 14:20',
    note: '랜딩페이지 카피 A/B 테스트 설계 완료, 다음 주 배포 예정' },
  { name: '박민수', spark: 380, streak: 8, color: '#4C9AFF', when: '오늘 11:05',
    note: '결제 모듈 핫픽스 배포 및 회귀 테스트 통과' },
  { name: '이수진', spark: 290, streak: 5, color: '#22C55E', when: '어제 17:40',
    note: '주간 마케팅 회의 — 인스타 중심 캠페인 방향 확정' },
  { name: '정우성', spark: 150, streak: 2, color: '#A855F7', when: '어제 09:30',
    note: '신규 유입 데이터 GA 대시보드 정리 및 공유' },
];

export default function TeamDashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF1E6] text-[#2B2B2B]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[#FFF1E6]/85 backdrop-blur border-b border-[#FFE4CC]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push('/login')}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FFE4CC] text-[#6B5D54] transition-colors"
            aria-label="뒤로"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="text-sm font-bold">팀 대시보드</span>
          <span className="text-xs font-bold text-white bg-[#FF7A59] px-2.5 py-1 rounded-full">👑 팀장</span>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-5">
        {/* 팀 요약 카드 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#FF9A7E] p-5 text-white shadow-lg shadow-[#FF7A59]/25">
          <div className="relative z-10">
            <p className="text-sm opacity-90 font-medium">{TEAM.name}</p>
            <p className="text-2xl font-black mt-0.5">우리 팀, 오늘도 기록 중 🔥</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-white/15 rounded-xl py-2.5 text-center">
                <p className="text-xl font-black">{TEAM.memberCount}</p>
                <p className="text-[11px] opacity-90">팀원</p>
              </div>
              <div className="bg-white/15 rounded-xl py-2.5 text-center">
                <p className="text-xl font-black">{TEAM.weekNotes}</p>
                <p className="text-[11px] opacity-90">이번 주 기록</p>
              </div>
              <div className="bg-white/15 rounded-xl py-2.5 text-center">
                <p className="text-xl font-black">{TEAM.totalSpark}</p>
                <p className="text-[11px] opacity-90">팀 Spark</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-3 -right-2 opacity-90 pointer-events-none">
            <Nori mood="celebrate" sizeClass="h-[86px]" />
          </div>
        </div>

        {/* 팀원 리스트 */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-[#2B2B2B]">팀원들의 최근 기록</h2>
            <button className="text-xs font-bold text-[#FF7A59] hover:underline">+ 팀원 초대</button>
          </div>

          <div className="space-y-3">
            {MEMBERS.map((m) => (
              <button
                key={m.name}
                onClick={() => alert(`${m.name} 님의 전체 기록 보기\n(시연용 목업 화면입니다)`)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-[#FFE4CC] hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.name[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{m.name}</p>
                      <span className="text-[11px] text-[#6B5D54]/60">팀원</span>
                    </div>
                    <p className="text-[11px] text-[#6B5D54]/70">{m.when}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-[#FF7A59]">✨ {m.spark}</p>
                    <p className="text-[11px] text-[#6B5D54]/70">🔥 {m.streak}일</p>
                  </div>
                </div>
                <div className="mt-3 bg-[#FFF1E6] rounded-xl px-3 py-2.5">
                  <p className="text-xs text-[#2B2B2B] leading-relaxed">
                    <span className="font-bold text-[#FF7A59]">요약 · </span>{m.note}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-[#6B5D54]/50 pt-2">
          * 팀장은 팀원이 공유한 기록을 모아 볼 수 있어요 (시연용 예시 데이터)
        </p>
      </main>
    </div>
  );
}
