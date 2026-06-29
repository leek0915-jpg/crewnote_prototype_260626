'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import TopBar from '@/components/common/TopBar';
import { useAuth } from '@/lib/auth/useAuth';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';
import { SPARK } from '@/lib/constants';
import { calculateNewStreak } from '@/lib/streak';

// 상태 타입
type RecordState = 'auth' | 'input' | 'processing' | 'preview';

export default function RecordPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, retryAuth } = useAuth();
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

  // 음성 인식 훅
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // 음성 인식 결과를 rawInput에 반영
  useEffect(() => {
    if (transcript) {
      setRawInput(transcript);
    }
  }, [transcript]);

  // 음성 버튼 토글
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setRawInput('');
      startListening();
    }
  };

  // 인증 완료 후 자동으로 input 상태로 전환
  useEffect(() => {
    if (!authLoading && user && state === 'auth') {
      setState('input');
    }
  }, [authLoading, user, state]);

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
    if (!structuredNote) return;
    if (!user) {
      setSaveError('인증이 필요합니다. 아래 로그인 재시도를 눌러주세요.');
      return;
    }

    setSaveError(null);

    try {
      const spark = sparkAwarded || SPARK.perNote;
      const userId = user.uid;

      const db = getFirebaseDb();
      if (!db) throw new Error('Firestore 초기화 실패');

      // 1. notes 컬렉션에 문서 추가
      await addDoc(collection(db, 'notes'), {
        userId,
        createdAt: serverTimestamp(),
        rawInput,
        source: 'text' as const,
        summary: structuredNote.summary || '',
        mainTasks: structuredNote.mainTasks || [],
        collaborators: structuredNote.collaborators || [],
        problemSolved: (structuredNote.problemSolved || '').trim(),
        learned: (structuredNote.learned || '').trim(),
        sparkAwarded: spark,
      });

            // 2. users 컬렉션의 sparkTotal 증가 + 스트릭 갱신 (없으면 생성)
      const userRef = doc(db, 'users', userId);
      try {
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const prevStreak = userData?.currentStreak || 0;
        const prevLongest = userData?.longestStreak || 0;
        const lastDate = userData?.lastRecordedDate || null;

        const { currentStreak: newStreak, longestStreak: newLongest, lastRecordedDate: newLastDate } =
          calculateNewStreak(prevStreak, prevLongest, lastDate);

        await updateDoc(userRef, {
          sparkTotal: increment(spark),
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastRecordedDate: newLastDate,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // 문서가 없으면 새로 생성
        const { currentStreak: newStreak, longestStreak: newLongest, lastRecordedDate: newLastDate } =
          calculateNewStreak(0, 0, null);
        await setDoc(userRef, {
          uid: userId,
          displayName: '게스트',
          sparkTotal: spark,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastRecordedDate: newLastDate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }


      // 저장 성공 → 피드로 이동
      router.push('/feed');
    } catch (error) {
      console.error('저장 에러:', error);
      setSaveError(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar title="CrewNote" />

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
            <div className="text-6xl">️</div>
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

            {/* 음성 녹음 버튼 */}
            {speechSupported && (
              <div className="flex justify-center">
                <button
                  onClick={handleVoiceToggle}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all ${
                    isListening
                      ? 'bg-error text-white animate-pulse shadow-error/30'
                      : 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark'
                  }`}
                  aria-label={isListening ? '녹음 중지' : '음성으로 기록'}
                >
                  {isListening ? '⏹' : '🎤'}
                </button>
              </div>
            )}

            {/* 음성 인식 상태 표시 */}
            {isListening && (
              <p className="text-center text-sm text-primary animate-pulse">
                말씀하시는 중... (다시 누르면 종료)
              </p>
            )}

            {/* 음성 인식 에러 */}
            {speechError && (
              <p className="text-center text-sm text-error">{speechError}</p>
            )}

            {/* 미지원 브라우저 안내 */}
            {!speechSupported && (
              <p className="text-center text-xs text-muted-text">
                ※ 이 브라우저는 음성 입력을 지원하지 않아요. 텍스트로 입력해주세요.
              </p>
            )}

            {/* 텍스트 입력 영역 */}
            <textarea
              value={rawInput + (interimTranscript ? interimTranscript : '')}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="두서없이 적어도 괜찮아요. 노리가 정리해드릴게요 🦊&#10;🎤 버튼을 눌러 말로 기록할 수도 있어요!"
              className="w-full min-h-[200px] p-4 rounded-xl border border-border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              autoFocus
            />

            <button
              onClick={handleStructure}
              disabled={!rawInput.trim() && !interimTranscript}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              정리해주세요 
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
            {/* 로그인 상태 표시 */}
            <div className={`text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
              user ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <span>{user ? '🟢' : ''}</span>
              <span>
                {authLoading ? '로그인 확인 중...' : user ? `로그인됨 (${user.uid.slice(0, 8)}...)` : '로그인 안됨'}
              </span>
            </div>

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
                  <h3 className="text-sm font-semibold text-primary"> 함께한 사람</h3>
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

            {!user && !authLoading && (
              <div className="text-center">
                <button
                  onClick={retryAuth}
                  className="text-sm text-primary underline hover:text-primary-dark"
                >
                  🔐 로그인 재시도하기
                </button>
              </div>
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
                disabled={!user || authLoading}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {authLoading ? '로그인 중...' : !user ? '로그인 필요' : '저장하기'}
              </button>
            </div>
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
            className="flex flex-col items-center gap-0.5 text-primary"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <span className="text-xs font-medium">기록</span>
          </button>
        </div>
                  <button
            onClick={() => router.push('/achievements')}
            className="flex flex-col items-center gap-0.5 text-muted-text hover:text-primary transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <span className="text-xs font-medium">성과</span>
          </button>
      </nav>
    </div>
  );
       
}