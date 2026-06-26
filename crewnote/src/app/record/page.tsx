'use client';

import { useState } from 'react';
import TopBar from '@/components/common/TopBar';
import { useAuth } from '@/lib/auth/useAuth';
import { SPARK } from '@/lib/constants';

// 상태 타입
type RecordState = 'auth' | 'input' | 'processing' | 'preview';

export default function RecordPage() {
  const { user, loading: authLoading, error: authError, getIdToken, retryAuth } = useAuth();
  const [state, setState] = useState<RecordState>('auth');
  const [rawInput, setRawInput] = useState('');
  const [structuredNote, setStructuredNote] = useState<{
    summary: string;
    mainTasks: string[];
    collaborators: string[];
    problemSolved: string;
    learned: string;
  } | null>(null);
  const [sparkAwarded, setSparkAwarded] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 인증 완료 후 자동으로 input 상태로 전환
  if (!authLoading && user && state === 'auth') {
    setState('input');
  }

  const handleStructure = async () => {
    if (!rawInput.trim()) return;

    setState('processing');
    setSaveError(null);

    try {
      const response = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '구조화 실패');
      }

      setStructuredNote(result.data);
      setSparkAwarded(result.sparkAwarded || SPARK.perNote);
      setState('preview');
    } catch (error) {
      console.error('구조화 에러:', error);
      setSaveError('기록 구조화에 실패했습니다. 다시 시도해주세요.');
      setState('input');
    }
  };

  const handleSave = async () => {
    if (!structuredNote || !user) return;

    setSaveError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('인증 토큰을 가져올 수 없습니다.');
      }

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rawInput, structuredNote }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '저장 실패');
      }

      // 저장 성공 → 피드로 이동
      window.location.href = '/feed';
    } catch (error) {
      console.error('저장 에러:', error);
      setSaveError(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar title="오늘의 기록" />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* 인증 대기 */}
        {state === 'auth' && authLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-6xl animate-bounce">🦊</div>
            <p className="text-muted-text">준비 중...</p>
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

        {/* 입력 상태 */}
        {state === 'input' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-muted-text">오늘 어떤 일을 하셨나요?</p>
            </div>

            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="두서없이 적어도 괜찮아요. 노리가 정리해드릴게요 🦊"
              className="w-full min-h-[200px] p-4 rounded-xl border border-border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              autoFocus
            />

            <button
              onClick={handleStructure}
              disabled={!rawInput.trim()}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              정리해주세요 ✨
            </button>
          </div>
        )}

        {/* 처리 중 */}
        {state === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-6xl animate-bounce">🦊</div>
            <p className="text-muted-text animate-pulse">노리가 기록을 정리하고 있어요...</p>
          </div>
        )}

        {/* 미리보기 상태 */}
        {state === 'preview' && structuredNote && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">이렇게 정리했어요!</h2>

            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-primary">📝 요약</h3>
                <p className="mt-1">{structuredNote.summary}</p>
              </div>

              {structuredNote.mainTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary">💼 주요 업무</h3>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {structuredNote.mainTasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}

              {structuredNote.collaborators.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary">👥 함께한 사람</h3>
                  <p className="mt-1">{structuredNote.collaborators.join(', ')}</p>
                </div>
              )}

              {structuredNote.problemSolved && (
                <div>
                  <h3 className="text-sm font-semibold text-primary">🔧 해결한 문제</h3>
                  <p className="mt-1">{structuredNote.problemSolved}</p>
                </div>
              )}

              {structuredNote.learned && (
                <div>
                  <h3 className="text-sm font-semibold text-primary">💡 배운 점</h3>
                  <p className="mt-1">{structuredNote.learned}</p>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <span className="text-sm text-spark font-semibold">
                  ✨ +{sparkAwarded} Spark 획득!
                </span>
              </div>
            </div>

            {saveError && (
              <p className="text-sm text-error text-center">{saveError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStructuredNote(null);
                  setSparkAwarded(0);
                  setSaveError(null);
                  setState('input');
                }}
                className="flex-1 py-3 rounded-xl border border-border bg-card font-medium hover:bg-cream-dark transition-colors"
              >
                다시 입력
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
              >
                저장하기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}