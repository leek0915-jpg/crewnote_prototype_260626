'use client';

/**
 * 노리 🦊 — CrewNote 마스코트
 *
 * 캐릭터시트에서 추출·업스케일한 실제 일러스트(public/nori/*.png)를 사용한다.
 * 단순 위아래 이동이 아니라 떠오름 + 미세한 기울임/숨쉬기 + 바닥 그림자 +
 * (일부 무드) 반짝이로 살아있는 느낌을 준다.
 */

export type NoriMood = 'wave' | 'happy' | 'idea' | 'celebrate' | 'think' | 'sleepy';

const SRC: Record<NoriMood, string> = {
  wave: '/nori/nori-hero.png',
  happy: '/nori/nori-idea.png',
  idea: '/nori/nori-idea.png',
  celebrate: '/nori/nori-great.png',
  think: '/nori/nori-think.png',
  sleepy: '/nori/nori-think.png',
};

// 전신 포즈(발이 있는) → 바닥 그림자 표시
const FULL_BODY: NoriMood[] = ['wave', 'think', 'sleepy'];
// 반짝이를 띄울 무드
const SPARKLE: NoriMood[] = ['wave', 'celebrate'];

interface NoriProps {
  mood?: NoriMood;
  /** 렌더 높이(px). 일러스트는 세로형이라 높이 기준으로 맞춘다. */
  size?: number;
  /** 반응형 높이용 Tailwind 클래스 (예: "h-[170px] md:h-[260px]"). 주면 size 무시. */
  sizeClass?: string;
  className?: string;
  /** 애니메이션 끄기 */
  animate?: boolean;
  alt?: string;
}

export default function Nori({
  mood = 'happy',
  size = 120,
  sizeClass,
  className = '',
  animate = true,
  alt,
}: NoriProps) {
  const ground = FULL_BODY.includes(mood);
  const sparkle = animate && SPARKLE.includes(mood);

  return (
    <span
      className={`nori-root relative inline-flex items-end justify-center ${sizeClass ?? ''} ${className}`}
      style={sizeClass ? undefined : { height: size }}
    >
      {/* 바닥 그림자 */}
      {ground && <span aria-hidden className={`nori-ground ${animate ? 'is-animated' : ''}`} />}

      {/* 마스코트 본체 */}
      <span className={`nori-anim relative z-10 block h-full ${animate ? 'is-animated' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SRC[mood]}
          alt={alt ?? '마스코트 노리'}
          draggable={false}
          className="h-full w-auto select-none [filter:drop-shadow(0_8px_10px_rgba(43,43,43,0.10))]"
        />
      </span>

      {/* 반짝이 */}
      {sparkle && (
        <span aria-hidden className="nori-sparkles absolute inset-0 z-20 pointer-events-none">
          <span className="nori-sp nori-sp1">✦</span>
          <span className="nori-sp nori-sp2">✦</span>
          <span className="nori-sp nori-sp3">✦</span>
        </span>
      )}
    </span>
  );
}
