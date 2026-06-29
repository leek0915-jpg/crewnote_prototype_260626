'use client';

import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';
import { useEffect, useRef } from 'react';

// 스크롤 시 페이드인 업 등장 애니메이션 훅
function useFadeInOnScroll() {
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-12');
        }
      });
    }, { threshold: 0.15 });

    if (domRef.current) {
      const children = domRef.current.children;
      for (let i = 0; i < children.length; i++) {
        // 초기 상태 설정
        children[i].classList.add('transition-all', 'duration-1000', 'ease-out', 'opacity-0', 'translate-y-12');
        observer.observe(children[i]);
      }
    }
    return () => observer.disconnect();
  }, []);

  return domRef;
}

export default function LandingPage() {
  const router = useRouter();
  const fadeRef1 = useFadeInOnScroll();
  const fadeRef2 = useFadeInOnScroll();
  const fadeRef3 = useFadeInOnScroll();
  const fadeRef4 = useFadeInOnScroll();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2B2B2B] font-sans selection:bg-[#FF7A59] selection:text-white">
      
      {/* ===== 몽환적인 배경 블롭 ===== */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#FFEAE0] blur-[120px] opacity-60 mix-blend-multiply"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#FFF2E9] blur-[100px] opacity-60 mix-blend-multiply"></div>
      </div>

      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦊</span>
            <span className="font-extrabold text-2xl tracking-tighter text-[#1a1a1a]">{BRAND.name}</span>
          </div>
          <button
            onClick={() => router.push('/record')}
            className="px-8 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#FF7A59]/20"
            style={{ backgroundColor: '#FF7A59' }}
          >
            시작하기
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="relative z-10">
        
        {/* =======================
            히어로 (Hero)
            ======================= */}
        <section className="pt-56 pb-40 px-6 min-h-screen flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white shadow-xl shadow-black/5 mb-12 animate-[bounce_3s_ease-in-out_infinite]">
              <span className="text-[#FF7A59] font-bold text-sm">업무 기록의 새로운 패러다임</span>
              <span className="text-xl">✨</span>
            </div>
            
            <h1 className="text-6xl md:text-[5.5rem] font-black tracking-[-0.04em] leading-[1.1] mb-10 text-[#1A1A1A]">
              퇴근 전 10분이,<br />
              <span className="text-[#FF7A59]">말 한마디 10초</span>로.
            </h1>
            
            <p className="text-2xl text-[#666666] mb-16 font-medium tracking-tight leading-relaxed">
              기억나지 않는 하루, 막막한 업무일지는 끝.<br />
              AI 비서 노리에게 두서없이 던지면 완벽하게 구조화됩니다.
            </p>
            
            <button
              onClick={() => router.push('/record')}
              className="group relative px-12 py-6 rounded-full font-black text-xl text-white overflow-hidden transition-all hover:scale-[1.02] shadow-2xl shadow-[#FF7A59]/30"
              style={{ backgroundColor: '#FF7A59' }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              무료로 경험해보기 <span className="ml-2 transition-transform group-hover:translate-x-1 inline-block">→</span>
            </button>
          </div>
        </section>

        {/* =======================
            문제점 (통짜 카드뷰)
            ======================= */}
        <section className="py-40 px-6 bg-[#353331] text-white rounded-[3rem] mx-4 md:mx-10 my-20 shadow-2xl relative overflow-hidden">
          {/* 장식용 엄청 큰 여우 */}
          <div className="absolute -right-20 -bottom-20 text-[20rem] opacity-5 rotate-[-15deg] pointer-events-none">🦊</div>
          
          <div className="max-w-5xl mx-auto" ref={fadeRef1}>
            <div className="mb-24">
              <h2 className="text-5xl font-black tracking-tight leading-tight mb-6">
                지금 당신의 기록은<br />
                <span className="text-[#FF7A59]">스트레스</span> 그 자체입니다.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {[
                { title: '"오늘 뭐 했더라..."', desc: '하루 종일 바빴지만 막상 일지를 쓰려니 모니터 앞 백지상태.' },
                { title: '배보다 배꼽이 큰 정리', desc: '어디에, 어떤 형식으로 쓸지 고민하다 퇴근만 늦어집니다.' },
                { title: '결국 흩어지는 기억', desc: '이곳저곳 막무가내로 적어둔 메모들. 나중엔 찾지도 못합니다.' },
                { title: '유지되지 않는 습관', desc: '번거로움 때문에 며칠 쓰다 포기하기를 수십 번 반복해요.' }
              ].map((item, i) => (
                <div key={i} className="bg-[#413F3D]/50 backdrop-blur-md rounded-[2.5rem] p-12 transition-transform hover:-translate-y-2">
                  <h3 className="text-2xl font-bold text-[#FF9E85] mb-4">{item.title}</h3>
                  <p className="text-xl text-[#B3B0AD] leading-relaxed tracking-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =======================
            해결책 (How it works - 넓고 시원하게)
            ======================= */}
        <section className="py-40 px-6">
          <div className="max-w-6xl mx-auto" ref={fadeRef2}>
            <div className="text-center mb-32">
              <h2 className="text-5xl font-black text-[#1A1A1A] tracking-[-0.03em] leading-tight mb-8">
                복잡한 과정은 모두 지울게요.<br />
                딱 <span className="text-[#FF7A59]">세 가지만</span> 기억하세요.
              </h2>
            </div>

            <div className="flex flex-col gap-12">
              {/* Step 1 */}
              <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center gap-16">
                <div className="w-32 h-32 flex-shrink-0 bg-[#FFF2E9] text-[#FF7A59] rounded-[2rem] flex items-center justify-center text-6xl font-black">01</div>
                <div>
                  <h3 className="text-4xl font-black mb-6 text-[#1A1A1A] tracking-tight">💬 그냥 의식의 흐름대로 말하세요</h3>
                  <p className="text-2xl text-[#666] leading-relaxed">
                    서식, 맞춤법, 카테고리 분류... 다 잊어버리세요.<br />
                    "아 오늘 버그 고치느라 김대리님이랑 2시간 회의했고..." 처럼 친한 동료에게 말하듯 편하게 남겨주세요.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#FF7A59] rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-[#FF7A59]/20 flex flex-col md:flex-row items-center gap-16 text-white">
                <div className="w-32 h-32 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-6xl font-black">02</div>
                <div>
                  <h3 className="text-4xl font-black mb-6 tracking-tight">✨ AI 노리가 완벽하게 구조화합니다</h3>
                  <p className="text-2xl text-white/90 leading-relaxed font-medium">
                    AI가 사용자의 텍스트를 분석하여 <span className="bg-white/30 px-3 py-1 rounded-lg mx-1">요약</span> <span className="bg-white/30 px-3 py-1 rounded-lg mx-1">해결한 문제</span> <span className="bg-white/30 px-3 py-1 rounded-lg mx-1">협업한 사람</span>으로 찰떡같이 분류해 카드 형태로 뽑아냅니다.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center gap-16">
                <div className="w-32 h-32 flex-shrink-0 bg-[#FFF2E9] text-[#FF7A59] rounded-[2rem] flex items-center justify-center text-6xl font-black">03</div>
                <div>
                  <h3 className="text-4xl font-black mb-6 text-[#1A1A1A] tracking-tight">📋 데일리 피드에 나만의 자산으로</h3>
                  <p className="text-2xl text-[#666] leading-relaxed">
                    자동으로 생성된 노트를 SNS 보듯 쓱쓱 위아래로 스크롤하세요.<br />
                    수정, 삭제 관리가 그 어떤 툴보다 직관적입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            게임 피케이션 (시각적 자극)
            ======================= */}
        <section className="py-40 px-6 relative">
          <div className="max-w-5xl mx-auto text-center" ref={fadeRef3}>
            <div className="mb-24">
              <h2 className="text-5xl font-black tracking-[-0.03em] leading-tight mb-8 text-[#1A1A1A]">
                기록하는 행위 자체가<br />
                즐거운 <span className="text-[#FF7A59]">게임</span>이 될 수 있게
              </h2>
              <p className="text-2xl text-[#666] font-medium">작은 보상이 강력한 습관을 만듭니다.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              
              {/* 왼쪽: 크고 예쁜 뱃지 진열장 */}
              <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-[#FF7A59]/10 text-left row-span-2">
                <h3 className="text-3xl font-black mb-4">🏅 진화하는 뱃지 컬렉션</h3>
                <p className="text-xl text-[#999] mb-12">기록을 남길 때마다 쌓이는 Spark를 모아 전설의 단계에 도전하세요.</p>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { emoji: '🌱', name: '첫 발걸음', spark: 10 },
                    { emoji: '🚀', name: '기록의 습관', spark: 50 },
                    { emoji: '⭐', name: '성실한 기록가', spark: 100 },
                    { emoji: '💎', name: '열정의 기록가', spark: 300 },
                    { emoji: '🏆', name: '레전드 기록가', spark: 500 },
                    { emoji: '👑', name: '기록의 신', spark: 1000 },
                  ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-6 bg-[#FAFAF8] rounded-[2rem] transition-all hover:-translate-y-1 hover:shadow-md">
                      <div className="text-5xl mb-4 drop-shadow-sm">{badge.emoji}</div>
                      <div className="font-bold text-lg text-[#1A1A1A]">{badge.name}</div>
                      <div className="text-sm font-semibold text-[#FF7A59] mt-2">{badge.spark} Spark</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 오른쪽 위: 스트릭 */}
              <div className="bg-gradient-to-br from-[#FF7A59] to-[#E5634A] rounded-[3rem] p-12 text-white shadow-2xl shadow-[#FF7A59]/20 text-left flex flex-col justify-center relative overflow-hidden">
                <div className="absolute right-0 bottom-0 text-[10rem] opacity-10 translate-y-10">🔥</div>
                <h3 className="text-4xl font-black mb-4 relative z-10">🔥 연속 기록 스트릭</h3>
                <p className="text-2xl text-white/90 leading-relaxed font-medium relative z-10">
                  하루라도 빼먹으면 0초기화!<br />불꽃을 꺼트리지 마세요.
                </p>
              </div>

              {/* 오른쪽 아래: Spark */}
              <div className="bg-[#1A1A1A] rounded-[3rem] p-12 text-white shadow-2xl text-left flex flex-col justify-center relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] text-[8rem] opacity-10">✨</div>
                <div className="text-[#FF7A59] text-7xl font-black mb-4 tracking-tighter">+10</div>
                <h3 className="text-3xl font-bold text-white/90">Spark 획득</h3>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            최종 CTA (초대형 폰트)
            ======================= */}
        <section className="py-40 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center" ref={fadeRef4}>
            <div className="text-8xl mb-12">🚀</div>
            <h2 className="text-5xl md:text-7xl font-black text-[#1A1A1A] leading-tight tracking-[-0.04em] mb-16">
              이제 퇴근을<br />앞당길 시간입니다.
            </h2>
            <button
              onClick={() => router.push('/record')}
              className="px-12 py-6 rounded-full font-black text-2xl text-white transition-all hover:scale-[1.03] shadow-2xl shadow-[#FF7A59]/40"
              style={{ backgroundColor: '#FF7A59' }}
            >
              무료로 시작하기
            </button>
            <p className="text-xl text-[#999] mt-10 font-medium">회원가입 없이 1초면 시작합니다.</p>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="py-16 text-center">
          <p className="text-[#999] font-bold text-lg mb-2">{BRAND.name} 🦊</p>
          <p className="text-[#CCC] text-sm">© 2026 CrewNote. All rights reserved.</p>
        </footer>

      </div>

      {/* 심플한 Shimmer 효과 애니메이션 주입용 (tailwind로 안되는 부분 보완) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}