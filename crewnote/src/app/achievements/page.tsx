'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/useAuth';
import { BRAND } from '@/lib/constants';

// 뱃지 임계값 (피드와 동일) — 이모지 모두 채움
const BADGE_TIERS = [
  { threshold: 10,   emoji: '🌱', name: '첫 발걸음' },
  { threshold: 50,   emoji: '🌿', name: '기록의 습관' },
  { threshold: 100,  emoji: '⭐', name: '성실한 기록가' },
  { threshold: 300,  emoji: '💎', name: '열정의 기록가' },
  { threshold: 500,  emoji: '🏆', name: '레전드 기록가' },
  { threshold: 1000, emoji: '👑', name: '기록의 신' },
];

function getBadgeInfo(spark: number) {
  const achieved = BADGE_TIERS.filter(t => spark >= t.threshold);
  const next = BADGE_TIERS.find(t => spark < t.threshold);
  const current = achieved.length > 0 ? achieved[achieved.length - 1] : null;
  if (!next) return { current, next: null, progress: 100, needed: 0, achievedCount: achieved.length };
  const prevThreshold = current ? current.threshold : 0;
  const needed = next.threshold - prevThreshold;
  const progress = Math.round(((spark - prevThreshold) / needed) * 100);
  return { current, next, progress: Math.min(100, progress), needed: next.threshold - spark, achievedCount: achieved.length };
}

export default function AchievementsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sparkTotal, setSparkTotal] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const db = getFirebaseDb();
      if (!db) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      if (data) {
        setSparkTotal(data.sparkTotal || 0);
        setCurrentStreak(data.currentStreak || 0);
        setLongestStreak(data.longestStreak || 0);
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  const { current, next, progress, needed, achievedCount } = getBadgeInfo(sparkTotal);

  if (authLoading || !loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-text">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 상단 바 */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          <span className="text-xl">{BRAND.mascot.emoji}</span>
          <h1 className="font-semibold text-foreground">나의 업적</h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* 스트릭 카드 — 배경 더 진하게, 텍스트 더 진하게 */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">현재 스트릭</p>
              <p className="text-4xl font-extrabold mt-1">🔥 {currentStreak}일</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">최고 스트릭</p>
              <p className="text-2xl font-extrabold mt-1">🏆 {longestStreak}일</p>
            </div>
          </div>
          {currentStreak === 0 && (
            <p className="text-sm font-medium mt-3">첫 기록을 시작하면 스트릭이 시작돼요!</p>
          )}
          {currentStreak > 0 && currentStreak < 7 && (
            <p className="text-sm font-medium mt-3">매일 기록해서 스트릭을 늘려보세요!</p>
          )}
          {currentStreak >= 7 && currentStreak < 30 && (
            <p className="text-sm font-medium mt-3">일주일 달성! 대단해요!</p>
          )}
          {currentStreak >= 30 && (
            <p className="text-sm font-medium mt-3">한 달 연속! 레전드예요!</p>
          )}
        </div>

        {/* Spark 카드 */}
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">누적 Spark</p>
              <p className="text-4xl font-extrabold mt-1">{BRAND.mascot.emoji} {sparkTotal}</p>
            </div>
          </div>
        </div>

        {/* 뱃지 진행 상황 */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">배지 컬렉션</h2>
          <p className="text-sm text-muted-text mb-4">
            달성한 뱃지: <span className="font-bold text-primary">{achievedCount}</span> / {BADGE_TIERS.length}
          </p>

          <div className="space-y-3">
            {BADGE_TIERS.map((tier, i) => {
              const isAchieved = sparkTotal >= tier.threshold;
              const isNext = next && tier.threshold === next.threshold;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isAchieved ? 'bg-cream-dark' : 'bg-background'
                  } ${isNext ? 'border-2 border-primary/30' : 'border border-border'}`}
                >
                  <span className="text-2xl">{tier.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-bold ${isAchieved ? 'text-foreground' : 'text-foreground'}`}>
                      {tier.name}
                    </p>
                    <p className="text-xs text-muted-text">{tier.threshold} Spark</p>
                  </div>
                  {isAchieved && (
                    <span className="text-green-500 text-lg font-bold">✓</span>
                  )}
                  {isNext && (
                    <span className="text-xs text-primary font-bold">
                      {needed}개 남음
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 다음 뱃지 progress bar */}
        {next && (
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-3">
              다음 뱃지: {next.emoji} {next.name}
            </h3>
            <div className="w-full bg-cream rounded-full h-3 mb-2">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-text font-medium">
              {progress}% 달성 ({sparkTotal} / {next.threshold} Spark)
            </p>
          </div>
        )}

        {!next && (
          <div className="bg-card rounded-2xl p-5 border border-border text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-bold text-foreground">모든 뱃지를 달성했어요!</p>
            <p className="text-sm text-muted-text mt-1">레전드 기록의 신!</p>
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="sticky bottom-0 bg-card border-t border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-around">
          <button
            onClick={() => router.push('/feed')}
            className="flex flex-col items-center gap-0.5 text-muted-text hover:text-primary transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="text-xs font-medium">피드</span>
          </button>
          <button
            onClick={() => router.push('/record')}
            className="flex flex-col items-center gap-0.5 text-muted-text hover:text-primary transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <span className="text-xs font-medium">기록</span>
          </button>
          <button
            onClick={() => router.push('/achievements')}
            className="flex flex-col items-center gap-0.5 text-primary"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <span className="text-xs font-medium">업적</span>
          </button>
        </div>
      </nav>
    </div>
  );
}