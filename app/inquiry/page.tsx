{/* 매칭 완료 후 담당 강사 연락처 안내 영역 */}
{matchedInstructor ? (
  <div className="bg-slate-900 border border-cyan-500/50 p-6 rounded-2xl text-center space-y-4 shadow-2xl mt-6">
    <div className="inline-block px-3.5 py-1 bg-cyan-500/10 rounded-full text-cyan-400 font-extrabold text-xs sm:text-sm border border-cyan-500/20">
      🎉 맞춤 담당 강사 매칭 완료!
    </div>
    
    <h3 className="text-lg sm:text-xl font-bold text-white">
      <span className="text-cyan-400">{matchedInstructor.name}</span> 강사님이 담당으로 매칭되었습니다!
    </h3>

    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 max-w-md mx-auto space-y-3">
      {matchedInstructor.profile_image && (
        <img
          src={matchedInstructor.profile_image}
          alt={matchedInstructor.name}
          className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-cyan-500 shadow-md"
        />
      )}
      <p className="text-xs sm:text-sm text-slate-300 font-medium">
        {matchedInstructor.bio || '친절하고 안전하게 교육을 진행해 드립니다.'}
      </p>

      {/* 전화 및 문자 바로 연결 버튼 */}
      <div className="pt-2 grid grid-cols-2 gap-2">
        <a
          href={`tel:${matchedInstructor.phone}`}
          className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
        >
          📞 전화 걸기
        </a>
        <a
          href={`sms:${matchedInstructor.phone}`}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          💬 문자 보내기
        </a>
      </div>
      
      <p className="text-[11px] text-amber-400 font-medium pt-1 leading-relaxed">
        ※ 강사님이 수업 중이라 전화를 받지 못할 경우, 문자를 남겨주시면 최우선으로 확인 후 연락드립니다!
      </p>
    </div>
  </div>
) : null}
