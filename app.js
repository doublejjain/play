const SPORT_DATA = {
  futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 },
  football: { avg: 10.5, pro: 12.0, calPerKm: 110 }
};

const PAIN_WEIGHTS = {
  none: { load: 1.0, recovery: 1.0 },
  calf: { load: 1.4, recovery: 0.6 },
  shin: { load: 1.3, recovery: 0.7 },
  hamstring: { load: 1.5, recovery: 0.5 },
  knee: { load: 1.6, recovery: 0.4 },
  ankle: { load: 1.2, recovery: 0.8 },
  groin: { load: 1.3, recovery: 0.7 },
  shoulder: { load: 1.1, recovery: 0.9 },
  back: { load: 1.2, recovery: 0.8 },
  foot: { load: 1.3, recovery: 0.7 }
};

const RECOVERY_PLANS_PRIORITY = ['hamstring', 'knee', 'calf', 'shin', 'ankle', 'groin', 'foot', 'back', 'shoulder', 'none'];

const RECOVERY_PLANS = {
  none: { 
    now: '🧊 RICE(휴식+얼음+압박+거상) 20분', 
    s1: '🍽️ 탄수+단백 1:4 (바나나+우유)', 
    s2: '🧴 폼롤러 10분', 
    s3: '💊 마그네슘 400mg+수면8시간', 
    prep: '🚶 동적 스트레칭 5분' 
  },
  calf: { 
    now: '🧊 종아리 RICE 25분(다리↑)', 
    s1: '💊 마그네슘400mg+체리주스', 
    s2: '🧴 폼롤러(3x30초)', 
    s3: '🛌 수면8.5시간+다리높이', 
    prep: '⤵ 앵클펌프3분' 
  },
  shin: { 
    now: '🧊 정강이 얼음 20분', 
    s1: '🩹 테이핑준비', 
    s2: '🥛 칼슘1000mg+D2000IU', 
    s3: '🦶 발목스트레칭', 
    prep: '👟 쿠션깔창' 
  },
  hamstring: { 
    now: '🧊 햄스트링 RICE 20분', 
    s1: '🧘 햄스트링 스트레칭3세트', 
    s2: '🍒 체리주스200ml', 
    s3: '🛌 수면8시간', 
    prep: '🏃 슬로우조깅5분' 
  },
  knee: { 
    now: '🧊 무릎 RICE 25분', 
    s1: '🦵 보호대착용', 
    s2: '💊 글루코사민1500mg', 
    s3: '🛌 수면', 
    prep: '🚲 자전거5분' 
  },
  ankle: { 
    now: '🧊 발목 RICE+압박', 
    s1: '🩹 테이핑연습', 
    s2: '🦶 밸런스3세트', 
    s3: '🛌 수면', 
    prep: '🧘 발목돌리기2분' 
  }
};

const PAIN_NAMES = {
  calf: '종아리', shin: '정강이', hamstring: '햄스트링', 
  knee: '무릎', ankle: '발목', groin: '사타구니',
  shoulder: '어깨', back: '허리', foot: '발바닥'
};

const NUTRITION_CALCULATOR = {
  high: (load, painCount) => `🔥 고강도 ${load}점\n• 탄수화물 ${Math.round(7 + load / 200)}g/kg\n• BCAA 8g + 체리주스300ml\n• 마그네슘 500mg`,
  medium: (load, painCount) => `⚡ 중강도 ${load}점\n• 단백질 2.2g/kg\n• 체리주스200ml\n• 마그네슘 400mg`,
  low: (load, painCount) => `😌 보통 ${load}점\n• 단백질 1.8g/kg\n• 물 3.5L\n• 수면 8.5시간`
};

function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  };
  return new Date(date).toLocaleDateString('ko-KR', options);
}

function calculateWeightedPain(pains) {
  if (pains.length === 0) return { weight: 1.0, recoveryFactor: 1.0, primary: 'none', count: 0, secondary: [] };
  
  const sortedPains = pains.sort((a, b) => RECOVERY_PLANS_PRIORITY.indexOf(a) - RECOVERY_PLANS_PRIORITY.indexOf(b));
  const primary = sortedPains[0];
  
  let totalLoad = 1.0, totalRecovery = 1.0;
  sortedPains.forEach(pain => {
    totalLoad *= PAIN_WEIGHTS[pain]?.load || 1.1;
    totalRecovery *= PAIN_WEIGHTS[pain]?.recovery || 0.9;
  });
  
  return {
    weight: totalLoad,
    recoveryFactor: totalRecovery,
    primary: primary,
    count: sortedPains.length,
    secondary: sortedPains.slice(1)
  };
}

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('prematch')) {
    document.getElementById('page-title').textContent = '⚽ 경기 전 체크';
    document.getElementById('subtitle').textContent = '30초만에 준비도 확인';
  }
  
  document.querySelectorAll('.watch-btn')?.forEach(b => b.addEventListener('click', onWatchClick));
  document.querySelectorAll('.sport-btn')?.forEach(b => b.addEventListener('click', onSportClick));
  
  const rpe = document.getElementById('rpe');
  if (rpe) rpe.addEventListener('input', () => {
    document.getElementById('rpe-value').textContent = rpe.value;
  });
  
  const form = document.getElementById('match-form');
  if (form) form.addEventListener('submit', onSubmit);
  
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) clearBtn.addEventListener('click', clearHistory);
  
  showHistory();
}

function onWatchClick(e) {
  document.querySelectorAll('.watch-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  const hasWatch = e.target.dataset.watch === 'yes';
  document.getElementById('distance-group').style.display = hasWatch ? 'block' : 'none';
  document.getElementById('rpe-group').style.display = hasWatch ? 'none' : 'block';
}

function onSportClick(e) {
  document.querySelectorAll('.sport-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
}

function onSubmit(e) {
  e.preventDefault();
  
  try {
    const hasWatch = document.querySelector('.watch-btn.active').dataset.watch === 'yes';
    const sportKey = document.querySelector('.sport-btn.active').dataset.sport;
    const duration = parseInt(document.getElementById('duration').value, 10);
    const pains = Array.from(document.querySelectorAll('input[name="pain"]:checked'))
      .map(cb => cb.value).filter(v => v !== 'none');
    
    const sport = SPORT_DATA[sportKey];
    let baseDistance, baseRPE, baseLoad;
    
    if (hasWatch) {
      baseDistance = parseFloat(document.getElementById('distance').value || sport.avg);
      baseRPE = Math.min(10, Math.max(2, (baseDistance / sport.avg) * 6));
      baseLoad = Math.round(duration * baseRPE);
    } else {
      baseRPE = parseInt(document.getElementById('rpe').value || '6', 10);
      baseLoad = Math.round(duration * baseRPE);
      baseDistance = +(sport.avg * (baseRPE / 6)).toFixed(1);
    }
    
    const painAnalysis = calculateWeightedPain(pains);
    const finalLoad = Math.round(baseLoad * painAnalysis.weight);
    const finalRecovery = Math.round(100 * painAnalysis.recoveryFactor);
    
    let rank;
    const adjustedDistance = baseDistance * painAnalysis.recoveryFactor;
    if (adjustedDistance < sport.avg * 0.8) rank = '하위 40%';
    else if (adjustedDistance < sport.avg * 1.1) rank = '중위 50%';
    else if (adjustedDistance < sport.pro) rank = '상위 25%';
    else rank = '프로급 TOP 10%';
    
    const calories = Math.round(baseDistance * sport.calPerKm * painAnalysis.weight);
    const intensity = finalLoad >= 700 ? 'high' : finalLoad >= 500 ? 'medium' : 'low';
    
    updateUI(sportKey, baseDistance, rank, calories, finalLoad, sport, intensity, painAnalysis);
    
    saveHistory({
      date: Date.now(),
      distance: baseDistance.toFixed(1),
      pains: painAnalysis.primary + (painAnalysis.count > 1 ? `+${painAnalysis.count - 1}` : ''),
      rank,
      load: finalLoad,
      readiness: finalRecovery
    });
    
    showHistory();
    if (typeof QRCode !== 'undefined') {
      QRCode.toCanvas(document.getElementById('qr-container'), window.location.href, { width: 150 });
    }
    
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('분석 에러:', error);
    alert('분석 중 오류 발생! 페이지를 새로고침해주세요.');
  }
}

function updateUI(sportKey, baseDistance, rank, calories, finalLoad, sport, intensity, painAnalysis) {
  document.getElementById('sport-badge').textContent = sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
  document.getElementById('distance-highlight').textContent = `${baseDistance.toFixed(1)}km (${rank})`;
  document.getElementById('perf-rank').textContent = rank;
  document.getElementById('calories').textContent = calories.toLocaleString();
  document.getElementById('load-score').textContent = `${finalLoad} (${painAnalysis.count ? painAnalysis.count + '부위' : '정상'})`;
  
  document.getElementById('benchmark-note').innerHTML = 
    `기준: ${sport.avg.toFixed(1)}km(평균) ~ ${sport.pro.toFixed(1)}km(프로)<br>` +
    `<small>${painAnalysis.primary ? PAIN_NAMES[painAnalysis.primary] || painAnalysis.primary : '정상'} ${painAnalysis.secondary.length ? `+${painAnalysis.secondary.length}` : ''} → 부하 ${Math.round(painAnalysis.weight * 100)}%↑</small>`;
  
  const plan = RECOVERY_PLANS[painAnalysis.primary] || RECOVERY_PLANS.none;
  ['now', 'step1', 'step2', 'step3', 'prep'].forEach(key => {
    const el = document.getElementById(`${key}-action`);
    if (el) el.innerHTML = plan[key] + (key === 'now' ? `<br><small>${painAnalysis.secondary.map(p => PAIN_NAMES[p] || p).join(', ') || '없음'}</small>` : '');
  });
  
  document.getElementById('nutrition-guide').innerHTML = NUTRITION_CALCULATOR[intensity](finalLoad, painAnalysis.count);
  
  const readiness = Math.max(60, Math.round(painAnalysis.recoveryFactor * 100));
  document.getElementById('readiness-score').textContent = `${readiness}%`;
  document.getElementById('readiness-tips').innerHTML = 
    `${readiness >= 85 ? '✅ 최상' : readiness >= 70 ? '✅ 양호' : '⚠️ 주의'} ` +
    `- ${painAnalysis.count > 1 ? `${painAnalysis.count}부위 복합` : painAnalysis.primary ? PAIN_NAMES[painAnalysis.primary] : '정상'} ` +
    `회복 ${readiness}% 예상`;
}

function clearHistory() {
  localStorage.removeItem('matchHistory');
  showHistory();
}

function saveHistory(data) {
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  history.unshift(data);
  localStorage.setItem('matchHistory', JSON.stringify(history.slice(0, 10)));
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const list = document.getElementById('history-list');
  if (!list) return;
  
  if (history.length) {
    list.innerHTML = history.map(h => `
      <div class="history-item">
        <span>${formatDate(h.date)}</span>
        <span>${h.distance}km ${h.pains}</span>
        <span>${h.rank} ${h.load}</span>
      </div>
    `).join('');
    document.getElementById('clear-history').style.display = 'block';
  } else {
    list.innerHTML = '📭 분석 기록이 없습니다';
    document.getElementById('clear-history').style.display = 'none';
  }
}

function shareResult() {
  const distanceEl = document.getElementById('distance-highlight');
  const rankEl = document.getElementById('perf-rank');
  const text = `⚽ 오늘 경기 분석 완료!\n거리: ${distanceEl.textContent}\n등급: ${rankEl.textContent}\n회복 플랜 👇\n${window.location.href}`;
  
  if (navigator.share) {
    navigator.share({ title: '풋살/축구 컨디션 분석', text, url: window.location.href });
  } else {
    navigator.clipboard.writeText(text).then(() => alert('📋 카톡에 붙여넣기 복사됨!'));
  }
}

document.addEventListener('DOMContentLoaded', init);
