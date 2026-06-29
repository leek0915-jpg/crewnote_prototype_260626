'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/useAuth';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const load = async () => {
      const db = getFirebaseDb();
      if (!db) return;
      const snap = await getDoc(doc(db, 'notes', id));
      if (snap.exists()) setNote({ id: snap.id, ...snap.data() });
    };
    load();
  }, [id, user]);

  const handleDelete = async () => {
    if (!note || !user) return;
    if (!window.confirm('이 노트를 삭제할까요? Spark가 차감됩니다.')) return;

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
    return date.toLocaleString('ko-KR', { year: '2-digit', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-text">로딩 중...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
            <button onClick={() => router.back()} className="text-muted-text hover:text-foreground">
              ←
            </button>
            <h1 className="font-semibold">노트 상세</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <p className="text-6xl">️</p>
            <p className="text-muted-text">노트를 찾을 수 없어요.</p>
            <button onClick={() => router.back()} className="text-primary font-medium underline">
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-text hover:text-foreground transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="font-semibold text-foreground">노트 상세</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 요약 */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">📝 요약</h2>
          <p className="text-foreground leading-relaxed">{note.summary || '요약 없음'}</p>
        </div>

        {/* 주요 업무 */}
        {note.mainTasks?.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">💼 주요 업무</h2>
            <ul className="space-y-2">
              {note.mainTasks.map((t: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 협업 동료 */}
        {note.collaborators?.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">🤝 함께한 동료</h2>
            <div className="flex flex-wrap gap-2">
              {note.collaborators.map((c: string, i: number) => (
                <span key={i} className="bg-cream px-3 py-1 rounded-full text-sm text-foreground">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* 문제 해결 */}
        {note.problemSolved && (
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">🔧 해결한 문제</h2>
            <p className="leading-relaxed text-foreground">{note.problemSolved}</p>
          </div>
        )}

        {/* 배운 점 */}
        {note.learned && (
          <div className="bg-card rounded-2xl p-5 border border-border">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">💡 배운 점</h2>
            <p className="leading-relaxed text-foreground">{note.learned}</p>
          </div>
        )}

        {/* 원본 */}
        {note.rawInput && (
          <details className="bg-card rounded-2xl p-5 border border-border">
            <summary className="text-xs font-semibold text-primary uppercase tracking-wide cursor-pointer select-none">
              📄 원본 보기
            </summary>
            <p className="mt-3 bg-cream-dark rounded-xl p-3 text-sm italic text-muted-text whitespace-pre-wrap leading-relaxed">
              {note.rawInput}
            </p>
          </details>
        )}

        {/* 메타 */}
        <div className="flex items-center justify-between text-xs text-muted-text pt-2">
          <span>{formatDate(note.createdAt)}</span>
          <span className="text-spark font-semibold">✨ +{note.sparkAwarded || 10} Spark</span>
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full py-3 rounded-xl border border-error/30 text-error font-medium hover:bg-error/10 transition-colors disabled:opacity-40"
        >
          {deleting ? '삭제 중...' : '🗑️ 노트 삭제'}
        </button>
      </main>
    </div>
  );
}
