'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/common/TopBar';
import { useAuth } from '@/lib/auth/useAuth';
import { BRAND } from '@/lib/constants';

// Note 타입 (API 응답용)
interface NoteCard {
  id: string;
  createdAt: string;
  summary: string;
  mainTasks: string[];
  sparkAwarded: number;
}

type PageState = 'auth' | 'loading' | 'empty' | 'loaded';

export default function FeedPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, getIdToken, retryAuth } = useAuth();
  const [state, setState] = useState<PageState>('auth');
  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [sparkTotal, setSparkTotal] = useState(0);

  // 노트 로드 함수
  const loadNotes = useCallback(async () => {
    if (!user) return;

    setState('loading');

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('인증 토큰을 가져올 수 없습니다.');
      }

      const response = await fetch('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '노트 로딩 실패');
      }

      setSparkTotal(result.sparkTotal || 0);
      setNotes(result.notes || []);
      setState(result.notes?.length > 0 ? 'loaded' : 'empty');
    } catch (error) {
      console.error('노트 로딩 에러:', error);
      setState('empty');
    }
  }, [user, getIdToken]);

  // 인증 완료 후 자동으로 노트 로드
  useEffect(() => {
    if (!authLoading && user) {
      loadNotes();
    }
  }, [authLoading, user, loadNotes]);

  // 오늘 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* 인증 대기 */}
        {state === 'auth' && authLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-6xl animate-bounce">🦊</div>
            <p className="text-muted-text">불러오는 중...</p>
          </div>
        )}

        {state === 'auth' && authError && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-6xl">⚠️</div>
            <p className="text-muted-text text-center">{authError}</p>
            <button
              onClick={retryAuth}
              className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Spark 요약 카드 */}
        {(state === 'loading' || state === 'empty' || state === 'loaded') && (
          <>
            <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white mb-6 shadow-lg shadow-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">누적 Spark</p>
                  <p className="text-3xl font-bold mt-1">
                    {BRAND.mascot.emoji} {sparkTotal}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">오늘 기록</p>
                  <p className="text-2xl font-bold mt-1">
                    {notes.filter(n => {
                      const today = new Date();
                      const date = new Date(n.createdAt);
                      return date.toDateString() === today.toDateString();
                    }).length}개
                  </p>
                </div>
              </div>
            </div>

            {/* 새 기록 버튼 */}
            <button
              onClick={() => router.push('/record')}
              className="w-full mb-6 py-4 rounded-xl bg-card border-2 border-dashed border-primary/30 text-primary font-semibold hover:border-primary hover:bg-cream-dark transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>새로운 기록 추가</span>
            </button>
          </>
        )}

        {/* 로딩 중 */}
        {state === 'loading' && (
          <div className="text-center py-12">
            <p className="text-muted-text">노트를 불러오는 중...</p>
          </div>
        )}

        {/* 빈 상태 */}
        {state === 'empty' && (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🦊</div>
            <p className="text-muted-text">아직 기록이 없어요.</p>
            <p className="text-sm text-muted-text">
              오늘 한 일을 기록해보세요!
            </p>
          </div>
        )}

        {/* 노트 리스트 */}
        {state === 'loaded' && (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-foreground flex-1">
                    {note.summary}
                  </p>
                  <span className="text-xs text-spark font-semibold whitespace-nowrap bg-spark-glow/30 px-2 py-0.5 rounded-full">
                    ✨ +{note.sparkAwarded}
                  </span>
                </div>

                {note.mainTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.mainTasks.slice(0, 3).map((task, i) => (
                      <span
                        key={i}
                        className="text-xs bg-cream px-2 py-0.5 rounded-full text-muted-text"
                      >
                        {task}
                      </span>
                    ))}
                    {note.mainTasks.length > 3 && (
                      <span className="text-xs text-muted-text">
                        +{note.mainTasks.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-text mt-2">
                  {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 하단 네비게이션 (MVP에서는 간단히) */}
      <nav className="sticky bottom-0 bg-card border-t border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-around">
          <button
            onClick={() => router.push('/feed')}
            className="flex flex-col items-center gap-0.5 text-primary"
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
        </div>
      </nav>
    </div>
  );
}