'use client';

import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#2B2B2B] font-sans selection:bg-[#FF7A59] selection:text-white">
      {/* 
        ========================================================================
        헤더 (Sticky)
        ========================================================================
      */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#353331]/95 backdrop-blur-md border-b border-[#4A4744]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦊</span>
            <span className="font-bold text-xl text-white">{BRAND.name}</span>
          </div>
          <button
            onClick={() => router.push('/record')}
            className="px-6 py-2 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
            style={{ backgroundColor: '#FF7A59' }}
          >
            시작하기
          </button>
        </div>
      </header>

      {/* 
        ========================================================================
        Section 1: Problem & Goal (Dark)
        ========================================================================
      */}
      <section className="pt-32 pb-24 px-6 bg-[#353331] text-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto">
          {/* Header Title Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <span className="text-[#FF7A59] text-sm font-bold tracking-wider uppercase mb-3 block">
                Problem & Goal
              </span>
              <h1 className="text-4xl md:text-5xl font-black leading-tight break-keep">
                CrewNote가 해결하고 싶은<br />
                핵심 목표예요
              </h1>
            </div>
            <div className="max-w-sm text-[#Aba6a2] text-sm leading-relaxed border-l-2 border-[#FFE4CC]/20 pl-4 md:border-none md:pl-0">
              Are you stressed out about writing work logs? If you often forget what you did today, and you don't know how to organize your thoughts, join CrewNote!
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-24">
            {/* Flow line - Problem */}
            <div className="flex flex-col items-center mb-8 relative">
              <div className="w-[1px] h-12 bg-[#FF7A59] mb-4"></div>
              <div className="bg-[#FF7A59] text-white text-xs font-bold px-6 py-2 rounded-full z-10">
                Problem
              </div>
            </div>

            {/* Problem Cards - Responsive 3 Columns */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12 relative z-10">
              {[
                { label: '퇴근 전의 막막함', title: '하루 끝의 백지 상태', desc: '오늘 분명 바쁘게 일했는데, 정작 뭘 했는지 기억이 안 나시나요?' },
                { label: '입력의 부담감', title: '배보다 배꼽이 큰 일지', desc: '업무를 기록하는 일 자체가 또 하나의 큰 업무처럼 느껴지지 않나요?' },
                { label: '기록의 휘발성', title: '흩어지는 나의 성과', desc: '여기저기 대충 적어둔 메모들, 나중에 찾으려니 한숨만 나오나요?' }
              ].map((prob, i) => (
                <div key={i} className="bg-[#3F3C3A] rounded-2xl p-6 border-t-[3px] border-[#FF7A59]">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-[#FF7A59] text-sm font-black">💡 {prob.label}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 break-keep">{prob.title}</h3>
                  <p className="text-[#Aba6a2] text-sm leading-relaxed">{prob.desc}</p>
                </div>
              ))}
            </div>

            {/* Flow line - Goal */}
            <div className="flex flex-col items-center mt-8">
              <div className="w-[1px] h-12 bg-[#FF7A59] mb-4 opacity-50"></div>
              <div className="bg-[#FF7A59] text-white text-xs font-bold px-6 py-2 rounded-full z-10">
                Goal
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-center mt-6 break-keep">
                최소한의 노력으로 최대의 기록을 남기고,
                <br className="hidden md:block" />
                <span className="text-[#FF7A59]">까먹지 않게 돕는 AI 기록 비서</span> 🦊
              </h2>
              <p className="text-[#Aba6a2] mt-4 text-sm text-center">
                A personal AI recording assistant that simplifies your logs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Section 2: Solution Research (Light)
        ========================================================================
      */}
      <section className="py-24 px-6 bg-[#FFF8F4] relative">
        <div className="max-w-5xl mx-auto">
          {/* Header Title Area */}
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <span className="text-[#FF7A59] text-sm font-bold tracking-wider uppercase mb-3 block">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight text-[#2B2B2B] break-keep">
                기존의 기록 방식과<br />
                CrewNote의 구조화 프로세스
              </h2>
            </div>
            <div className="max-w-sm text-[#666] text-sm leading-relaxed border-l-2 border-[#FFE4CC] pl-4 md:border-none md:pl-0">
              We analyzed the weaknesses of manual logging. We provide an AI-driven automated structuring feature that completely frees you from the burden of formatting.
            </div>
          </div>

          {/* Compare Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            
            {/* Card 1: 기존 방식 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EBE3DC]">
              <div className="bg-[#F2EDEA] py-4 text-center border-b border-[#EBE3DC]">
                <h3 className="font-bold text-[#666]">기존의 수동 기록</h3>
                <p className="text-xs text-[#999] mt-1">Manual logging</p>
              </div>
              <div className="p-6">
                <div className="flex justify-center gap-3 mb-6 opacity-30 text-2xl">
                  📝 ⌨️ 🕒
                </div>
                <div className="text-sm font-bold text-[#FF7A59] mb-2">Weakness</div>
                <ul className="space-y-3 text-sm text-[#666]">
                  <li className="flex gap-2"><span>-</span> 서식과 양식, 카테고리를 <strong className="text-[#FF7A59] font-bold">일일이 맞춰 적어야 함</strong></li>
                  <li className="flex gap-2"><span>-</span> 바쁠 때는 기록을 미루다가 결국 까먹음</li>
                  <li className="flex gap-2"><span>-</span> 텍스트 입력 자체의 피로도가 높음</li>
                </ul>
              </div>
            </div>

            {/* Card 2: CrewNote 입력 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EBE3DC]">
               <div className="bg-[#FFF8F4] py-4 text-center border-b border-[#FFE4CC]">
                <h3 className="font-bold text-[#2B2B2B]">1단계: 두서없는 입력</h3>
                <p className="text-xs text-[#999] mt-1">Voice & Quick Text</p>
              </div>
              <div className="p-6">
                <div className="flex justify-center gap-3 mb-6 text-2xl">
                  🎙️ 🦊 💬
                </div>
                <div className="text-sm font-bold text-[#FF7A59] mb-2">Strength</div>
                <ul className="space-y-3 text-sm text-[#666]">
                  <li className="flex gap-2"><span>+</span> "아 오늘 김대리랑 푸시 알림 에러 고쳤고..." 처럼 <strong className="text-[#FF7A59] font-bold">의식의 흐름대로</strong> 말하기</li>
                  <li className="flex gap-2"><span>+</span> 양식 파괴, 키워드 나열만으로도 충분함</li>
                </ul>
              </div>
            </div>

            {/* Card 3: CrewNote 출력 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EBE3DC]">
               <div className="bg-[#FF7A59]/10 py-4 text-center border-b border-[#FF7A59]/20">
                <h3 className="font-bold text-[#FF7A59]">2단계: AI 자동 구조화</h3>
                <p className="text-xs text-[#FF7A59]/60 mt-1">AI Structuring</p>
              </div>
              <div className="p-6">
                <div className="flex justify-center gap-3 mb-6 text-2xl">
                  ✨ 📋 🎯
                </div>
                <div className="text-sm font-bold text-[#FF7A59] mb-2">Result</div>
                <ul className="space-y-2 text-sm text-[#2B2B2B] font-medium">
                  <li className="bg-[#FFF8F4] px-3 py-1.5 rounded text-xs border border-[#FFE4CC]"><span className="text-[#FF7A59] mr-1">요약</span> 에러 해결</li>
                  <li className="bg-[#FFF8F4] px-3 py-1.5 rounded text-xs border border-[#FFE4CC]"><span className="text-[#FF7A59] mr-1">업무</span> 푸시 알림 토큰 만료 수정</li>
                  <li className="bg-[#FFF8F4] px-3 py-1.5 rounded text-xs border border-[#FFE4CC]"><span className="text-[#FF7A59] mr-1">협업</span> 김대리</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Highlight Orange Big Card */}
          <div className="bg-[#FF7A59] rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl shadow-[#FF7A59]/20">
            {/* 장식용 투명 아이콘 */}
            <div className="absolute -left-4 -bottom-4 text-8xl opacity-10">🦊</div>
            <div className="absolute -right-4 -top-4 text-8xl opacity-10">✨</div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-white text-[#FF7A59] text-xs font-bold px-3 py-1 rounded-full">Core Value</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 break-keep">
                  분석한 결과를 바탕으로<br />
                  가장 짧은 기록 경험을 만들었어요
                </h3>
                <p className="text-white/80 text-sm">
                  Based on analyzing pain points, we set up a core function of AI structuring.
                </p>
              </div>
              
              <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm w-full md:w-auto text-left">
                <ul className="space-y-3 font-semibold text-sm">
                  <li className="flex items-center gap-2">✓ <span className="bg-white/90 text-[#FF7A59] px-2 py-0.5 rounded text-xs">AI 구조화</span> 입력의 구체화 생략</li>
                  <li className="flex items-center gap-2">✓ <span className="bg-white/90 text-[#FF7A59] px-2 py-0.5 rounded text-xs">피드형 노트</span> 직관적인 위아래 스크롤</li>
                  <li className="flex items-center gap-2">✓ <span className="bg-white/90 text-[#FF7A59] px-2 py-0.5 rounded text-xs">친근한 UI</span> 딱딱한 문서 툴 탈피</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Section 3: Gamification Research (Dark)
        ========================================================================
      */}
      <section className="py-24 px-6 bg-[#353331] text-white">
        <div className="max-w-5xl mx-auto">
          {/* Header Title Area */}
          <div className="text-center mb-16">
            <span className="text-[#FF7A59] text-sm font-bold tracking-wider uppercase mb-3 block">
              Field Research & Gamification
            </span>
            <h2 className="text-4xl md:text-5xl font-black leading-tight break-keep mb-6">
              사용자들은 기록 관리에 있어서<br />
              어떤 <span className="text-[#FF7A59]">동기부여</span>가 필요할까요?
            </h2>
            <p className="text-[#Aba6a2] text-sm">
              We identified the experiences and pain points that users usually experience in continuous logging.
            </p>
          </div>

          {/* Graph/Data styled Cards (Survey look) */}
          <div className="space-y-6">
            
            {/* Top Row: 2 Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#2D2B29] rounded-2xl p-6 md:p-8 border border-[#4A4744]">
                <h4 className="text-xs text-[#Aba6a2] mb-1">Q. 01</h4>
                <h3 className="text-lg font-bold mb-6">기록 습관을 유지하는 게 얼마나 힘든가요?</h3>
                <div className="flex items-center justify-center h-40 relative">
                  {/* 도넛 차트 묘사 (CSS/Tailwind) */}
                  <div className="w-32 h-32 rounded-full border-[10px] border-[#FF7A59] border-r-[#4A4744] flex items-center justify-center">
                    <span className="text-2xl font-black">78<span className="text-sm">%</span></span>
                  </div>
                  <div className="absolute bottom-0 right-4 md:right-10 text-xs flex flex-col gap-2">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FF7A59]"></span> 며칠 하다 포기함</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#4A4744]"></span> 꾸준히 하고 있음</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#2D2B29] rounded-2xl p-6 md:p-8 border border-[#4A4744]">
                <h4 className="text-xs text-[#Aba6a2] mb-1">Q. 02</h4>
                <h3 className="text-lg font-bold mb-6">CrewNote의 보상 설계: Spark와 스트릭</h3>
                <div className="h-40 flex items-end justify-between px-4 gap-2 pb-2 border-b border-[#4A4744]">
                  {/* 바 차트 묘사 */}
                  <div className="w-full bg-[#4A4744] rounded-t-sm h-[30%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100">Day1</span></div>
                  <div className="w-full bg-[#4A4744] rounded-t-sm h-[50%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100">Day2</span></div>
                  <div className="w-full bg-[#FF7A59] rounded-t-md h-[90%] relative"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#FF7A59] font-bold">🔥 3일!</span></div>
                  <div className="w-full bg-[#4A4744] rounded-t-sm h-[20%]"></div>
                  <div className="w-full bg-[#4A4744] rounded-t-sm h-[60%]"></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#Aba6a2] mt-2 px-4">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Full Width Card */}
            <div className="bg-[#2D2B29] rounded-2xl p-6 md:p-8 border border-[#4A4744]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-xs text-[#FF7A59] font-bold mb-1">Gamification Needs</h4>
                  <h3 className="text-lg font-bold">CrewNote 뱃지 컬렉션 <span className="text-sm font-normal text-[#Aba6a2]">(목적: 성취감 제공)</span></h3>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  { threshold: 10,   emoji: '🌱', name: '첫 발걸음' },
                  { threshold: 50,   emoji: '🚀', name: '기록의 습관' },
                  { threshold: 100,  emoji: '⭐', name: '성실한 기록가' },
                  { threshold: 300,  emoji: '💎', name: '열정의 기록가' },
                  { threshold: 500,  emoji: '🏆', name: '레전드 기록가' },
                  { threshold: 1000, emoji: '👑', name: '기록의 신' },
                ].map((badge, i) => (
                  <div key={i} className="bg-[#353331] rounded-xl p-4 text-center hover:bg-[#3e3a38] transition-colors border border-[#4A4744]/50">
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    <div className="text-xs font-bold text-white mb-1">{badge.name}</div>
                    <div className="text-[10px] text-[#FF7A59]">{badge.threshold} Spark</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Section 4: In-depth Interview & Conclusion (Light)
        ========================================================================
      */}
      <section className="py-24 px-6 bg-[#FFF8F4] overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          
          <div className="text-center mb-16">
            <span className="text-[#FF7A59] text-sm font-bold tracking-wider uppercase mb-3 block">
              User Experience
            </span>
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-[#2B2B2B] break-keep mb-6">
              노리와 함께하는 기록,<br />
              경험이 어떻게 달라질까요?
            </h2>
            <p className="text-[#666] text-sm max-w-xl mx-auto">
              We positioned the core features according to the frequency of logging and the level of effort in managing them.
            </p>
          </div>

          {/* Quote Clusters (십자축 느낌의 모음) */}
          <div className="relative py-10 max-w-4xl mx-auto">
            {/* Background Axis lines (hidden on mobile, visible on md) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-[#FFE4CC] -translate-y-1/2 border-dashed border-b border-[#FF7A59]/30"></div>
            <div className="hidden md:block absolute left-1/2 top-0 h-full w-[1px] bg-[#FFE4CC] -translate-x-1/2 border-dashed border-r border-[#FF7A59]/30"></div>
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full items-center justify-center text-3xl shadow-md border-4 border-[#FFF8F4] z-10">🦊</div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-16 relative z-20">
              
              {/* Box 1 */}
              <div className="bg-[#FFEFE8] rounded-[2rem] p-6 md:p-8 text-center border-2 border-[#FFD4C4] relative md:mt-0 mt-4 md:translate-x-8 md:-translate-y-8 shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF7A59] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  Before
                </span>
                <p className="text-sm font-bold text-[#FF7A59] mb-4">"각 잡고 써야 하는 일지"</p>
                <p className="text-base text-[#2B2B2B] font-medium leading-relaxed">
                  "일지용 툴을 켜고, 항목별로 칸을 채우다 보면<br />퇴근 시간이 10분씩 늦춰져요."
                </p>
              </div>

              {/* Box 2 */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 text-center border-2 border-[#FF7A59] relative md:mt-0 mt-4 md:-translate-x-8 md:-translate-y-8 shadow-md">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF7A59] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  After : CrewNote
                </span>
                <p className="text-sm font-bold text-[#FF7A59] mb-4">"말만 하면 끝나는 기록"</p>
                <p className="text-base text-[#2B2B2B] font-medium leading-relaxed">
                  "지하철 타러 가면서 음성으로 떠들기만 했는데,<br />알아서 깔끔한 양식으로 정리돼 있어요."
                </p>
              </div>

              {/* Box 3 */}
              <div className="bg-[#FFEFE8] rounded-[2rem] p-6 md:p-8 text-center border-2 border-[#FFD4C4] relative mt-4 md:mt-8 md:translate-x-8 shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF7A59] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  Before
                </span>
                <p className="text-sm font-bold text-[#FF7A59] mb-4">"기록해봤자 볼 일이 없음"</p>
                <p className="text-base text-[#2B2B2B] font-medium leading-relaxed">
                  "다이어리에 잔뜩 적어둬도 검색이 안되니까<br />나중에 찾아보는 게 스트레스예요."
                </p>
              </div>

               {/* Box 4 */}
               <div className="bg-white rounded-[2rem] p-6 md:p-8 text-center border-2 border-[#FF7A59] relative mt-4 md:mt-8 md:-translate-x-8 shadow-md">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF7A59] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  After : CrewNote
                </span>
                <p className="text-sm font-bold text-[#FF7A59] mb-4">"피드에 쌓이는 나의 자산"</p>
                <p className="text-base text-[#2B2B2B] font-medium leading-relaxed">
                  "날짜별로 깔끔한 카드 형태로 쫙 정리되어 있어서<br />한 주를 돌아보기 너무 편해요."
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        Section 5: Final CTA (Dark)
        ========================================================================
      */}
      <section className="py-24 px-6 bg-[#2B2B2B] text-center border-t border-[#4A4744]">
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            매일의 기록을 가볍게,<br />
            성과는 명확하게.
          </h2>
          <p className="text-[#Aba6a2] text-lg mb-10">
            지금 가입 없이 바로 <span className="text-white font-bold">CrewNote</span>를 경험해보세요.
          </p>
          <button
            onClick={() => router.push('/record')}
            className="px-10 py-5 rounded-full font-bold text-lg text-white transition-all hover:-translate-y-1 hover:shadow-2xl"
            style={{ backgroundColor: '#FF7A59', boxShadow: '0 10px 30px rgba(255,122,89,0.3)' }}
          >
            무료로 기록 시작하기
          </button>
        </div>
      </section>

      {/* 
        ========================================================================
        Footer
        ========================================================================
      */}
      <footer className="py-10 px-6 bg-[#1f1e1d] text-[#Aba6a2]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦊</span>
            <span className="font-bold text-white text-lg">{BRAND.name}</span>
          </div>
          <p className="text-xs">{BRAND.tagline}</p>
          <p className="text-xs">© 2026 CrewNote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}