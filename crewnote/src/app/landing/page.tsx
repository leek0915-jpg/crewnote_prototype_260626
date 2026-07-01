'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nori from '@/components/common/Nori';

export default function LandingPage() {
  const router = useRouter();

  // 스크롤하면 섹션이 아래서 스르륵 나타나는 효과.
  // 스크롤 위치 기반(IntersectionObserver 미의존) → 어떤 환경에서도 확실히 나타남.
  // JS가 안 돌면 reveal-on이 안 붙어서 그냥 다 보임 = 안전.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (els.length === 0) return;
    document.documentElement.classList.add('reveal-on');
    const reveal = () => {
      const trigger = window.innerHeight * 0.88;
      for (const el of els) {
        if (!el.classList.contains('in-view') && el.getBoundingClientRect().top < trigger) {
          el.classList.add('in-view');
        }
      }
    };
    reveal();
    const t = setTimeout(reveal, 120); // 이미지 로드 등으로 위치가 바뀔 때 대비
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
      document.documentElement.classList.remove('reveal-on');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF1E6] text-[#2B2B2B] font-sans selection:bg-[#FF7A59] selection:text-white pb-20 md:pb-32 overflow-x-hidden">

      {/* 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF1E6]/80 backdrop-blur-md border-b border-[#6B5D54]/10">
        <div className="max-w-6xl mx-auto px-5 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl font-black text-[#FF7A59]">CrewNote</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 md:px-5 py-2.5 md:py-3 rounded-full font-bold text-sm text-[#FF7A59] hover:bg-[#FFE4CC]/60 transition-colors"
            >
              로그인
            </button>
            <button
              onClick={() => router.push('/record')}
              className="px-5 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105 shadow-lg shadow-[#FF7A59]/30"
              style={{ backgroundColor: '#FF7A59' }}
            >
              시작하기
            </button>
          </div>
        </div>
      </header>

      {/*
        ========================================================
        Section 1: Hero
        ========================================================
      */}
      <section className="pt-28 md:pt-52 pb-24 md:pb-40 px-5">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="mb-8 md:mb-12">
            <Nori mood="wave" sizeClass="h-[170px] sm:h-[210px] md:h-[270px]" />
          </div>

          <h1 className="text-[2.1rem] sm:text-5xl md:text-7xl lg:text-[7.5rem] font-black tracking-[-0.03em] leading-[1.25] md:leading-[1.12] pb-1 mb-6 md:mb-10 text-[#2B2B2B] [word-break:keep-all] text-balance">
            업무 기록,<br />
            <span className="hoverpop text-[#FF7A59]">10분</span>이{' '}
            <span className="hoverpop relative inline-block">
              10초
              <svg className="absolute -bottom-1 left-0 w-full h-3 md:h-4" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 10 Q 25 20 50 10 T 100 10" stroke="#FFC15E" strokeWidth="8" fill="transparent" />
              </svg>
            </span>
            가<br className="sm:hidden" /> 되는 순간
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-[#6B5D54] mb-10 md:mb-16 font-medium tracking-tight leading-[1.7] md:leading-[1.8] max-w-xl md:max-w-4xl">
            사람들이 진짜로 쓰는 업무 기록 도구 —<br className="hidden sm:block" />{' '}
            노리에게 가볍게 던지면 나머진 AI가 알아서 할게요.
          </p>

          <div className="flex flex-col items-center gap-4 md:gap-6">
            <button
              onClick={() => router.push('/record')}
              className="px-10 md:px-16 py-5 md:py-8 rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-[1.75rem] text-white transition-all hover:scale-[1.05] shadow-2xl shadow-[#FF7A59]/40 active:scale-95"
              style={{ backgroundColor: '#FF7A59' }}
            >
              무료로 시작하기
            </button>
            <p className="text-base md:text-xl text-[#6B5D54] font-bold opacity-60">로그인 없이 1초 만에 바로 시작</p>
          </div>
        </div>
      </section>

      {/*
        ========================================================
        Section 2: Problem
        ========================================================
      */}
      <section className="py-24 md:py-48 px-4 md:px-6 bg-white rounded-[2.5rem] md:rounded-[5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.03)] z-10 relative mx-2 md:mx-4">
        <div className="max-w-5xl mx-auto" data-reveal>
          <div className="mb-14 md:mb-32 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight md:tracking-tighter leading-[1.25] pb-1 mb-5 md:mb-10 [word-break:keep-all] text-balance">
              업무일지,<br /><span className="hoverpop text-[#6B5D54]/30 italic">왜 아무도 안 쓸까요?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-[#6B5D54] leading-relaxed max-w-2xl mx-auto">기존 업무일지의 고질적인 &lsquo;데이터 통증&rsquo;을 정의했습니다.</p>
          </div>

          <div className="grid gap-6 md:gap-16">
            {[
              { id: '01', title: '배보다 배꼽이 큰 일지', desc: '오늘 뭐 했는지 떠올리는 데만 10분, 서식 채우는 데 또 10분. 업무 시간만 갉아먹습니다.' },
              { id: '02', title: '반나절이면 끝나는 기억력', desc: '바쁜 오후가 되면 오전의 결정 사항들은 이미 가물가물해집니다. 기록 타이밍을 놓치기 때문이죠.' },
              { id: '03', title: '쌓이지 않는 파편화된 메모', desc: '여기저기 대충 적어둔 포스트잇과 카톡 나만의 채팅방. 결국 나중엔 검색조차 안 되는 쓰레기가 됩니다.' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-3 md:gap-16 items-start p-7 md:p-16 rounded-[1.75rem] md:rounded-[4rem] bg-[#FFF1E6]/40 hover:bg-[#FFF1E6] hover:-translate-y-1.5 hover:shadow-[0_28px_55px_rgba(255,122,89,0.14)] transition-all duration-500 group">
                <span className="text-5xl md:text-7xl font-black text-[#FF7A59] opacity-20 group-hover:opacity-100 transition-opacity">{item.id}</span>
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 md:mb-8 tracking-tight md:tracking-tighter">{item.title}</h3>
                  <p className="text-base sm:text-lg md:text-2xl text-[#6B5D54] leading-[1.6] md:leading-[1.7] tracking-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
        ========================================================
        Section 3: How It Works
        ========================================================
      */}
      <section className="py-24 md:py-48 px-5 md:px-6 bg-[#FFF1E6]">
        <div className="max-w-6xl mx-auto" data-reveal>
          <div className="mb-14 md:mb-32 text-center">
            <div className="flex justify-center mb-6 md:mb-10">
              <Nori mood="idea" sizeClass="h-[100px] md:h-[140px]" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight md:tracking-tighter leading-[1.28] md:leading-[1.18] pb-1 [word-break:keep-all] text-balance">
              노리가 당신의 말을<br />
              <span className="hoverpop text-[#FF7A59]">황금 데이터</span>로 바꿔요
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-20">
            {[
              { icon: '🎙️', step: '01', title: '툭 던지기', desc: '의식의 흐름대로 말하거나 짧게 적으세요. 꼭 문장이 아니어도 괜찮습니다.' },
              { icon: '🤖', step: '02', title: 'AI 자동 구조화', desc: '핵심만 쏙 뽑아 요약, 업무, 동료, 문제 해결별로 찰떡같이 분류합니다.' },
              { icon: '💎', step: '03', title: '든든한 기록 축적', desc: '흩어졌던 메모들이 나중을 위한 든든한 업무 자산이자 업적이 됩니다.' }
            ].map((item, i) => (
              <div key={i} className="relative text-center md:text-left">
                <div className="text-6xl md:text-[9rem] mb-5 md:mb-12 transform hover:scale-110 transition-transform cursor-default">{item.icon}</div>
                <div className="text-xs md:text-sm font-black text-[#FF7A59] mb-3 md:mb-6 tracking-[0.3em] uppercase">Step {item.step}</div>
                <h3 className="text-2xl md:text-4xl font-black mb-3 md:mb-8 tracking-tight md:tracking-tighter">{item.title}</h3>
                <p className="text-base sm:text-lg md:text-2xl text-[#6B5D54] leading-[1.7] md:leading-[1.8] tracking-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
        ========================================================
        Section 4: Before & After (실제 예시 대조)
        ========================================================
      */}
      <section className="py-24 md:py-48 px-4 md:px-6 bg-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto" data-reveal>
          <div className="mb-12 md:mb-24 text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight md:tracking-tighter mb-5 md:mb-8 leading-[1.3] pb-1 [word-break:keep-all] text-balance px-2">말뿐이었던 일과가<br />정교한 보고서가 됩니다</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-10 items-stretch">
            {/* Before */}
            <div className="rounded-[1.75rem] md:rounded-[4rem] p-7 md:p-12 bg-[#FAFAFA] border-2 border-[#6B5D54]/5 relative flex flex-col justify-center">
              <span className="absolute -top-4 left-6 md:left-12 bg-[#2B2B2B] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-widest whitespace-nowrap">
                입력 : 두서없는 음성
              </span>
              <p className="text-base sm:text-lg md:text-2xl text-[#6B5D54] leading-[1.8] md:leading-[2] font-medium tracking-tight mt-3">
                &ldquo;어 오늘 랜딩페이지 카피 수정했고, 마케팅 주간회의에서 다음 달 캠페인 인스타 위주로 정했어. GA 보다가 전환율 떨어진 거 발견했는데 알고보니 모바일 결제 버튼이 안 눌려서, 민수님한테 슬랙해서 핫픽스했어. 카피는 지영님이 톤 봐줬고.&rdquo;
              </p>
            </div>

            {/* After */}
            <div className="rounded-[1.75rem] md:rounded-[4rem] p-7 md:p-12 bg-white shadow-[0_40px_100px_rgba(255,122,89,0.2)] border-2 border-[#FF7A59] relative group">
              <div className="absolute top-6 right-6 text-8xl opacity-[0.03] group-hover:scale-125 transition-transform pointer-events-none">📋</div>
              <span className="absolute -top-4 left-6 md:left-12 bg-[#FF7A59] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-widest whitespace-nowrap">
                출력 : 정리된 Note
              </span>
              <div className="space-y-7 md:space-y-12 relative z-10 mt-3">
                <div>
                  <h4 className="text-xs md:text-sm font-black text-[#FF7A59] uppercase tracking-[0.2em] mb-3 md:mb-4">📝 요약</h4>
                  <p className="text-xl md:text-3xl font-black tracking-tight leading-tight">결제 전환율 오류 원인 발견 및 핫픽스, SNS 마케팅 방향 확정</p>
                </div>
                <div className="grid gap-5 md:gap-6">
                  <div className="flex gap-4 md:gap-6 items-start">
                    <span className="text-xl md:text-2xl">💼</span>
                    <p className="text-base md:text-xl text-[#6B5D54] leading-relaxed font-bold tracking-tight">랜딩페이지 카피 수정 / 마케팅 주간회의 / 결제 오류 대응</p>
                  </div>
                  <div className="flex gap-4 md:gap-6 items-start">
                    <span className="text-xl md:text-2xl">🤝</span>
                    <p className="text-base md:text-xl text-[#6B5D54] font-bold tracking-tight">민수(개발), 지영(카피 리뷰)</p>
                  </div>
                  <div className="flex gap-4 md:gap-6 items-start">
                    <span className="text-lg md:text-2xl italic font-serif text-[#FF7A59]">Problem</span>
                    <p className="text-base md:text-xl text-[#6B5D54] font-bold tracking-tight leading-relaxed">모바일 결제 버튼 미작동 → 슬랙 공유 → 당일 즉시 수정 완료</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        ========================================================
        Section 5 & 6: 지속을 돕는 장치
        ========================================================
      */}
      <section className="py-24 md:py-48 px-4 md:px-6 bg-[#2B2B2B] text-white rounded-[2.5rem] md:rounded-[5rem] mx-2 md:mx-4 relative overflow-hidden">
        <div className="absolute left-[-10%] top-[20%] w-[400px] h-[400px] bg-[#FF7A59] rounded-full blur-[150px] opacity-10"></div>
        <div className="max-w-5xl mx-auto relative z-10" data-reveal>
          <div className="text-center mb-14 md:mb-32">
            <span className="inline-block text-[#FF7A59] font-black text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">Continuous Engine</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight md:tracking-tighter leading-[1.28] md:leading-[1.15] pb-1 mb-5 md:mb-10 [word-break:keep-all] text-balance">
              기록을 멈추지<br />않게 하는 강력한 엔진
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-white/50 max-w-xl mx-auto leading-relaxed font-medium">강제하는 시스템이 아닙니다. 기록할 때마다 기분 좋은 성취가 쌓이도록 돕습니다.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            <div className="p-8 md:p-16 rounded-[2rem] md:rounded-[4.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-[#FF7A59]/40 hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#FF7A59]/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-4xl md:text-6xl mb-6 md:mb-10 group-hover:scale-110 transition-transform">🔥</div>
              <h3 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 md:mb-8 tracking-tight md:tracking-tighter">연속 기록 스트릭</h3>
              <p className="text-base sm:text-lg md:text-2xl text-white/60 leading-[1.7] tracking-tight font-medium">하루라도 거르면 꺼지는 불꽃. 당신의 성실함을 숫자로 증명하세요. 어느새 매일 기록하는 자신을 발견하게 됩니다.</p>
            </div>
            <div className="p-8 md:p-16 rounded-[2rem] md:rounded-[4.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-[#FFC15E]/40 hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#FFC15E]/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-4xl md:text-6xl mb-6 md:mb-10 group-hover:scale-110 transition-transform">✨</div>
              <h3 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 md:mb-8 tracking-tight md:tracking-tighter">작은 보상, Spark</h3>
              <p className="text-base sm:text-lg md:text-2xl text-white/60 leading-[1.7] tracking-tight font-medium">기록 한 번에 쌓이는 포인트. 레벨별 배지를 수집하는 재미가 단순한 일기 쓰기를 즐거운 수집 활동으로 바꿉니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/*
        ========================================================
        Section 7: 노리 소개
        ========================================================
      */}
      <section className="py-24 md:py-48 px-5 md:px-6">
        <div className="max-w-5xl mx-auto" data-reveal>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 shadow-[0_30px_80px_rgba(255,122,89,0.10)]">
            <div className="shrink-0">
              <Nori mood="think" sizeClass="h-[170px] md:h-[260px]" />
            </div>
            <div className="text-center md:text-left">
              <span className="inline-block text-[#FF7A59] font-black text-xs md:text-sm tracking-widest uppercase mb-3 md:mb-4">Meet Nori</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight md:tracking-tighter mb-4 md:mb-7 leading-[1.25] pb-1 [word-break:keep-all]">
                업무 기록을 돕는 <span className="hoverpop text-[#FF7A59]">노리</span>예요
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#6B5D54] leading-[1.8] mb-6 font-medium">
                노리는 함께 일하는 즐거움을 아는 성격 좋은 여우예요. 사교적이고 믿음직하며, 슬기롭게 자기 일을 해내는 우리 팀의 든든한 파트너랍니다.
                민첩함은 <b className="text-[#2B2B2B]">기록의 빠름과 정확함</b>을, 지혜로움은 <b className="text-[#2B2B2B]">업무의 본질을 보는 통찰</b>을,
                따뜻함은 <b className="text-[#2B2B2B]">팀을 아우르는 소통</b>을 뜻해요.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {['성격 좋음', '사교적', '슬기로움', '책임감', '따뜻함', '성장'].map((k) => (
                  <span key={k} className="px-3.5 md:px-4 py-1.5 md:py-2 rounded-full bg-[#FFF1E6] text-[#FF7A59] font-bold text-sm md:text-base">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        ========================================================
        Section 8: Final CTA
        ========================================================
      */}
      <section className="py-24 md:py-72 px-5 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center" data-reveal>
          <div className="mb-8 md:mb-14">
            <Nori mood="celebrate" sizeClass="h-[150px] md:h-[230px]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight md:tracking-tighter mb-10 md:mb-16 leading-[1.3] md:leading-[1.18] pb-1 [word-break:keep-all] text-balance">
            &ldquo;내일의 당신을 위해,<br /><span className="hoverpop text-[#FF7A59]">오늘의 10초</span>를 기록해보세요&rdquo;
          </h2>
          <button
            onClick={() => router.push('/record')}
            className="px-12 md:px-20 py-6 md:py-10 rounded-[2.5rem] md:rounded-[3rem] font-black text-2xl md:text-4xl text-white transition-all hover:scale-[1.05] shadow-2xl shadow-[#FF7A59]/40 active:scale-95"
            style={{ backgroundColor: '#FF7A59' }}
          >
            지금 노리 만나러 가기
          </button>
        </div>
      </section>

      {/*
        ========================================================
        Section 9: Footer
        ========================================================
      */}
      <footer className="py-20 md:py-32 px-5 md:px-6 border-t border-[#6B5D54]/10 text-center">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-[#FF7A59] mb-4 md:mb-6 tracking-tighter">CrewNote 🦊</h3>
          <p className="text-base md:text-xl font-black text-[#6B5D54] mb-10 md:mb-12 uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-80">Work. Connect. Play.</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[#6B5D54] font-bold mb-10 md:mb-12">
            <span className="cursor-pointer hover:text-[#FF7A59] transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-[#FF7A59] transition-colors">Github</span>
            <span className="cursor-pointer hover:text-[#FF7A59] transition-colors">Contact</span>
          </div>
          <p className="text-sm md:text-base text-[#6B5D54] opacity-40 tracking-tight font-medium">© 2026 CrewNote. All rights reserved. 업무 기록의 혁신을 만듭니다.</p>
        </div>
      </footer>

    </div>
  );
}
