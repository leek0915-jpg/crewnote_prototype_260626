// ===========================================
// OpenRouter LLM 구조화 (서버 전용)
// ===========================================
// /api/structure 라우트에서만 호출
// API 키는 절대 클라이언트에 노출되지 않음
// ===========================================

import { LLM, SPARK } from '@/lib/constants';
import type { StructuredNote } from '@/lib/models/note';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// -------------------------------------------
// 시스템 프롬프트
// -------------------------------------------
const SYSTEM_PROMPT = `당신은 업무 기록을 구조화하는 전문 어시스턴트입니다.
사용자가 오늘 한 일에 대해 두서없이 적은 텍스트를 입력받으면,
아래 JSON 형식으로 정확히 구조화하여 응답하세요.

## 출력 형식 (반드시 이 JSON 구조를 따를 것)
{
  "summary": "오늘 하루를 한 문장으로 요약",
  "mainTasks": ["주요 업무 1", "주요 업무 2"],
  "collaborators": ["함께 작업한 동료 이름"],
  "problemSolved": "해결한 문제 내용 (없으면 빈 문자열)",
  "learned": "오늘 배운 점 (없으면 빈 문자열)"
}

## 규칙
1. summary는 1-2문장으로, 오늘 한 일의 핵심만 담을 것
2. mainTasks는 2-5개 목록으로, 구체적인 동사+명사 형태
3. collaborators는 실제 사람 이름만 (역할 설명 X, 없으면 빈 배열)
4. problemSolved는 구체적 문제와 해결 방법을 1-2문장 (없으면 "")
5. learned는 구체적인 깨달음 1문장 (없으면 "")
6. 모든 내용은 한국어로 작성
7. 추측하지 말고, 입력에 명시된 내용만 추출
8. JSON 외의 텍스트(설명, 주석 등) 포함 금지`;

/**
 * OpenRouter API 호출하여 원본 텍스트를 구조화된 Note로 변환
 */
export async function structureNoteWithLLM(rawInput: string): Promise<{
  data?: StructuredNote;
  error?: string;
}> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return { error: 'OPENROUTER_API_KEY가 설정되지 않았습니다.' };
  }

  const model = process.env.OPENROUTER_MODEL || LLM.defaultModel;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
          ? `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.web.app`
          : 'https://crewnote.vercel.app',
        'X-Title': 'CrewNote',
      },
      body: JSON.stringify({
        model,
        temperature: LLM.temperature,
        max_tokens: LLM.maxTokens,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `오늘 업무 기록:\n"""\n${rawInput}\n"""\n\n위 내용을 구조화해 JSON으로만 응답하세요.`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API 에러:', response.status, errorBody);
      return { error: `LLM API 호출 실패 (${response.status})` };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return { error: 'LLM 응답이 비어있습니다.' };
    }

    // JSON 파싱
    const parsed = JSON.parse(content) as StructuredNote;

    // 필수 필드 검증 및 보정
    const data: StructuredNote = {
      summary: parsed.summary?.trim() || rawInput.slice(0, 100),
      mainTasks: Array.isArray(parsed.mainTasks)
        ? parsed.mainTasks.filter((t) => t?.trim())
        : [],
      collaborators: Array.isArray(parsed.collaborators)
        ? parsed.collaborators.filter((c) => c?.trim())
        : [],
      problemSolved: (parsed.problemSolved || '').trim(),
      learned: (parsed.learned || '').trim(),
    };

    return { data };
  } catch (error) {
    console.error('LLM 구조화 에러:', error);
    return {
      error: error instanceof Error ? error.message : '알 수 없는 에러',
    };
  }
}

/**
 * 구조화된 Note에 대한 Spark 계산 (MVP: 고정값)
 */
export function calculateSpark(note: StructuredNote): number {
  // MVP에서는 간단한 규칙: 최소 1개 필드라도 있으면 SPARK 상수, 아니면 0
  const hasContent =
    note.summary.trim() !== '' ||
    note.mainTasks.length > 0 ||
    note.problemSolved.trim() !== '' ||
    note.learned.trim() !== '';
  return hasContent ? SPARK.perNote : 0;
}