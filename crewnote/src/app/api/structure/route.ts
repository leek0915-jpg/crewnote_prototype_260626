// ===========================================
// POST /api/structure — LLM 구조화 API
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { structureNoteWithLLM, calculateSpark } from '@/lib/llm/structure';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawInput } = body as { rawInput: string };

    // 입력 검증
    if (!rawInput || typeof rawInput !== 'string') {
      return NextResponse.json(
        { success: false, error: 'rawInput이 필요합니다.' },
        { status: 400 }
      );
    }

    // 빈 입력 체크
    if (rawInput.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '입력 내용이 비어있습니다.' },
        { status: 400 }
      );
    }

    // LLM 구조화 호출
    const result = await structureNoteWithLLM(rawInput);

    if (result.error || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || '구조화 실패' },
        { status: 500 }
      );
    }

    // Spark 계산
    const spark = calculateSpark(result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      sparkAwarded: spark,
    });
  } catch (error) {
    console.error('/api/structure 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}