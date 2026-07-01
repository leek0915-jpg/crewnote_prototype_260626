'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/useAuth';
import Nori from '@/components/common/Nori';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [noteLoading, setNoteLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !id) {
      setNoteLoading(false);
      return;
    }
    const load = async () => {
      const db = getFirebaseDb();
      if (!db) { setNoteLoading(false); return; }
      const snap = await getDoc(doc(db, 'notes', id));
      if (snap.exists()) setNote({ id: snap.id, ...snap.data() });
      setNoteLoading(false);
    };
    load();
  }, [id, user, loading]);

  // 로그인 안 됐으면 로그인 화면으로
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  const handleDelete = async () => {
    if (!note || !user) return;
    setDeleting(true);
    try {
      const db = getFirebaseDb();
      if (!db) return;
      await deleteDoc(doc(db, 'notes', note.id));
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      if (data) {
        await updateDoc(userRef, {
          sparkTotal: Math.max(0, (data.sparkTotal || 0) - (note.sparkAwarded || 10)),
        });
      }
      router.push('/feed');
    } catch (error) {
      console.error('삭제 에러:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d: any) => {
    if (!d) return '';
    const date = d?.toDate ? d.toDate() : new Date(d);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || noteLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Nori mood="think" size={120} />
          <p className="text-sm text-muted-text">노리가 기록을 펼치는 중...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-cream-dark transition-colors text-muted-text"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <Nori mood="sleepy" size={140} />
          <p className="text-lg font-semibold text-foreground">노트를 찾을 수 없어요</p>
          <p className="text-sm text-muted-text text-center">삭제됐거나 존재하지 않는 노트예요.</p>
          <button
            onClick={() => router.push('/feed')}
            className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            피드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-cream-dark transition-colors text-muted-text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-foreground">기록 상세</span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 text-muted-text hover:text-red-400 transition-colors"
            aria-label="삭제"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-10">
        {/* 히어로: 요약 + 메타 */}
        <div className="relative mt-4 mb-5 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-light p-6 text-white shadow-lg shadow-primary/25">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">요약</span>
              <span className="text-xs text-white/70">{formatDate(note.createdAt)}</span>
            </div>
            <p className="text-base font-medium leading-relaxed pr-16">{note.summary || '요약 없음'}</p>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="text-lg">✨</span>
              <span className="text-sm font-bold">+{note.sparkAwarded || 10} Spark 획득</span>
            </div>
          </div>
          {/* 축하하는 노리 */}
          <div className="absolute -bottom-1 right-2 z-10 pointer-events-none">
            <Nori mood="celebrate" size={96} />
          </div>
        </div>

        {/* 주요 업무 */}
        {note.mainTasks?.length > 0 && (
          <Section icon="💼" title="주요 업무">
            <ul className="space-y-2.5">
              {note.mainTasks.map((t: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-foreground text-sm leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 협업 동료 */}
        {note.collaborators?.length > 0 && (
          <Section icon="🤝" title="함께한 동료">
            <div className="flex flex-wrap gap-2">
              {note.collaborators.map((c: string, i: number) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-cream px-3 py-1.5 rounded-full text-sm text-foreground font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                    {c[0]}
                  </span>
                  {c}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* 해결한 문제 */}
        {note.problemSolved && (
          <Section icon="🔧" title="해결한 문제">
            <p className="text-sm text-foreground leading-relaxed">{note.problemSolved}</p>
          </Section>
        )}

        {/* 배운 점 */}
        {note.learned && (
          <Section icon="💡" title="배운 점">
            <p className="text-sm text-foreground leading-relaxed">{note.learned}</p>
          </Section>
        )}

        {/* 원본 입력 (토글) */}
        {note.rawInput && (
          <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowRaw(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📄</span>
                <span className="text-sm font-semibold text-foreground">원본 입력</span>
              </div>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`text-muted-text transition-transform duration-200 ${showRaw ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showRaw && (
              <div className="px-5 pb-5">
                <div className="bg-cream rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-text italic leading-relaxed whitespace-pre-wrap">{note.rawInput}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 노리의 한마디 */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3">
          <Nori mood="happy" size={56} animate={false} className="flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-primary mb-0.5">노리의 한마디</p>
            <p className="text-sm text-foreground leading-relaxed">
              오늘도 멋지게 기록했어요. 이 한 줄이 더 나은 내일을 만들어요! 🌱
            </p>
          </div>
        </div>
      </main>

      {/* 삭제 확인 바텀시트 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-lg bg-card rounded-t-3xl p-6 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl mb-1">
                🗑️
              </div>
              <p className="font-bold text-foreground text-lg">노트를 삭제할까요?</p>
              <p className="text-sm text-muted-text">
                삭제하면 <span className="font-semibold text-primary">✨ {note.sparkAwarded || 10} Spark</span>가 차감돼요.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-cream transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
