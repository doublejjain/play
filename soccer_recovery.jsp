<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
  <title>⚽ 풋살/축구 컨디션 분석</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:12px;color:#1e293b;line-height:1.6}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 20px 40px rgba(0,0,0,0.1)}
    
    .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;padding:35px 20px}
    .header h1{font-size:1.8rem;font-weight:900;margin-bottom:8px}
    .header p{opacity:0.9;font-size:.95rem}
    
    .section{padding:20px;border-bottom:1px solid #f1f5f9}
    .section-title{font-weight:800;font-size:1.05rem;color:#334155;margin-bottom:15px;display:block}
    .btn-group{display:flex;gap:12px}
    .toggle-btn{flex:1;padding:16px;border:2px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:800;cursor:pointer;transition:all .2s}
    .toggle-btn.active{background:#4f46e5;color:#fff;border-color:#4f46e5;box-shadow:0 4px 12px rgba(79,70,229,0.4)}
    .num-box{width:100%;padding:15px;font-size:2rem;text-align:center;border:2px solid #e2e8f0;border-radius:16px;font-weight:900}
    select{width:100%;height:56px;padding:12px;font-size:1rem;border:2px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:700}
    
    .pain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
    .pain-item{display:flex;align-items:center;justify-content:center;padding:14px;border:2px solid #f1f5f9;border-radius:12px;cursor:pointer;background:#f8fafc;transition:.2s;font-weight:500}
    .pain-item input{display:none}
    .pain-item:has(input:checked){background:#eef6ff;border-color:#4f46e5;color:#4f46e5;font-weight:700}
    
    .analyze-btn{width:calc(100% - 40px);margin:25px 20px;padding:18px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;font-size:1.15rem;font-weight:900;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,0.3)}
    
    #result{display:none;padding:20px 20px 120px;background:#fff}
    .res-card{margin:15px 0 20px;padding:25px;background:#f8fafc;border-radius:20px;border-left:5px solid #4f46e5}
    .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:20px 0}
    .stat-box{text-align:center;background:#fff;padding:20px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.05)}
    .stat-val{font-size:1.6rem;font-weight:900;color:#ef4444;margin-bottom:4px;display:block}
    .stat-lab{font-size:.85rem;color:#64748b;font-weight:600}
    
    .info-card{margin:15px 0;padding:25px;background:#fff;border-radius:20px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
    .card-title{margin:0 0 20px;font-size:1.15rem;font-weight:900;color:#1e293b}
    .pro-item{display:flex;gap:15px;padding:18px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
    .pro-time{min-width:85px;background:linear-gradient(135deg,#eef2ff,#e0e7ff);color:#4f46e5;font-size:.85rem;font-weight:800;padding:8px 12px;border-radius:12px;text-align:center;flex-shrink:0}
    .pro-content{font-size:.95rem;font-weight:600;color:#334155;line-height:1.6;word-break:keep-all;flex:1}
    
    .nutrition-content{font-size:.95rem;font-weight:600;color:#334155;line-height:1.65;white-space:pre-wrap;word-break:keep-all;padding:15px 0}
    
    #historyList{max-height:200px;overflow-y:auto}
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

  <form id="analysisForm">
    <div class="section">
      <span class="section-title">⚽ 종목 선택</span>
      <div class="btn-group">
        <button type="button" class="toggle-btn sport-btn active" data-sport="futsal">🏠 풋살</button>
        <button type="button" class="toggle-btn sport-btn" data-sport="football">🌳 축구</button>
      </div>
    </div>

    <div class="section">
      <span class="section-title">📏 활동 거리 (km)</span>
      <input type="number" id="distanceInput" class="num-box" value="3.8" step="0.1" min="0.5" max="20">
    </div>

    <div class="section">
      <span class="section-title">⏱️ 경기 시간</span>
      <select id="durationSelect"></select>
    </div>

    <div class="section">
      <span class="section-title">🩹 통증 부위 (복수 선택 가능)</span>
      <div class="pain-grid">
        <label class="pain-item"><input type="checkbox" name="painArea" value="none" checked><span>통증없음</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="calf"><span>종아리</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="knee"><span>무릎</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="hamstring"><span>햄스트링</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="ankle"><span>발목</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="groin"><span>사타구니</span></label>
      </div>
    </div>

    <button type="submit" class="analyze-btn">📊 정밀 분석 실행</button>
  </form>

  <!-- 결과 섹션 -->
  <section id="resultSection" style="display:none">
    <div class="res-card">
      <h3 id="reportTitle" class="card-title">🏠 풋살 분석 리포트</h3>
      <div class="stat-grid">
        <div class="stat-box">
          <span class="stat-val" id="distanceResult">-</span>
          <span class="stat-lab">활동량</span>
        </div>
        <div class="stat-box">
          <span class="stat-val" id="loadResult">-</span>
          <span class="stat-lab">부하 지수</span>
        </div>
        <div class="stat-box">
          <span class="stat-val" id="readinessResult">-</span>
          <span class="stat-lab">준비도</span>
        </div>
      </div>
      <div id="statusSummary" style="font-size:.95rem;color:#475569;font-weight:600;margin-top:15px;line-height:1.6"></div>
    </div>

    <!-- 과학적 회복 프로토콜 -->
    <div class="info-card">
      <h3 class="card-title">🩹 48시간 과학적 회복 프로토콜</h3>
      <div class="pro-item">
        <div class="pro-time">🚨 즉시 (0-30분)</div>
        <div class="pro-content" id="recoveryImmediate">-</div>
      </div>
      <div class="pro-item">
        <div class="pro-time">⏰ 1시간 후</div>
        <div class="pro-content" id="recovery1Hour">-</div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🌙 저녁 (6-8시간)</div>
        <div class="pro-content" id="recoveryEvening">-</div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🛌 취침 전</div>
        <div class="pro-content" id="recoveryBedtime">-</div>
      </div>
    </div>

    <!-- 영양 및 파워젤 -->
    <div class="info-card" style="border-left:5px solid #10b981">
      <h3 class="card-title">🍎 영양 & 파워젤 전략</h3>
      <div id="nutritionStrategy" class="nutrition-content">-</div>
    </div>

    <!-- 히스토리 -->
    <div class="info-card">
      <h3 class="card-title">📋 최근 경기 기록</h3>
      <div id="historyList" class="history-empty">분석 후 기록이 표시됩니다</div>
      <button class="del-btn" onclick="clearAllHistory()">전체 기록 삭제</button>
    </div>

    <button class="share-btn" onclick="shareAnalysis()">📱 팀원에게 리포트 공유</button>
  </section>
</div>

<script>
/** 데이터 정의 - 무조건 동작하는 버전 */
const GAME_DURATIONS = {
  futsal: [
    {text:'15분×4쿼터 (60분)', value:60},
    {text:'15분×6쿼터 (90분)', value:90},
    {text:'20분×6쿼터 (120분)', value:120}
  ],
  football: [
    {text:'45분×2하프 (90분)', value:90},
    {text:'25분×4쿼터 (100분)', value:100},
    {text:'25분×6쿼터 (150분)', value:150}
  ]
};

const RECOVERY_DATA = {
  'none': {
    immediate: '🧊 찬물 샤워 10-15분 (12-15°C, 염증 22%↓)',
    '1Hour': '🍽️ 탄수화물 1.2g/kg + 단백질 0.3g/kg (30분 내 필수)',
    evening: '🧴 폼롤러 10분 전신 (근막이완, DOMS 30%↓)',
    bedtime: '💤 8시간 이상 숙면 (성장호르몬 최대 분비)'
  },
  'calf': {
    immediate: '🧊 종아리 냉찜질 20분 + 다리 거상 (부종 32%↓)',
    '1Hour': '💊 마그네슘 400mg 즉시 복용 (근경련 40% 예방)',
    evening: '🧴 비복근 폼롤러 3세트×45초 (혈류 개선)',
    bedtime: '🛌 다리 15° 높여 취침 (부종 완전 제거)'
  },
  'knee': {
    immediate: '🧊 무릎 압박 슬리브 + 냉찜질 15분',
    '1Hour': '🦵 깊은 굴곡동작 48시간 완전 금지',
    evening: '💊 글루코사민 1500mg (연골 보호 효과)',
    bedtime: '🛌 대퇴사두근 등척성 수축 4세트×30초'
  },
  'hamstring': {
        immediate: '🧊 허벅지 뒤쪽 냉찜질 + 압박 밴드',
    '1Hour': '🚶 VAS 2 이하에서만 가벼운 보행 허용',
    evening: '🧘 강한 스트레칭 금지 (재손상 위험)',
    bedtime: '🍒 타르트 체리 주스 240ml (염증 25%↓)'
  },
  'ankle': {
    immediate: '🧊 발목 RICE + 8자 테이핑 즉시 적용',
    '1Hour': '🩹 기능성 보호대 착용 (인대 안정성↑)',
    evening: '🦶 한발 서기 훈련 3세트 (고유수용감각)',
    bedtime: '🛌 발목 심장보다 높게 유지 수면'
  },
  'groin': {
    immediate: '🧊 사타구니 냉찜질 15분 + 과신전 금지',
    '1Hour': '🚶 방향전환·스프린트 72시간 완전 금지',
    evening: '🧘 고관절 가동성 운동 3세트 (안전 범위)',
    bedtime: '🛌 내전근 스트레칭 없이 취침'
  }
};

const NUTRITION_DATA = {
  high: '🔥 고강도 경기 (부하 700↑)\n• 탄수화물 8-10g/kg + 단백질 2g/kg\n• 전해질 음료 1L 이상 필수\n• 글리코겐 리필 집중',
  medium: '✅ 중강도 경기 (부하 500-700)\n• 탄수 5-7g/kg + 단백질 1.5-2g/kg\n• 체리주스 병행 (염증 완화)\n• 마그네슘 400mg 권장',
  low: '😌 저강도 경기 (부하 500↓)\n• 일반 식사 유지\n• 마그네슘 300-400mg\n• 수분 30-35ml/kg 보충'
};

function getGelTiming(duration) {
  if (duration <= 60) return '⚡ 1시간 이내: 후반 피로시 킥오프 10분 전 1개';
  if (duration <= 100) return '⚡ 60-100분: 킥오프 전 1개 + 후반 시작 전 1개';
  return '⚡ 100분↑: 전반30분 전 1개 + 후반 시작 전 1개 + 연장 전 1개';
}

/** 유틸리티 함수들 */
function updateDurationOptions(sport) {
  const select = document.getElementById('durationSelect');
  const options = GAME_DURATIONS[sport] || GAME_DURATIONS.futsal;
  select.innerHTML = options.map(game => 
    `<option value="${game.value}">${game.text}</option>`
  ).join('');
}

function saveMatchHistory(distance, load) {
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  history.unshift({
    date: new Date().toLocaleDateString('ko-KR'),
    distance: distance.toFixed(1),
    load: load,
    sport: document.querySelector('.sport-btn.active').dataset.sport
  });
  localStorage.setItem('matchHistory', JSON.stringify(history.slice(0, 10)));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const container = document.getElementById('historyList');
  if (history.length === 0) {
    container.innerHTML = '<div class="history-empty">분석 후 기록이 표시됩니다</div>';
    return;
  }
  container.innerHTML = history.map(record => `
    <div class="history-row">
      <span>${record.date}</span>
      <span>${record.distance}km</span>
      <span style="color:#ef4444">부하 ${record.load}</span>
    </div>
  `).join('');
}

function clearAllHistory() {
  if (confirm('모든 기록을 삭제하시겠습니까?')) {
    localStorage.removeItem('matchHistory');
    renderHistory();
  }
}

function shareAnalysis() {
  const distance = document.getElementById('distanceResult').textContent;
  const load = document.getElementById('loadResult').textContent;
  const readiness = document.getElementById('readinessResult').textContent;
  
  const shareText = `⚽ 경기 분석 결과\n거리: ${distance}\n부하: ${load}\n준비도: ${readiness}\n\n자세한 리포트: ${window.location.href}`;
  
  if (navigator.share) {
    navigator.share({
      title: '⚽ 풋살/축구 컨디션 분석',
      text: shareText,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('📋 분석 결과가 클립보드에 복사되었습니다!\n카카오톡에 붙여넣기 하세요.');
    }).catch(() => {
      alert('공유 텍스트: ' + shareText);
    });
  }
}

/** 초기화 및 이벤트 바인딩 */
document.addEventListener('DOMContentLoaded', function() {
  // 1. 초기 시간 옵션 설정
  updateDurationOptions('futsal');
  
  // 2. 히스토리 로드
  renderHistory();
  
  // 3. 종목 버튼 이벤트
  document.querySelectorAll('.sport-btn').forEach(button => {
    button.addEventListener('click', function() {
      // 활성 클래스 토글
      document.querySelectorAll('.sport-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // 시간 옵션 업데이트
      updateDurationOptions(this.dataset.sport);
      
      // 타이틀 업데이트
      document.getElementById('reportTitle').textContent = 
        (this.dataset.sport === 'futsal' ? '🏠 풋살' : '🌳 축구') + ' 분석 리포트';
    });
  });
  
  // 4. 분석 버튼 이벤트
  document.getElementById('analysisForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    try {
      // 입력값 수집
      const sport = document.querySelector('.sport-btn.active').dataset.sport;
      const distance = parseFloat(document.getElementById('distanceInput').value) || 3.8;
      const duration = parseInt(document.getElementById('durationSelect').value) || 60;
      
      // 통증 부위 분석
      const painCheckboxes = document.querySelectorAll('input[name="painArea"]:checked');
      let painAreas = Array.from(painCheckboxes).map(cb => cb.value).filter(v => v !== 'none');
      const primaryPain = painAreas.length > 0 ? painAreas[0] : 'none';
      
      // 부하 계산
      let loadMultiplier = 1.0;
      if (primaryPain === 'knee') loadMultiplier = 1.5;
      else if (primaryPain === 'hamstring' || primaryPain === 'groin') loadMultiplier = 1.4;
      else if (primaryPain === 'calf' || primaryPain === 'ankle') loadMultiplier = 1.3;
      
      const totalLoad = Math.round(distance * duration * loadMultiplier / 7.5);
      const readiness = Math.max(30, 100 - Math.round(totalLoad / 6));
      
      // 1. 기본 결과 업데이트
      document.getElementById('distanceResult').textContent = distance.toFixed(1) + 'km';
      document.getElementById('loadResult').textContent = totalLoad;
      document.getElementById('readinessResult').textContent = readiness + '%';
      
      // 상태 요약
      const loadIncrease = Math.round((loadMultiplier - 1) * 100);
      document.getElementById('statusSummary').innerHTML = `
        <strong>상태 리포트:</strong> 부하 <strong>${loadIncrease}%</strong> 증가 | 
        ${readiness < 70 ? 
          '<span style="color:#ef4444">⚠️ 과부하 상태 - 집중 회복 필요</span>' : 
          '<span style="color:#10b981">✅ 정상 범위 - 다음 경기 준비 가능</span>'
        }
      `;
      
      // 2. 회복 프로토콜 업데이트 (무조건 동작)
      const recoveryPlan = RECOVERY_DATA[primaryPain] || RECOVERY_DATA.none;
      document.getElementById('recoveryImmediate').textContent = recoveryPlan.immediate;
      document.getElementById('recovery1Hour').textContent = recoveryPlan['1Hour'];
      document.getElementById('recoveryEvening').textContent = recoveryPlan.evening;
      document.getElementById('recoveryBedtime').textContent = recoveryPlan.bedtime;
      
      // 3. 영양 전략 업데이트 (무조건 동작)
      const nutritionLevel = totalLoad >= 700 ? 'high' : totalLoad >= 500 ? 'medium' : 'low';
      const nutritionText = NUTRITION_DATA[nutritionLevel];
      const gelText = getGelTiming(duration);
      
      document.getElementById('nutritionStrategy').innerHTML = `
        <div style="margin-bottom:15px;">${nutritionText}</div>
        <div style="background:#f0fdf4;padding:15px;border-radius:12px;border-left:4px solid #10b981;">
          <strong>${gelText}</strong>
        </div>
      `;
      
      // 4. 히스토리 저장 및 표시
      saveMatchHistory(distance, totalLoad);
      renderHistory();
      
      // 5. 결과 표시
      document.getElementById('resultSection').style.display = 'block';
      document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
      
      console.log('분석 완료:', { distance, duration, primaryPain, totalLoad, readiness });
      
    } catch (error) {
      console.error('분석 오류:', error);
      alert('분석 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    }
  });
});
</script>
</body>
</html>

