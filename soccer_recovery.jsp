<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
  <title>⚽ 풋살/축구 컨디션 분석 & 회복 리포트</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:12px;color:#1e293b;line-height:1.6}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 20px 40px rgba(0,0,0,0.1);overflow:hidden}
    .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;padding:35px 20px}
    .header h1{font-size:1.8rem;font-weight:900;letter-spacing:-0.05em;margin-bottom:8px}
    .header p{opacity:0.9;font-size:0.95rem}

    .section{padding:20px;border-bottom:1px solid #f1f5f9}
    .section-title{display:block;font-weight:800;font-size:1.05rem;color:#334155;margin-bottom:15px}
    .btn-group{display:flex;gap:12px}
    .toggle-btn{flex:1;padding:16px;border:2.5px solid #e2e8f0;border-radius:18px;background:#fff;font-weight:800;cursor:pointer;transition:all .2s}
    .toggle-btn.active{background:#4f46e5;color:#fff;border-color:transparent;box-shadow:0 8px 16px rgba(79,70,229,0.3)}
    .num-box{width:100%;padding:15px;font-size:2.2rem;text-align:center;border:2.5px solid #e2e8f0;border-radius:18px;font-weight:900}
    select{width:100%;height:60px;padding:0 15px;font-size:1rem;border:2.5px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:800;cursor:pointer}

    .pain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
    .pain-item{display:flex;align-items:center;justify-content:center;padding:15px;border:2px solid #f1f5f9;border-radius:14px;cursor:pointer;background:#f8fafc}
    .pain-item input{display:none}
    .pain-item:has(input:checked){background:#eef2ff;border-color:#4f46e5;color:#4f46e5;font-weight:800}

    .analyze-btn{width:calc(100% - 40px);margin:25px 20px;min-height:65px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;font-size:1.2rem;font-weight:900;cursor:pointer;box-shadow:0 10px 25px rgba(16,185,129,0.3)}

    #result{display:none;padding-bottom:70px;animation:fadeUp .6s ease}
    @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

    .res-card{margin:20px;padding:25px;background:#f8fafc;border-radius:24px;border-left:6px solid #4f46e5}
    .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:15px 0}
    .stat-box{text-align:center;background:#fff;padding:15px;border-radius:18px;box-shadow:0 4px 10px rgba(0,0,0,.03)}
    .stat-val{font-size:1.4rem;font-weight:900;color:#ef4444;display:block}
    .stat-lab{font-size:.8rem;color:#64748b;font-weight:700}

    .info-card{margin:20px;padding:20px;background:#fff;border-radius:22px;border:1px solid #e2e8f0}
    .pro-item{display:flex;gap:15px;padding:12px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
    .pro-time{min-width:75px;background:#eef2ff;color:#4f46e5;font-size:.75rem;font-weight:900;padding:4px;border-radius:8px;text-align:center}
    .pro-txt{font-size:.92rem;font-weight:600;color:#334155}

    .history-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:.85rem;font-weight:600}
    .share-btn{display:block;width:calc(100% - 40px);margin:10px 20px 25px;padding:15px;background:#3b82f6;color:#fff;border:none;border-radius:15px;font-weight:800;cursor:pointer;text-align:center}
  </style>
</head>
<body>
<div class="container">
  <header class="header">
    <h1>⚽ 경기 컨디션 분석 리포트</h1>
    <p>스포츠 과학 · 재활 · 영양학 통합 솔루션</p>
  </header>

  <form id="main-form">
    <!-- 워치 & 종목 -->
    <div class="section">
      <span class="section-title">⌚ 워치 착용 & ⚽ 운동 종목</span>
      <div class="btn-group" style="margin-bottom:10px">
        <button type="button" class="toggle-btn watch-btn active" data-watch="yes">워치 착용</button>
        <button type="button" class="toggle-btn watch-btn" data-watch="no">미착용</button>
      </div>
      <div class="btn-group">
        <button type="button" class="toggle-btn sport-btn active" data-sport="futsal">🏠 풋살</button>
        <button type="button" class="toggle-btn sport-btn" data-sport="football">🌳 축구</button>
      </div>
    </div>

    <!-- 거리 -->
    <div class="section" id="dist-area">
      <span class="section-title">📏 경기 활동 거리 (km)</span>
      <input type="number" id="match-dist" class="num-box" value="3.8" step="0.1" min="0.1">
    </div>

    <!-- 경기 시간 -->
    <div class="section">
      <span class="section-title">⏱️ 상세 경기 시간</span>
      <select id="match-duration"></select>
    </div>

    <!-- 통증 부위 -->
    <div class="section">
      <span class="section-title">🩹 현재 불편한 부위 (다중 선택)</span>
      <div class="pain-grid">
        <label class="pain-item"><input type="checkbox" name="pain" value="calf"><span>종아리</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="knee"><span>무릎</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="hamstring"><span>햄스트링</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="ankle"><span>발목</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="groin"><span>사타구니</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="none" checked><span>통증 없음</span></label>
      </div>
    </div>

    <button type="submit" class="analyze-btn">📊 프로급 정밀 분석 시작</button>
  </form>

  <!-- 결과 -->
  <section id="result">
    <div class="res-card">
      <h3 id="res-title" style="font-weight:900;color:#4f46e5;margin-bottom:10px;">분석 리포트</h3>
      <div class="stat-grid">
        <div class="stat-box"><span class="stat-val" id="out-dist">-</span><span class="stat-lab">거리</span></div>
        <div class="stat-box"><span class="stat-val" id="out-load">-</span><span class="stat-lab">부하 지수</span></div>
        <div class="stat-box"><span class="stat-val" id="out-ready">-</span><span class="stat-lab">준비도</span></div>
      </div>
      <p id="out-summary" style="font-size:.9rem;font-weight:600;color:#475569;"></p>
    </div>

    <!-- 과학적 회복 프로토콜 -->
    <div class="info-card">
      <h3 style="margin-bottom:15px;font-weight:900;">🩹 과학적 회복 프로토콜</h3>
      <div class="pro-item">
        <div class="pro-time">🚨 즉시</div>
        <div class="pro-txt" id="now-action"></div>
      </div>
      <div class="pro-item">
        <div class="pro-time">⏰ 1시간 후</div>
        <div class="pro-txt" id="step1-action"></div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🌙 저녁</div>
        <div class="pro-txt" id="step2-action"></div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🛌 취침 전</div>
        <div class="pro-txt" id="step3-action"></div>
      </div>
    </div>

    <!-- 영양 & 파워젤 -->
    <div class="info-card" style="border-left:6px solid #10b981;">
      <h3 style="margin-bottom:10px;font-weight:900;">🍎 영양 및 파워젤 전략</h3>
      <div id="nutrition-guide" style="font-size:.92rem;font-weight:600;color:#334155;white-space:pre-wrap;"></div>
    </div>

    <!-- 히스토리 -->
    <div class="info-card" style="background:#f8fafc;">
      <h3 style="margin-bottom:10px;">📋 나의 경기 히스토리</h3>
      <div id="history-content" style="font-size:.85rem;"></div>
      <button id="del-history" style="width:100%;margin-top:10px;padding:8px;border:none;border-radius:10px;cursor:pointer;font-weight:700;">기록 삭제</button>
    </div>

    <!-- 팀 공유 -->
    <button type="button" class="share-btn" onclick="shareKakao()">📱 팀원에게 리포트 공유하기</button>
  </section>
</div>

<script>
  /* =========================
     1. 데이터 정의
     ========================= */

  const DURATIONS = {
    futsal: [
      {l:"15분 x 4쿼터 (60분)", v:60},
      {l:"15분 x 6쿼터 (90분)", v:90},
      {l:"20분 x 6쿼터 (120분)", v:120}
    ],
    football: [
      {l:"45분 x 2쿼터 (정식 90분)", v:90},
      {l:"25분 x 4쿼터 (2팀 경기 ≒100분)", v:100},
      {l:"25분 x 6쿼터 (3팀 경기 ≒150분)", v:150}
    ]
  };

  const RECOVERY_PLANS = {
    none: {
      now:'🧊 찬물 샤워 10–15분 (12–15°C, 염증 22%↓)',
      s1:'🍽️ 운동 후 30분 이내 탄수 1.2g/kg + 단백질 0.3g/kg 섭취',
      s2:'🧴 폼롤러 10분 (근막 이완, 지연성 근육통 감소)',
      s3:'💤 8시간 이상 깊은 수면 (성장호르몬 분비 ↑)'
    },
    calf: {
      now:'🧊 종아리 냉찜질 & 거상 20분 (부종 32%↓)',
      s1:'💊 마그네슘 400mg (경련 예방, 수분과 함께 섭취)',
      s2:'🧴 비복근 중심 폼롤러 3세트 (각 45초)',
      s3:'🛌 베개로 다리를 15도 올리고 취침'
    },
    knee: {
      now:'🧊 무릎 주변 냉찜질 + 압박 슬리브 착용',
      s1:'🦵 깊은 스쿼트·계단 오르기 48시간 지양',
      s2:'💊 글루코사민 1500mg (연골 보호 보충제)',
      s3:'🛌 대퇴사두근 등척성 수축 4세트 (각 30초)'
    },
    hamstring: {
      now:'🧊 허벅지 뒤쪽 냉찜질 + 가벼운 압박 밴드',
      s1:'🚶 통증이 VAS 2 이하인 범위에서만 가벼운 걷기',
      s2:'🧘 강한 스트레칭 금지, 가벼운 가동성 위주',
      s3:'🍒 타르트 체리 주스 240ml (염증·근손상 완화)'
    },
    ankle: {
      now:'🧊 발목 RICE 적용 + 8자 테이핑',
      s1:'🩹 기능성 보호대 착용 후 보행 (불안정성 감소)',
      s2:'🦶 한 발 서기 등 고유수용성 감각 훈련 3세트',
      s3:'🛌 발목을 심장보다 약간 높게 두고 취침'
    },
    groin: {
      now:'🧊 사타구니 냉찜질 15분 + 과도한 스트레칭 금지',
      s1:'🚶 짧은 보행 위주, 방향 전환·스프린트 금지',
      s2:'🧘 가벼운 고관절 가동 범위 운동 3세트',
      s3:'🛌 아침 통증 지속 시 팀 훈련 강도 50%로 조절'
    }
  };

  const NUTRITION_GUIDE = {
    high:'🔥 고강도 경기: 탄수화물 8–10g/kg + 단백질 2g/kg + 전해질 음료 1L 이상.\n연속 출전을 위해 글리코겐 리필과 근육 회복에 집중.',
    medium:'✅ 중강도 경기: 탄수 5–7g/kg + 단백질 1.5–2g/kg.\n체리 주스·항산화 음료를 곁들이면 염증 완화에 도움.',
    low:'😌 저강도 경기: 일반 식사 + 마그네슘 300–400mg.\n수분 30–35ml/kg 정도로 수분 균형만 맞춰주면 충분.'
  };

  function getGelText(duration){
    if(duration <= 60){
      return '⚡ 1시간 이내 경기: 평소 식사가 충분했다면 필수는 아님.\n후반에 쉽게 지치면 킥오프 10분 전 1개 정도만 섭취.';
    }else if(duration <= 100){
      return '⚡ 60–100분 경기: 킥오프 10분 전 1개 + 후반 시작 전 1개 (총 2개).\n시간당 30–60g 탄수화물 섭취를 목표로 하세요.';
    }else{
      return '⚡ 100분 이상(3팀 경기·연장 포함): 전반 30분 전후 1개 + 후반 시작 전 1개 + 필요 시 연장 전에 1개 (최대 3개).\n위 상태를 보면서 조절.';
    }
  }

  /* =========================
     2. 공통 함수
     ========================= */

  function updateOptions(sport){
    const sel = document.getElementById('match-duration');
    sel.innerHTML = DURATIONS[sport].map(o => `<option value="${o.v}">${o.l}</option>`).join('');
    sel.value = DURATIONS[sport][0].v;
  }

  function saveHistory(d){
    let h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    h.unshift(d);
    localStorage.setItem('matchHistory', JSON.stringify(h.slice(0,5)));
  }

  function renderHistory(){
    const h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    const box = document.getElementById('history-content');
    if(!box) return;
    box.innerHTML = h.length
      ? h.map(i => `<div class="history-row"><span>${i.date}</span><span>${i.dist}km</span><span style="color:#ef4444">부하 ${i.load}</span></div>`).join('')
      : '기록 없음';
  }

  function shareKakao(){
    const dist = document.getElementById('out-dist').textContent || '-';
    const load = document.getElementById('out-load').textContent || '-';
    const txt = `⚽ 오늘 경기 분석 리포트\n- 활동량: ${dist}\n- 신체 부하: ${load}\n상세 리포트 보기 👇\n${window.location.href}`;
    if(navigator.share){
      navigator.share({title:'경기 분석 리포트', text:txt, url:window.location.href});
    }else{
      navigator.clipboard.writeText(txt).then(()=>alert('리포트 내용이 복사되었습니다. 카톡에 붙여넣으세요.'));
    }
  }

  /* =========================
     3. 초기화 & 메인 로직
     ========================= */

  document.addEventListener('DOMContentLoaded', () => {
    // 종목별 시간 옵션 초기화
    updateOptions('futsal');
    renderHistory();

    // 워치 버튼
    document.querySelectorAll('.watch-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        document.querySelectorAll('.watch-btn').forEach(x=>x.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const isWatch = e.currentTarget.dataset.watch === 'yes';
        document.getElementById('dist-area').style.display = isWatch ? 'block' : 'block'; // 현재는 거리 입력만 사용
      });
    });

    // 종목 버튼
    document.querySelectorAll('.sport-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        document.querySelectorAll('.sport-btn').forEach(x=>x.classList.remove('active'));
        e.currentTarget.classList.add('active');
        updateOptions(e.currentTarget.dataset.sport);
      });
    });

    // 기록 삭제
    document.getElementById('del-history').addEventListener('click',()=>{
      if(confirm('기록을 모두 삭제할까요?')){
        localStorage.removeItem('matchHistory');
        renderHistory();
      }
    });

    // 메인 분석
    document.getElementById('main-form').addEventListener('submit',e=>{
      e.preventDefault();

      const sport = document.querySelector('.sport-btn.active').dataset.sport;
      const dist  = parseFloat(document.getElementById('match-dist').value || "3.8");
      const duration = parseInt(document.getElementById('match-duration').value,10);

      let pains = Array.from(document.querySelectorAll('input[name="pain"]:checked')).map(cb=>cb.value);
      if(pains.includes('none')) pains = ['none'];
      const mainPain = pains[0] || 'none';

      let mult = 1.0;
      pains.forEach(p=>{
        if(p !== 'none') mult *= (p === 'knee' ? 1.5 : 1.35);
      });

      const load  = Math.round(dist * duration * mult / 7.5);
      const ready = Math.max(30, 100 - Math.round(load/6));

      // 요약 카드
      document.getElementById('res-title').textContent =
        (sport === 'futsal' ? '🏠 풋살' : '🌳 축구') + ' 컨디션 분석 리포트';
      document.getElementById('out-dist').textContent  = dist.toFixed(1) + 'km';
      document.getElementById('out-load').textContent  = load;
      document.getElementById('out-ready').textContent = ready + '%';
      document.getElementById('out-summary').textContent =
        `선택한 부위와 경기 시간 기준으로 신체 부하가 정상 대비 약 ${Math.round((mult-1)*100)}% 증가한 상태입니다. ` +
        (ready < 70 ? '집중 회복이 필요합니다.' : '다음 경기 준비 상태가 양호한 편입니다.');

      // 회복 프로토콜
      const plan = RECOVERY_PLANS[mainPain] || RECOVERY_PLANS.none;
      document.getElementById('now-action').textContent   = plan.now;
      document.getElementById('step1-action').textContent = plan.s1;
      document.getElementById('step2-action').textContent = plan.s2;
      document.getElementById('step3-action').textContent = plan.s3;

      // 영양 + 파워젤
      let intensity;
      if(load >= 700) intensity = 'high';
      else if(load >= 500) intensity = 'medium';
      else intensity = 'low';

      const nutTxt = NUTRITION_GUIDE[intensity];
      const gelTxt = getGelText(duration);
      document.getElementById('nutrition-guide').textContent = nutTxt + '\n\n' + gelTxt;

      // 히스토리 저장
      saveHistory({date:new Date().toLocaleDateString('ko-KR'), dist:dist.toFixed(1), load});
      renderHistory();

      // 결과 표시
      document.getElementById('result').style.display = 'block';
      document.getElementById('result').scrollIntoView({behavior:'smooth'});
    });
  });
</script>
</body>
</html>
