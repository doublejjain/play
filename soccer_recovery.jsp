<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
  <title>⚽ 풋살/축구 컨디션 분석 & 회복 리포트</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:12px;color:#1e293b;line-height:1.6}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 20px 40px rgba(0,0,0,0.1)}
    
    .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;padding:35px 20px}
    .header h1{font-size:1.8rem;font-weight:900;margin-bottom:8px}
    
    .section{padding:20px;border-bottom:1px solid #f1f5f9}
    .section-title{font-weight:800;font-size:1.05rem;color:#334155;margin-bottom:15px;display:block}
    .btn-group{display:flex;gap:12px}
    .toggle-btn{flex:1;padding:16px;border:2px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:800;cursor:pointer;transition:all .2s}
    .toggle-btn.active{background:#4f46e5;color:#fff;border-color:#4f46e5;box-shadow:0 4px 12px rgba(79,70,229,0.4)}
    .num-box{width:100%;padding:15px;font-size:2rem;text-align:center;border:2px solid #e2e8f0;border-radius:16px;font-weight:900}
    select{width:100%;height:56px;padding:12px;font-size:1rem;border:2px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:700}
    
    .pain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
    .pain-item{display:flex;align-items:center;justify-content:center;padding:14px;border:2px solid #f1f5f9;border-radius:12px;cursor:pointer;background:#f8fafc;transition:.2s}
    .pain-item input{display:none}
    .pain-item input:checked + span + .pain-item{background:#eef6ff !important;border-color:#4f46e5 !important;color:#4f46e5 !important;font-weight:700 !important}
    
    .analyze-btn{width:calc(100% - 40px);margin:25px 20px;padding:18px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;font-size:1.15rem;font-weight:900;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,0.3)}
    
    #result{display:none;padding:20px 20px 120px;background:#fff}
    .res-card{margin:15px 0 20px;padding:25px;background:#f8fafc;border-radius:20px;border-left:5px solid #4f46e5}
    .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:20px 0}
    .stat-box{text-align:center;background:#fff;padding:20px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.05)}
    .stat-val{font-size:1.6rem;font-weight:900;color:#ef4444;margin-bottom:4px}
    .stat-lab{font-size:.85rem;color:#64748b;font-weight:600}
    
    .info-card{margin:15px 0;padding:25px;background:#fff;border-radius:20px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
    .card-title{margin:0 0 20px;font-size:1.15rem;font-weight:900;color:#1e293b}
    .pro-item{display:flex;gap:15px;padding:18px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
    .pro-time{min-width:85px;background:linear-gradient(135deg,#eef2ff,#e0e7ff);color:#4f46e5;font-size:.85rem;font-weight:800;padding:8px 12px;border-radius:12px;text-align:center;flex-shrink:0}
    .pro-content{font-size:.95rem;font-weight:600;color:#334155;line-height:1.6;word-break:keep-all}
    
    .nutrition-content{font-size:.95rem;font-weight:600;color:#334155;line-height:1.65;white-space:pre-wrap;word-break:keep-all;padding:15px 0}
    
    #history-content{max-height:200px;overflow-y:auto}
    .history-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:.9rem;font-weight:600}
    .history-empty{text-align:center;color:#94a3b8;font-size:.95rem;padding:30px;font-style:italic}
    
    .share-btn{width:calc(100% - 40px);margin:20px auto;display:block;padding:16px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;border:none;border-radius:16px;font-weight:800;font-size:1rem;cursor:pointer;text-align:center;box-shadow:0 4px 12px rgba(59,130,246,0.3)}
    .del-btn{width:100%;margin-top:15px;padding:12px;border:none;border-radius:12px;background:#ef4444;color:#fff;font-weight:700;cursor:pointer;font-size:1rem}
  </style>
</head>
<body>
<div class="container">
  <header class="header">
    <h1>⚽ 풋살/축구 컨디션 분석</h1>
    <p>스포츠과학 + 재활 + 영양학 통합 솔루션</p>
  </header>

  <form id="mainForm">
    <div class="section">
      <span class="section-title">⚽ 기본 설정</span>
      <div class="btn-group">
        <button type="button" class="toggle-btn sport-btn active" data-sport="futsal">🏠 풋살</button>
        <button type="button" class="toggle-btn sport-btn" data-sport="football">🌳 축구</button>
      </div>
    </div>

    <div class="section">
      <span class="section-title">📏 활동 거리</span>
      <input type="number" id="distance" class="num-box" value="3.8" step="0.1" min="0.5" max="20">
      <small style="color:#64748b;font-size:.8rem;display:block;margin-top:5px">워치 데이터 또는 추정값</small>
    </div>

    <div class="section">
      <span class="section-title">⏱️ 경기 시간</span>
      <select id="duration"></select>
    </div>

    <div class="section">
      <span class="section-title">🩹 통증 부위</span>
      <div class="pain-grid">
        <label class="pain-item"><input type="checkbox" name="pain" value="none" checked><span>통증없음</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="calf"><span>종아리</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="knee"><span>무릎</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="hamstring"><span>햄스트링</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="ankle"><span>발목</span></label>
        <label class="pain-item"><input type="checkbox" name="pain" value="groin"><span>사타구니</span></label>
      </div>
    </div>

    <button type="submit" class="analyze-btn">📊 정밀 분석 시작</button>
  </form>

  <section id="resultSection" style="display:none">
    <!-- 분석 요약 -->
    <div class="res-card">
      <h3 id="sportTitle" class="card-title">🏠 풋살 분석 리포트</h3>
      <div class="stat-grid">
        <div class="stat-box">
          <span class="stat-val" id="outDistance">-</span>
          <span class="stat-lab">활동량</span>
        </div>
        <div class="stat-box">
          <span class="stat-val" id="outLoad">-</span>
          <span class="stat-lab">부하지수</span>
        </div>
        <div class="stat-box">
          <span class="stat-val" id="outReadiness">-</span>
          <span class="stat-lab">준비도</span>
        </div>
      </div>
      <div id="summaryText" style="font-size:.95rem;color:#475569;font-weight:600;margin-top:15px;line-height:1.6"></div>
    </div>

    <!-- 회복 프로토콜 -->
    <div class="info-card">
      <h3 class="card-title">🩹 48시간 과학적 회복 프로토콜</h3>
      <div class="pro-item">
        <div class="pro-time">🚨 즉시 (0-30분)</div>
        <div class="pro-content" id="recoveryNow">대기중...</div>
      </div>
      <div class="pro-item">
        <div class="pro-time">⏰ 1시간 후</div>
        <div class="pro-content" id="recovery1h">대기중...</div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🌙 저녁 (6-8시간)</div>
        <div class="pro-content" id="recoveryEvening">대기중...</div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🛌 취침 전</div>
        <div class="pro-content" id="recoveryNight">대기중...</div>
      </div>
    </div>

    <!-- 영양 파워젤 -->
    <div class="info-card" style="border-left:5px solid #10b981">
      <h3 class="card-title">🍎 영양 & 파워젤 전략</h3>
      <div id="nutritionContent" class="nutrition-content">대기중...</div>
    </div>

    <!-- 히스토리 -->
    <div class="info-card">
      <h3 class="card-title">📋 최근 경기 기록</h3>
      <div id="historyList"></div>
      <button class="del-btn" onclick="clearHistory()">기록 전체 삭제</button>
    </div>

    <button class="share-btn" onclick="shareResult()">📱 팀원에게 공유하기</button>
  </section>
</div>

<script>
/* 데이터 정의 */
const GAME_TIMES = {
  futsal: [
    {text: '15분×4쿼터 (60분)', value: 60},
    {text: '15분×6쿼터 (90분)', value: 90},
    {text: '20분×6쿼터 (120분)', value: 120}
  ],
  football: [
    {text: '45분×2하프 (90분)', value: 90},
    {text: '25분×4쿼터 (100분)', value: 100},
    {text: '25분×6쿼터 (150분)', value: 150}
  ]
};

const RECOVERY_PROTOCOLS = {
  none: {
    now: '🧊 찬물 샤워 10-15분 (12-15°C, 염증 22%↓)',
    '1h': '🍽️ 탄수화물 1.2g/kg + 단백질 0.3g/kg (30분 내)',
    evening: '🧴 폼롤러 10분 전신 (근막이완, DOMS 30%↓)',
    night: '💤 8시간 수면 (성장호르몬 최대 분비)'
  },
  calf: {
    now: '🧊 종아리 냉찜질 20분 + 다리 거상 (부종 32%↓)',
    '1h': '💊 마그네슘 400mg (근경련 40% 예방 효과)',
    evening: '🧴 비복근 폼롤러 3세트×45초 (혈류개선)',
    night: '🛌 다리 15° 높여 취침 (부종 완전 제거)'
  },
  knee: {
    now: '🧊 무릎 압박 슬리브 + 냉찜질 15분',
    '1h': '🦵 깊은 굴곡동작 48시간 완전 금지',
    evening: '💊 글루코사민 1500mg (연골 보호)',
    night: '🛌 대퇴사두근 등척성 수축 4세트×30초'
  },
  hamstring: {
    now: '🧊 허벅지뒤쪽 냉찜질 + 압박밴드',
    '1h': '🚶 VAS 2 이하에서만 가벼운 보행',
    evening: '🧘 강한 스트레칭 금지 (재손상 위험)',
    night: '🍒 타르트체리주스 240ml (염증 25%↓)'
  },
  ankle: {
    now: '🧊 발목 RICE + 8자 테이핑',
    '1h': '🩹 기능성 보호대 착용 (안정성↑)',
    evening: '🦶 한발서기 훈련 3세트 (고유수용감각)',
    night: '🛌 발목 심장보다 높게 수면'
  },
  groin: {
    now: '🧊 사타구니 냉찜질 15분 + 과신전 금지',
    '1h': '🚶 방향전환·스프린트 72시간 금지',
    evening: '🧘 고관절 가동성 운동 3세트',
    night: '🛌 내전근 스트레칭 없이 취침'
  }
};

const NUTRITION_GUIDES = {
  high: '🔥 고강도 (부하 700↑)\n• 탄수화물 8-10g/kg + 단백질 2g/kg\n• 전해질 음료 1L 이상\n• 글리코겐 리필 필수',
  medium: '✅ 중강도 (부하 500-700)\n• 탄수 5-7g/kg + 단백질 1.5-2g/kg\n• 체리주스 권장 (염증↓)\n• 마그네슘 400mg',
  low: '😌 저강도 (부하 500↓)\n• 일반식사 유지\n• 마그네슘 300-400mg\n• 수분 30-35ml/kg'
};

function initGameTimes(sport = 'futsal') {
  const select = document.getElementById('duration');
  select.innerHTML = GAME_TIMES[sport].map(game => 
    `<option value="${game.value}">${game.text}</option>`
  ).join('');
}

function calculateLoad(distance, duration, pains) {
  let multiplier = 1.0;
  if (pains.includes('knee')) multiplier *= 1.5;
  else if (pains.includes('hamstring') || pains.includes('groin')) multiplier *= 1.4;
  else if (pains.includes('calf') || pains.includes('ankle')) multiplier *= 1.3;
  
  return Math.round(distance * duration * multiplier / 7.5);
}

function getNutritionGuide(load) {
  if (load >= 700) return NUTRITION_GUIDES.high;
  if (load >= 500) return NUTRITION_GUIDES.medium;
  return NUTRITION_GUIDES.low;
}

function getGelAdvice(duration) {
  if (duration <= 60) return '⚡ 단시간경기\n킥오프 10분전 1개 (선택)';
  if (duration <= 100) return '⚡ 표준경기\n킥오프전 1개 + 후반전 1개';
  return '⚡ 장시간경기\n전반30분전 1개 + 후반전 1개 + 연장전 1개';
}

function clearHistory() {
  if (confirm('모든 기록을 삭제하시겠습니까?')) {
    localStorage.removeItem('matchHistory');
    document.getElementById('historyList').innerHTML = '<div class="history-empty">기록 없음</div>';
  }
}

function shareResult() {
  const dist = document.getElementById('outDistance').textContent;
  const load = document.getElementById('outLoad').textContent;
  const text = `⚽ 경기분석\n거리: ${dist}\n부하: ${load}\n자세한 리포트: ${location.href}`;
  
  if (navigator.share) {
    navigator.share({title: '경기분석 리포트', text, url: location.href});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('클립보드에 복사되었습니다!'));
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // 초기화
  initGameTimes();
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  if (history.length) {
    document.getElementById('historyList').innerHTML = history.map(h => 
      `<div class="history-row">
        <span>${h.date}</span>
        <span>${h.distance}km</span>
        <span style="color:#ef4444">부하 ${h.load}</span>
      </div>`
    ).join('');
  }

  // 종목 선택
  document.querySelectorAll('.sport-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sport-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      initGameTimes(this.dataset.sport);
      document.getElementById('sportTitle').textContent = 
        (this.dataset.sport === 'futsal' ? '🏠 풋살' : '🌳 축구') + ' 분석 리포트';
    });
  });

  // 폼 제출
  document.getElementById('mainForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const sportBtn = document.querySelector('.sport-btn.active');
    const distance = parseFloat(document.getElementById('distance').value) || 3.8;
    const duration = parseInt(document.getElementById('duration').value) || 60;
    
    const checkedPains = Array.from(document.querySelectorAll('input[name="pain"]:checked'))
      .map(cb => cb.value).filter(v => v !== 'none');
    const mainPain = checkedPains[0] || 'none';
    
    const load = calculateLoad(distance, duration, checkedPains);
    const readiness = Math.max(30, 100 - Math.round(load / 6));
    
    // 결과 업데이트
    document.getElementById('outDistance').textContent = distance.toFixed(1) + 'km';
    document.getElementById('outLoad').textContent = load;
    document.getElementById('outReadiness').textContent = readiness + '%';
    
    document.getElementById('summaryText').innerHTML = 
      `부하 <strong>${Math.round((load/100))}%</strong> 증가 | ` +
      (readiness < 70 ? '<span style="color:#ef4444">집중 회복 필요</span>' : 
       '<span style="color:#10b981">다음경기 준비 양호</span>');
    
    // 회복 프로토콜
    const protocol = RECOVERY_PROTOCOLS[mainPain] || RECOVERY_PROTOCOLS.none;
    document.getElementById('recoveryNow').textContent = protocol.now;
    document.getElementById('recovery1h').textContent = protocol['1h'];
    document.getElementById('recoveryEvening').textContent = protocol.evening;
    document.getElementById('recoveryNight').textContent = protocol.night;
    
    // 영양 가이드
    const nutrition = getNutritionGuide(load);
    const gelAdvice = getGelAdvice(duration);
    document.getElementById('nutritionContent').innerHTML = 
      `<strong>${nutrition}</strong><br><br><strong>${gelAdvice}</strong>`;
    
    // 히스토리 저장
    const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    history.unshift({
      date: new Date().toLocaleDateString('ko-KR'),
      distance: distance.toFixed(1),
      load: load
    });
    localStorage.setItem('matchHistory', JSON.stringify(history.slice(0, 10)));
    
    // 결과 표시
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({behavior: 'smooth'});
  });
});
</script>
</body>
</html>
