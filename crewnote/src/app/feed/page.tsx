'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import TopBar from '@/components/common/TopBar';
import { useAuth } from '@/lib/auth/useAuth';
import { BRAND } from '@/lib/constants';

// Note 타입
interface NoteCard {
  id: string;
  createdAt: string;
  summary: string;
  mainTasks: string[];
  sparkAwarded: number;
}

type PageState = 'auth' | 'loading' | 'empty' | 'loaded';

// 지 임계값 (누적 Spark 기준)
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
  if (!next) return { current, next: null, progress: 100, needed: 0 };
  const prevThreshold = current ? current.threshold : 0;
  const needed = next.threshold - prevThreshold;
  const progress = Math.round(((spark - prevThreshold) / needed) * 100);
  return { current, next, progress: Math.min(100, progress), needed: next.threshold - spark };
}

export default function FeedPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, retryAuth } = useAuth();
  const [state, setState] = useState<PageState>('auth');
  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [sparkTotal, setSparkTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 노트 로드 함수
  const loadNotes = useCallback(async () => {
    if (!user) return;

    setState('loading');

    try {
      const db = getFirebaseDb();
      if (!db) throw new Error('Firestore 초기화 실패');

      const userId = user.uid;

      // 1. users 문서에서 sparkTotal 조회
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      setSparkTotal(userData ? (userData.sparkTotal || 0) : 0);

      // 2. notes 컬렉션에서 내 노트 조회 (userId 필터)
      const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', userId)
      );
      const notesSnapshot = await getDocs(notesQuery);

      // 메모리에서 최신순 정렬
      const notesList: NoteCard[] = notesSnapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            summary: data.summary || '',
            mainTasks: data.mainTasks || [],
            sparkAwarded: data.sparkAwarded || 10,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotes(notesList);
      setState(notesList.length > 0 ? 'loaded' : 'empty');
    } catch (error) {
      console.error('노트 로딩 에러:', error);
      setState('empty');
    }
  }, [user]);

  // 인증 완료 후 자동으로 노트 로드
  useEffect(() => {
    if (!authLoading && user) {
      loadNotes();
    }
  }, [authLoading, user, loadNotes]);

  // 노트 삭제 (Spark 차감 포함)
  const handleDeleteNote = async (note: NoteCard) => {
    if (!user) return;

    try {
      const db = getFirebaseDb();
      if (!db) throw new Error('Firestore 초기화 실패');

      setDeletingId(note.id);

      // 1. notes 문서 삭제
      await deleteDoc(doc(db, 'notes', note.id));

      // 2. users sparkTotal 차감
      const userRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userRef);
      const snapData = userDocSnap.data();
      if (snapData) {
        await updateDoc(userRef, {
          sparkTotal: Math.max(0, (snapData.sparkTotal || 0) - note.sparkAwarded),
        });
      }

      setSparkTotal(prev => Math.max(0, prev - note.sparkAwarded));

      // 3. 로컬 상태에서 제거
      setNotes(prev => prev.filter(n => n.id !== note.id));
      if (notes.length - 1 === 0) setState('empty');
    } catch (error) {
      console.error('노트 삭제 에러:', error);
      alert('노트 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (note: NoteCard) => {
    if (window.confirm(`"${note.summary}" 노트를 삭제하시겠어요?\nSpark -${note.sparkAwarded}개가 차감됩니다.`)) {
      handleDeleteNote(note);
    }
  };

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

  // Spark 카드 렌더링 (뱃지 포함)
  const renderSparkCard = () => {
    const { current, next, progress, needed } = getBadgeInfo(sparkTotal);

    return (
      <div
        className={
          notes.length === 0
            ? "bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white mb-6 shadow-lg shadow-primary/20 flex flex-col items-center space-y-3"
            : "bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white mb-6 shadow-lg shadow-primary/20"
        }
      >
        {notes.length === 0 && current == null ? (
          <>
            <p className="text-xl font-semibold"> 뱃지도 기록도 없네요!</p>
            <p className="text-sm opacity-90">기록을 시작하면 Spark가 쌓여 뱃지를 얻을 수 있어요</p>
          </>
        ) : next == null ? (
          <>
            <div className="flex items-center justify-between mb-2 w-full">
              <div>
                <p className="text-sm opacity-90">누적 Spark</p>
                <p className="text-3xl font-bold mt-1">{BRAND.mascot.emoji} {sparkTotal}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">총 기록</p>
                <p className="text-2xl font-bold mt-1">{notes.length}개</p>
              </div>
            </div>
            <p className="text-sm font-semibold">🎉 모든 뱃지를 달성했어요! 레전드 기록의 신!</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm opacity-90">누적 Spark</p>
                <p className="text-3xl font-bold mt-1">{BRAND.mascot.emoji} {sparkTotal}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">총 기록</p>
                <p className="text-2xl font-bold mt-1">{notes.length}개</p>
              </div>
            </div>
            {current && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">
                  {current.emoji} {current.name} 달성!
                </span>
              </div>
            )}
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm opacity-90">
              🔥 {next.emoji} {next.name}까지 <span className="font-bold">{needed}</span> Spark 남았어요!
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* 인증 대기 */}
        {state === 'auth' && authLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-6xl animate-bounce"></div>
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

        {/* Spark 요약 카드 + 새 기록 버튼 */}
        {(state === 'loading' || state === 'empty' || state === 'loaded') && (
          <>
            {renderSparkCard()}

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
          <div className="text-center py-6 space-y-4">
            {/* 마스코트 환영 */}
            <div className="space-y-2">
              <div className="text-6xl">🦊</div>
              <h2 className="text-xl font-bold text-foreground">환영해요! 노리예요!</h2>
              <p className="text-xs text-muted-text">
                <br />두서없이 말해도 노리가 정리해드릴게요.
              </p>
            </div>

            {/* 첫 기록 CTA 버튼 */}
            <button
              onClick={() => router.push('/record')}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>지금 첫 기록 시작하기</span>
            </button>

            {/* Spark 보상 설명 */}
            <div className="bg-cream-dark rounded-xl p-3 border border-cream">
              <p className="text-xs text-foreground">
                <span className="text-spark font-semibold">✨ Spark</span>는 기록할 때마다 쌓여요!
              </p>
              <p className="text-xs text-muted-text mt-1">
                한 줄만 적어도 됩니다. 노리가 나머지는 알아서 정리해드려요 🦊
              </p>
            </div>
          </div>
        )}

        {/* 노트 리스트 */}
        {state === 'loaded' && (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-2 mb-2">
                  <p className="font-medium text-foreground flex-1">
                    {note.summary}
                  </p>
                  <span className="text-xs text-spark font-semibold whitespace-nowrap bg-spark-glow/30 px-2 py-0.5 rounded-full">
                     +{note.sparkAwarded}
                  </span>
                  {/* 삭제 버튼 (클릭 이벤트 전파 방지) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmDelete(note); }}
                    disabled={deletingId === note.id}
                    className="flex-shrink-0 text-xs text-muted-text hover:text-error transition-colors disabled:opacity-40 p-1"
                    aria-label="노트 삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
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

      {/* 하단 네비게이션 */}
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
                    <button
            onClick={() => router.push('/achievements')}
            className="flex flex-col items-center gap-0.5 text-muted-text hover:text-primary transition-colors"
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