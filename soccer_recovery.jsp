<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
  <title>⚽ 풋살/축구 컨디션 분석</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:12px;color:#1e293b;line-height:1.6}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 20px 40px rgba(0,0,0,0.1);overflow:hidden}

    .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;padding:35px 20px}
    .header h1{font-size:1.8rem;font-weight:900;margin-bottom:8px}
    .header p{opacity:.9;font-size:.95rem}

    .section{padding:20px;border-bottom:1px solid #f1f5f9}
    .section-title{font-weight:800;font-size:1.05rem;color:#334155;margin-bottom:15px;display:block}

    .btn-group{display:flex;gap:12px}
    .toggle-btn{flex:1;padding:16px;border:2px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:800;cursor:pointer;transition:all .2s;font-size:1rem}
    .toggle-btn.active{background:#4f46e5;color:#fff;border-color:#4f46e5;box-shadow:0 4px 12px rgba(79,70,229,0.4)}

    .num-box{width:100%;padding:15px;font-size:2rem;text-align:center;border:2px solid #e2e8f0;border-radius:16px;font-weight:900}
    select{width:100%;height:56px;padding:12px;font-size:1rem;border:2px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:700}

    .pain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
    .pain-item{display:flex;align-items:center;justify-content:center;padding:14px;border:2px solid #f1f5f9;border-radius:12px;cursor:pointer;background:#f8fafc;transition:.2s;font-weight:500;position:relative}
    .pain-item input{position:absolute;opacity:0}
    .pain-item.checked{background:#eef6ff;border-color:#4f46e5;color:#4f46e5;font-weight:700}

    .range-row{margin-top:10px}
    .range-label{display:flex;justify-content:space-between;font-size:.85rem;color:#64748b;margin-bottom:4px}
    .range-row input[type=range]{width:100%}

    .analyze-btn{width:calc(100% - 40px);margin:25px 20px;padding:18px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;font-size:1.15rem;font-weight:900;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,0.3)}

    #resultSection{padding:20px 20px 120px;background:#fff}
    .res-card{margin:15px 0 20px;padding:25px;background:#f8fafc;border-radius:20px;border-left:5px solid #4f46e5}
    .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:20px 0}
    .stat-box{text-align:center;background:#fff;padding:20px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.05)}
    .stat-val{font-size:1.5rem;font-weight:900;color:#ef4444;margin-bottom:4px;display:block}
    .stat-lab{font-size:.8rem;color:#64748b;font-weight:600}

    .info-card{margin:15px 0;padding:25px;background:#fff;border-radius:20px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
    .card-title{margin:0 0 20px;font-size:1.15rem;font-weight:900;color:#1e293b}
    .pro-item{display:flex;gap:15px;padding:18px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
    .pro-time{min-width:90px;background:#eef2ff;color:#4f46e5;font-size:.8rem;font-weight:800;padding:8px;border-radius:12px;text-align:center}
    .pro-content{font-size:.95rem;font-weight:600;color:#334155;line-height:1.6;flex:1}

    .nutrition-content{font-size:.95rem;font-weight:600;color:#334155;line-height:1.65;white-space:pre-wrap}

    #historyList{max-height:220px;overflow-y:auto}
    .history-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:.9rem;font-weight:600;cursor:pointer}
    .history-row:hover{background:#f8fafc}
    .history-meta{font-size:.8rem;color:#94a3b8;margin-top:2px}
    .history-empty{text-align:center;color:#94a3b8;font-size:.95rem;padding:30px;font-style:italic}

    .share-btn{width:calc(100% - 40px);margin:20px auto;display:block;padding:16px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;border:none;border-radius:16px;font-weight:800}
    .del-btn{width:100%;margin-top:15px;padding:12px;border:none;border-radius:12px;background:#ef4444;color:#fff;font-weight:700}
  </style>
</head>
<body>
<div class="container">
  <header class="header">
    <h1>⚽ 풋살/축구 컨디션 분석</h1>
    <p>스포츠과학 + 재활 + 영양학 개인 리포트</p>
  </header>

  <form id="analysisForm">
    <!-- 종목 -->
    <div class="section">
      <span class="section-title">⚽ 종목 선택</span>
      <div class="btn-group">
        <button type="button" class="toggle-btn sport-btn active" data-sport="futsal">🏠 풋살</button>
        <button type="button" class="toggle-btn sport-btn" data-sport="football">🌳 축구</button>
      </div>
    </div>

    <!-- 거리 -->
    <div class="section">
      <span class="section-title">📏 활동 거리 (km)</span>
      <input type="number" id="distanceInput" class="num-box" value="3.8" step="0.1" min="0.5" max="20" inputmode="decimal">
    </div>

    <!-- 시간 -->
    <div class="section">
      <span class="section-title">⏱️ 경기 시간</span>
      <select id="durationSelect"></select>
    </div>

    <!-- 통증 부위 -->
    <div class="section">
      <span class="section-title">🩹 통증 부위 (복수 선택 가능)</span>
      <div class="pain-grid" id="painGrid">
        <label class="pain-item checked"><input type="checkbox" name="painArea" value="none" checked><span>통증없음</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="calf"><span>종아리</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="knee"><span>무릎</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="hamstring"><span>햄스트링</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="ankle"><span>발목</span></label>
        <label class="pain-item"><input type="checkbox" name="painArea" value="groin"><span>사타구니</span></label>
      </div>
    </div>

    <!-- 컨디션 & 좌우 밸런스 -->
    <div class="section">
      <span class="section-title">🧠 컨디션 & 좌우 밸런스</span>
      <div class="range-row">
        <div class="range-label">
          <span>오늘 전체 컨디션</span>
          <span><span id="condValue">7</span> / 10</span>
        </div>
        <input type="range" id="conditionScore" min="1" max="10" value="7">
      </div>
      <div class="range-row">
        <div class="range-label">
          <span>왼발 체감 부하</span>
          <span><span id="leftValue">5</span> / 10</span>
        </div>
        <input type="range" id="leftLoad" min="0" max="10" value="5">
      </div>
      <div class="range-row">
        <div class="range-label">
          <span>오른발 체감 부하</span>
          <span><span id="rightValue">5</span> / 10</span>
        </div>
        <input type="range" id="rightLoad" min="0" max="10" value="5">
      </div>
    </div>

    <button type="submit" class="analyze-btn">📊 정밀 분석 실행</button>
  </form>

  <!-- 결과 섹션 -->
  <section id="resultSection" style="display:none">
    <div class="res-card">
      <h3 id="reportTitle" class="card-title">분석 리포트</h3>
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
      <div id="statusSummary" style="font-size:.95rem;color:#475569;font-weight:600;margin-top:10px;line-height:1.6"></div>
    </div>

    <!-- 회복 프로토콜 -->
    <div class="info-card">
      <h3 class="card-title">🩹 48시간 회복 전략</h3>

      <!-- 요약 포인트 -->
      <ul style="margin-bottom:12px;font-size:0.9rem;color:#0f172a;font-weight:600;line-height:1.5">
        <li>경기 직후 30분: 냉수 샤워/냉수욕으로 염증·근육통 완화에 도움</li>
        <li>1시간 이내: 탄수화물과 단백질을 함께 섭취해 에너지 회복 속도 유지</li>
        <li>6–8시간 이내: 가벼운 가동성·폼롤러 중심, 과한 스트레칭은 피하기</li>
        <li>48시간 동안: 수면·수분·다음 세션 강도 조절이 부상 예방의 핵심</li>
      </ul>

      <div class="pro-item">
        <div class="pro-time">🚨 즉시 (0-30분)</div>
        <div class="pro-content" id="recoveryImmediate"></div>
      </div>
      <div class="pro-item">
        <div class="pro-time">⏰ 1시간 후</div>
        <div class="pro-content" id="recovery1Hour"></div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🌙 저녁 (6-8시간)</div>
        <div class="pro-content" id="recoveryEvening"></div>
      </div>
      <div class="pro-item">
        <div class="pro-time">🛌 취침 전</div>
        <div class="pro-content" id="recoveryBedtime"></div>
      </div>

      <p style="margin-top:15px;font-size:0.78rem;color:#94a3b8;line-height:1.5">
        * 회복 시간대와 내용은 축구·풋살 선수들을 대상으로 한 회복 전략 연구들을 참고해, 실전에서 바로 적용할 수 있도록 단순화한 가이드입니다.
      </p>
    </div>

    <!-- 영양 & 파워젤 -->
    <div class="info-card" style="border-left:5px solid #10b981">
      <h3 class="card-title">🍎 영양 & 파워젤 전략</h3>

      <!-- 요약 포인트 -->
      <ul style="margin-bottom:12px;font-size:0.9rem;color:#0f172a;font-weight:600;line-height:1.5">
        <li>고강도 경기: 하루 탄수 8–10 g/kg, 단백질 약 2 g/kg 수준 권장</li>
        <li>중강도 경기: 탄수 5–7 g/kg, 단백질 1.5–2 g/kg 정도로 조절</li>
        <li>경기 후 첫 4시간: 매시간 탄수 중심으로 에너지(글리코겐) 회복 집중</li>
        <li>파워젤: 60분 이상 경기에서는 전·후반 시작 전으로 나누어 섭취</li>
      </ul>

      <div id="nutritionStrategy" class="nutrition-content"></div>

      <p style="margin-top:15px;font-size:0.78rem;color:#94a3b8;line-height:1.5">
        * 섭취량과 타이밍은 축구/단체 구기 종목 선수들을 대상으로 한 영양·회복 가이드의 권장 범위를 바탕으로, 아마추어 경기 상황에 맞게 조정한 값입니다.
      </p>
    </div>

    <!-- 히스토리 -->
    <div class="info-card">
      <h3 class="card-title">📋 최근 경기 기록</h3>
      <div id="historyList" class="history-empty">분석 후 기록이 표시됩니다</div>
      <button class="del-btn" type="button" onclick="clearAllHistory()">전체 기록 삭제</button>
    </div>

    <button class="share-btn" type="button" onclick="shareAnalysis()">📱 팀원에게 리포트 공유</button>
  </section>
</div>

<script>
/* 경기 시간 옵션 */
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

/* 통증 부위별 회복 프로토콜 */
const RECOVERY_DATA = {
  'none': {
    immediate: '🧊 찬물 샤워 10~15분(가능하면 무릎 아래를 중심으로)로 열감과 염증을 가볍게 줄여 주세요.',
    '1Hour': '🍽️ 탄수화물과 단백질이 함께 들어간 식사를 1시간 안에 섭취하면, 다음날 움직임 회복에 도움이 됩니다.',
    evening: '🧴 전신 폼롤러·가벼운 스트레칭으로 “뻐근함”만 풀고, 강한 통증이 오는 동작은 피하는 것이 좋습니다.',
    bedtime: '💤 최소 7~8시간 수면이 회복의 핵심입니다. 취침 2시간 전에는 과식·과음·카페인을 피해주세요.'
  },
  'calf': {
    immediate: '🧊 종아리 부위를 15~20분 정도 냉찜질하고, 다리를 심장보다 살짝 높여두면 부종과 뻐근함을 줄이는 데 도움이 됩니다.',
    '1Hour': '💊 마그네슘이 포함된 식품이나 보충제를 활용할 수 있지만, 수분·전해질을 충분히 채워주는 것이 더 중요합니다.',
    evening: '🧴 비복근·가자미근을 중심으로 폼롤러를 2~3세트(세트당 30~45초)로 굴려주고, 통증이 심한 지점은 무리하지 않습니다.',
    bedtime: '🛌 베개나 쿠션을 이용해 종아리가 심장보다 약간 높게 오도록 올려두면, 다음날 부종과 묵직함을 줄이는 데 도움이 됩니다.'
  },
  'knee': {
    immediate: '🧊 무릎 주변에 10~15분 정도 냉찜질을 하되, 관절을 깊게 구부리는 자세는 피하는 것이 좋습니다.',
    '1Hour': '🦵 쪼그려 앉기·계단을 빠르게 오르내리는 동작 등은 1~2일 정도 피하고, 통증이 없는 범위에서만 가볍게 걷습니다.',
    evening: '💊 관절 건강 보충제나 오메가3 등은 보조적인 역할입니다. 중요한 건 과한 점프·착지·방향 전환을 당분간 줄이는 것입니다.',
    bedtime: '🛌 무릎 아래에 작은 베개를 두고 편안한 각도로 쉬게 해주면 관절 주변 긴장을 낮추는 데 도움이 됩니다.'
  },
  'hamstring': {
    immediate: '🧊 허벅지 뒤쪽에 차가운 수건이나 아이스팩을 10~15분 정도 대고, 통증이 심하면 강한 신전 동작은 피합니다.',
    '1Hour': '🚶 통증 0~2 수준에서 가볍게 걷는 것은 괜찮지만, 전력 질주나 깊은 숙이는 동작은 48시간 정도 피하는 편이 안전합니다.',
    evening: '🧘 “쭉 찢는 스트레칭”은 오히려 재손상 위험을 높일 수 있어, 가벼운 범위에서만 움직임을 유지하는 쪽으로 접근합니다.',
    bedtime: '🍒 타르트 체리 주스처럼 항산화 성분이 포함된 음료는 도움 될 수 있지만, 필수는 아니며 기본 수면 확보가 우선입니다.'
  },
  'ankle': {
    immediate: '🧊 발목 주변에 냉찜질을 10~15분 적용하고, 붓기가 있다면 압박밴드나 테이핑으로 가볍게 지지해 줍니다.',
    '1Hour': '🩹 보행 시 불안정하게 느껴진다면, 보호대·테이핑 등으로 안정성을 확보한 후 움직이는 것이 좋습니다.',
    evening: '🦶 한 발로 서 있기, 균형 잡기 등 가벼운 균형 훈련은 발목의 감각을 회복하는 데 도움이 됩니다(통증 없는 범위 내에서).',
    bedtime: '🛌 베개나 쿠션 위에 발목을 올려 심장보다 약간 높게 두면, 부종과 답답함을 줄이는 데 효과적입니다.'
  },
  'groin': {
    immediate: '🧊 사타구니 안쪽에 냉찜질을 짧게 여러 번 적용하고, 다리를 크게 벌리는 동작은 당분간 피하는 것이 좋습니다.',
    '1Hour': '🚶 방향 전환·사이드 스텝·강한 킥 동작은 2~3일 정도 쉬어주고, 통증이 없는 범위의 가벼운 보행만 유지합니다.',
    evening: '🧘 고관절 가동성 운동은 통증이 거의 없을 때, 작은 범위에서부터 서서히 시작하는 것이 안전합니다.',
    bedtime: '🛌 내전근 스트레칭을 무리하게 하다가 통증이 더 심해지는 경우가 많으므로, 통증이 가라앉을 때까지는 휴식 위주로 가는 편이 좋습니다.'
  }
};

/* 부하 수준별 영양 텍스트 */
const NUTRITION_DATA = {
  high: '🔥 고강도 경기로 분류되는 세션입니다.\n- 하루 동안 탄수화물 8~10 g/kg, 단백질 약 2 g/kg 정도를 목표로 두는 것이 일반적인 권장 범위입니다.\n- 경기 직후 4시간 동안은 탄수화물 위주로 여러 번 나누어 섭취하면 에너지(글리코겐) 회복에 유리합니다.\n- 물·이온음료를 통해 땀으로 빠져나간 수분과 전해질을 충분히 채워주는 것이 중요합니다.',
  medium: '✅ 중강도 경기 수준입니다.\n- 하루 탄수화물 5~7 g/kg, 단백질 1.5~2 g/kg 정도를 기본 기준으로 생각할 수 있습니다.\n- 평소 식단에 약간의 탄수·단백질을 더해 주는 정도로도 회복에는 큰 문제가 없습니다.\n- 마그네슘·오메가3 등은 선택 사항이며, 기본 식사와 수분 섭취가 우선입니다.',
  low: '😌 상대적으로 부하가 낮은 경기입니다.\n- 평소 식사 패턴을 유지해도 회복에는 큰 무리가 없을 가능성이 높습니다.\n- 하루 총 수분 섭취를 체중(kg) × 30~35 ml 정도로 맞춰주는 것만으로도 충분히 도움이 됩니다.\n- 간단한 단백질 보충(우유·요거트·두부·달걀 등)으로 근육 회복을 도와줄 수 있습니다.'
};

function getGelTiming(duration) {
  if (duration <= 60) return '⚡ 약 60분 이내 경기라면, 킥오프 10분 전 1개 정도만 고려해도 충분한 편입니다.';
  if (duration <= 100) return '⚡ 60~100분 경기라면, 경기 시작 전 1개 + 후반 시작 전 1개처럼 두 번에 나누어 섭취하는 방식이 많이 사용됩니다.';
  return '⚡ 100분 이상 길게 뛰는 날에는 전반 중간~후반 시작~연장 전 등을 나누어 2~3회에 걸쳐 섭취하는 전략을 사용할 수 있습니다.';
}

/* 히스토리 저장 */
function saveMatchHistory(record) {
  try {
    const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    history.unshift(record);
    localStorage.setItem('matchHistory', JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.warn('History save failed', e);
  }
}

/* 히스토리 렌더링 */
function renderHistory() {
  const container = document.getElementById('historyList');
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  } catch (e) {
    history = [];
  }
  if (!history.length) {
    container.className = 'history-empty';
    container.innerHTML = '분석 후 기록이 표시됩니다';
    return;
  }
  container.className = '';
  container.innerHTML = history.map(r => `
    <div class="history-row" data-id="${r.id}">
      <div>
        <div>${r.date} · ${r.sport === 'futsal' ? '풋살' : '축구'}</div>
        <div class="history-meta">컨디션 ${r.conditionScore}/10 · 좌우 ${r.leftLoad}:${r.rightLoad}</div>
      </div>
      <div style="text-align:right">
        <div>${r.distance.toFixed(1)}km</div>
        <div class="history-meta" style="color:#ef4444">부하 ${r.totalLoad}</div>
      </div>
    </div>
  `).join('');
}

/* 전체 기록 삭제 */
function clearAllHistory() {
  if (!confirm('모든 기록을 삭제하시겠습니까?')) return;
  localStorage.removeItem('matchHistory');
  renderHistory();
}

/* 공유 */
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
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('📋 분석 결과가 클립보드에 복사되었습니다!\n카카오톡에 붙여넣기 하세요.');
    }).catch(() => {
      alert('공유 텍스트: ' + shareText);
    });
  } else {
    alert('공유 텍스트: ' + shareText);
  }
}

/* 컨디션·좌우를 반영한 위험도 분석 */
function analyzeDeepCondition(totalLoad, conditionScore, leftLoad, rightLoad, primaryPain) {
  let riskFactor = 0;
  let notes = [];

  if (conditionScore <= 4) {
    riskFactor += 15;
    notes.push('컨디션이 낮은 상태에서 경기해 피로가 더 많이 누적된 상황일 수 있습니다.');
  }

  const diff = Math.abs(leftLoad - rightLoad);
  if (diff >= 3) {
    riskFactor += 20;
    const dominant = leftLoad > rightLoad ? '왼발' : '오른발';
    notes.push(`${dominant}에 체감 부하가 크게 쏠려 있어, 한쪽으로 편향된 움직임이 누적되고 있을 가능성이 있습니다.`);
  }

  if (primaryPain === 'knee' && diff >= 3) {
    notes.push('무릎 통증과 좌우 밸런스 붕괴가 같이 나타나면, 반대쪽 골반·허리에까지 영향을 줄 수 있어 관리가 필요합니다.');
  }
  if (primaryPain === 'hamstring' && totalLoad > 700) {
    notes.push('햄스트링 통증이 있는 상태에서 높은 부하가 반복되면, 근육 손상 위험이 올라갈 수 있습니다.');
  }

  const riskScore = Math.min(100, Math.round(totalLoad / 10) + riskFactor);

  return {
    riskScore,
    diagnosis: notes.length
      ? notes.join(' ')
      : '밸런스와 컨디션 모두 양호한 편입니다. 기본 회복 루틴만 잘 지켜도 무리 없이 다음 경기 준비가 가능해 보입니다.'
  };
}

/* DOM 초기화 */
document.addEventListener('DOMContentLoaded', function() {
  const durationSelect = document.getElementById('durationSelect');
  const painGrid = document.getElementById('painGrid');

  function updateDurationOptions(sport) {
    const options = GAME_DURATIONS[sport] || GAME_DURATIONS.futsal;
    durationSelect.innerHTML = options.map(g => `<option value="${g.value}">${g.text}</option>`).join('');
  }
  updateDurationOptions('futsal');

  renderHistory();

  document.querySelectorAll('.sport-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sport-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      updateDurationOptions(this.dataset.sport);
    });
  });

  painGrid.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
      const label = e.target.closest('.pain-item');
      if (e.target.checked) label.classList.add('checked');
      else label.classList.remove('checked');

      if (e.target.value !== 'none' && e.target.checked) {
        const noneCb = painGrid.querySelector('input[value="none"]');
        if (noneCb) {
          noneCb.checked = false;
          noneCb.closest('.pain-item').classList.remove('checked');
        }
      }

      const anyChecked = painGrid.querySelectorAll('input[name="painArea"]:checked').length;
      if (!anyChecked) {
        const noneCb = painGrid.querySelector('input[value="none"]');
        noneCb.checked = true;
        noneCb.closest('.pain-item').classList.add('checked');
      }
    }
  });

  const condInput = document.getElementById('conditionScore');
  const leftInput = document.getElementById('leftLoad');
  const rightInput = document.getElementById('rightLoad');
  const condVal = document.getElementById('condValue');
  const leftVal = document.getElementById('leftValue');
  const rightVal = document.getElementById('rightValue');

  condInput.addEventListener('input', () => condVal.textContent = condInput.value);
  leftInput.addEventListener('input', () => leftVal.textContent = leftInput.value);
  rightInput.addEventListener('input', () => rightVal.textContent = rightInput.value);

  document.getElementById('analysisForm').addEventListener('submit', function(e) {
    e.preventDefault();
    try {
      const sport = document.querySelector('.sport-btn.active').dataset.sport;
      const distance = parseFloat(document.getElementById('distanceInput').value) || 0;
      const duration = parseInt(durationSelect.value, 10) || 60;
      const condScore = parseInt(condInput.value, 10) || 7;
      const left = parseInt(leftInput.value, 10) || 5;
      const right = parseInt(rightInput.value, 10) || 5;

      const painCheckboxes = document.querySelectorAll('input[name="painArea"]:checked');
      let painAreas = Array.from(painCheckboxes).map(cb => cb.value).filter(v => v !== 'none');
      const primaryPain = painAreas.length > 0 ? painAreas[0] : 'none';

      let loadMultiplier = 1.0;
      if (primaryPain === 'knee') loadMultiplier = 1.5;
      else if (primaryPain === 'hamstring' || primaryPain === 'groin') loadMultiplier = 1.4;
      else if (primaryPain === 'calf' || primaryPain === 'ankle') loadMultiplier = 1.3;

      let totalLoad = Math.round(distance * duration * loadMultiplier / 7.5);

      if (condScore <= 4) {
        totalLoad = Math.round(totalLoad * 1.15);
      }

      const readiness = Math.max(30, 100 - Math.round(totalLoad / 6));
      const deep = analyzeDeepCondition(totalLoad, condScore, left, right, primaryPain);

      document.getElementById('distanceResult').textContent = distance.toFixed(1) + 'km';
      document.getElementById('loadResult').textContent = totalLoad;
      document.getElementById('readinessResult').textContent = readiness + '%';
      document.getElementById('reportTitle').textContent =
        (sport === 'futsal' ? '🏠 풋살' : '🌳 축구') + ' 분석 리포트';

      const loadIncrease = Math.round((loadMultiplier - 1) * 100);
      document.getElementById('statusSummary').innerHTML = `
        <strong>상태 리포트:</strong> 
        ${primaryPain === 'none' ? '특별한 통증 보고 없음' : `주요 통증 부위: <strong>${primaryPain}</strong>`} | 
        부하 <strong>${loadIncrease}%</strong> 증가<br>
        위험도 추정: <strong>${deep.riskScore}/100</strong><br>
        <span style="color:${readiness < 70 ? '#ef4444' : '#10b981'}">
          ${readiness < 70 ? '⚠️ 과부하 가능성이 있어 회복을 우선하는 것이 좋습니다.' : '✅ 현재로서는 다음 경기 준비가 가능한 범위로 보입니다.'}
        </span><br>
        <span>${deep.diagnosis}</span>
      `;

      const recoveryPlan = RECOVERY_DATA[primaryPain] || RECOVERY_DATA.none;
      document.getElementById('recoveryImmediate').textContent = recoveryPlan.immediate;
      document.getElementById('recovery1Hour').textContent = recoveryPlan['1Hour'];
      document.getElementById('recoveryEvening').textContent = recoveryPlan.evening;
      document.getElementById('recoveryBedtime').textContent = recoveryPlan.bedtime;

      const nutritionLevel = totalLoad >= 700 ? 'high' : totalLoad >= 500 ? 'medium' : 'low';
      const nutritionText = NUTRITION_DATA[nutritionLevel];
      const gelText = getGelTiming(duration);
      document.getElementById('nutritionStrategy').innerHTML = `
        <div style="margin-bottom:15px;">${nutritionText}</div>
        <div style="background:#f0fdf4;padding:15px;border-radius:12px;border-left:4px solid #10b981;">
          <strong>${gelText}</strong>
        </div>
      `;

      const record = {
        id: Date.now(),
        date: new Date().toLocaleDateString('ko-KR'),
        sport,
        distance,
        duration,
        primaryPain,
        totalLoad,
        readiness,
        conditionScore: condScore,
        leftLoad: left,
        rightLoad: right
      };
      saveMatchHistory(record);
      renderHistory();

      document.getElementById('resultSection').style.display = 'block';
      document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('분석 오류:', err);
      alert('분석 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    }
  });

  document.getElementById('historyList').addEventListener('click', (e) => {
    const row = e.target.closest('.history-row');
    if (!row) return;

    const id = Number(row.dataset.id);
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    } catch (e) {
      return;
    }
    const r = history.find(x => x.id === id);
    if (!r) return;

    document.getElementById('distanceInput').value = r.distance;
    document.getElementById('conditionScore').value = r.conditionScore;
    document.getElementById('leftLoad').value = r.leftLoad;
    document.getElementById('rightLoad').value = r.rightLoad;
    document.getElementById('condValue').textContent = r.conditionScore;
    document.getElementById('leftValue').textContent = r.leftLoad;
    document.getElementById('rightValue').textContent = r.rightLoad;

    document.querySelectorAll('.sport-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.sport === r.sport);
    });
    updateDurationOptions(r.sport);
    durationSelect.value = r.duration;

    painGrid.querySelectorAll('input[name="painArea"]').forEach(cb => {
      cb.checked = false;
      cb.closest('.pain-item').classList.remove('checked');
    });
    if (r.primaryPain === 'none') {
      const noneCb = painGrid.querySelector('input[value="none"]');
      noneCb.checked = true;
      noneCb.closest('.pain-item').classList.add('checked');
    } else {
      const targetCb = painGrid.querySelector(`input[value="${r.primaryPain}"]`);
      if (targetCb) {
        targetCb.checked = true;
        targetCb.closest('.pain-item').classList.add('checked');
      }
    }

    document.getElementById('distanceResult').textContent = r.distance.toFixed(1) + 'km';
    document.getElementById('loadResult').textContent = r.totalLoad;
    document.getElementById('readinessResult').textContent = r.readiness + '%';
    document.getElementById('reportTitle').textContent =
      (r.sport === 'futsal' ? '🏠 풋살' : '🌳 축구') + ' 분석 리포트 (기록 불러오기)';

    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
  });
});
</script>
</body>
</html>
