const SPORT_DATA = {
  futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 },
  football: { avg: 10.5, pro: 12.0, calPerKm: 110 }
};

// 🔴 부위별 위험도 가중치
const PAIN_WEIGHTS = {
  calf: 2.5, hamstring: 2.5, groin: 2.5,
  knee: 1.8, ankle: 1.8,
  shin: 1.2, back: 1.2, shoulder: 1.2, foot: 1.2
};

// ⚽ 경기 주의사항
const PLAY_ATTENTION = {
  calf: "🚨 종아리: 급제동/스프린트 70%↓, 착지 부드럽게",
  hamstring: "⚠️ 햄스트링: 최대스피드 80%, 킥 전 스트레칭",
  knee: "🟡 무릎: 사이드컷 50%↓, 착지 무릎 90도",
  ankle: "🔄 발목: 방향전환 몸통중심, 테이핑 필수",
  shin: "👟 정강이: 쿠션깔창, 강한 태클 주의",
  groin: "🧘 사타구니: 레그오픈 70% 제한",
  back: "📐 허리: 몸통회전 80%, 점프 무릎먼저",
  shoulder: "💪 어깨: 오버헤드 70%, 몸통 보호",
  foot: "🦶 발바닥: 하드 서페이스 주의"
};

const RECOVERY_PLANS = {
  none: { now: '🧊 RICE 20분', s1: '🍽️ 탄수+단백', s2: '🧴 폼롤러 10분', s3: '💊 마그네슘+수면8시간', prep: '🚶 동적 스트레칭 5분' },
  calf: { now: '🧊 종아리 RICE 25분↑', s1: '💊 마그네슘400mg', s2: '🧴 폼롤러 3x30초', s3: '🛌 수면8.5시간', prep: '⤵ 앵클펌프' },
  hamstring: { now: '🧊 햄스트링 RICE 20분', s1: '🧘 스트레칭 3세트', s2: '🍒 체리주스', s3: '🛌 수면8시간', prep: '🏃 슬로우조깅' }
};

const NUTRITION_GUIDE = {
  high: '🚨 고강도: 탄수8g/kg+BCAA5g', medium: '✅ 중강도: 단백2g/kg', low: '😌 마그네슘400mg+물3L'
};

function calculateLoadWithPain(baseLoad, pains) {
  if (!pains.length) return { load: baseLoad, warning: '' };
  let multiplier = 1, highRisk = 0;
  pains.forEach(pain => {
    const weight = PAIN_WEIGHTS[pain] || 1.2;
    multiplier += weight / 10;
    if (weight >= 2.0) highRisk++;
  });
  const load = Math.round(baseLoad * multiplier);
  let warning = '';
  if (highRisk >= 2) warning = '🚨 다중 고위험 - 48시간 휴식';
  else if (highRisk === 1) warning = '⚠️ 고위험 부위 집중 회복';
  return { load, warning };
}

function showPlayAttention(pains) {
  if (!pains.length) return '';
  const mainPain = pains[0];
  const attention = PLAY_ATTENTION[mainPain] || PLAY_ATTENTION.calf;
  if (pains.length >= 3) {
    return `<div style="background:#fef3c7;padding:1rem;margin:1rem 0;border-left:4px solid #f59e0b;border-radius:8px;">
      <strong>🚨 다중 통증 경고</strong><br>${attention}<br><small>⚽ 전체 강도 70% 권장</small>
    </div>`;
  }
  return `<div style="background:#dbeafe;padding:.75rem;margin:.5rem 0;border-left:4px solid #3b82f6;border-radius:8px;">
    <strong>⚠️ 다음 경기 주의</strong><br>${attention}</div>`;
}

function init() {
  document.querySelectorAll('.watch-btn').forEach(b => b.addEventListener('click', onWatchClick));
  document.querySelectorAll('.sport-btn').forEach(b => b.addEventListener('click', onSportClick));
  const rpe = document.getElementById('rpe');
  if (rpe) rpe.addEventListener('input', () => document.getElementById('rpe-value').textContent = rpe.value);
  document.getElementById('match-form').addEventListener('submit', onSubmit);
  document.getElementById('clear-history')?.addEventListener('click', () => localStorage.removeItem('matchHistory'));
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
  const hasWatch = document.querySelector('.watch-btn.active').dataset.watch === 'yes';
  const sportKey = document.querySelector('.sport-btn.active').dataset.sport;
  const duration = parseInt(document.getElementById('duration').value, 10);
  const pains = Array.from(document.querySelectorAll('input[name="pain"]:checked')).map(cb => cb.value).filter(v => v !== 'none');
  
  const sport = SPORT_DATA[sportKey];
  let distance, rpe;
  if (hasWatch) {
    distance = parseFloat(document.getElementById('distance').value || sport.avg);
    rpe = Math.min(10, Math.max(2, (distance / sport.avg) * 6));
  } else {
    rpe = parseInt(document.getElementById('rpe').value || '6', 10);
    distance = +(sport.avg * (rpe / 6)).toFixed(1);
  }
  
  const baseLoad = Math.round(duration * rpe);
  const painResult = calculateLoadWithPain(baseLoad, pains);
  const load = painResult.load;
  
  // 통증 반영 등급
  const effectiveDistance = distance * (1 + (pains.length * 0.15));
  let rank = effectiveDistance < sport.avg * 0.8 ? '하위 40%' :
             effectiveDistance < sport.avg * 1.1 ? '중위 50%' :
             effectiveDistance < sport.pro ? '상위 25%' : '프로급 TOP 10%';
  
  const calories = Math.round(distance * sport.calPerKm);
  const intensity = load >= 700 ? 'high' : load >= 500 ? 'medium' : 'low';
  
  // 결과 표시
  document.getElementById('sport-badge').textContent = sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
  document.getElementById('distance-highlight').innerHTML = `${distance.toFixed(1)}km <span style="color:#ef4444">+${pains.length}부위</span> (${rank})`;
  document.getElementById('perf-rank').innerHTML = `${rank}<br><small>${painResult.warning}</small>`;
  document.getElementById('calories').textContent = calories;
  document.getElementById('load-score').textContent = load;
  document.getElementById('benchmark-note').innerHTML = `기준: ${sport.avg.toFixed(1)}km(평균) ~ ${sport.pro.toFixed(1)}km(프로)`;
  
  // 경기 주의사항
  document.getElementById('attention-section').innerHTML = showPlayAttention(pains);
  
  // 회복 플랜
  const mainPain = pains[0] || 'none';
  const plan = RECOVERY_PLANS[mainPain] || RECOVERY_PLANS.none;
  document.getElementById('now-action').textContent = plan.now;
  document.getElementById('step1-action').textContent = plan.s1;
  document.getElementById('step2-action').textContent = plan.s2;
  document.getElementById('step3-action').textContent = plan.s3;
  document.getElementById('prep-action').textContent = plan.prep;
  
  document.getElementById('nutrition-guide').textContent = NUTRITION_GUIDE[intensity];
  const readiness = Math.max(60, 100 - (load / 10));
  document.getElementById('readiness-score').textContent = `${readiness}%`;
  document.getElementById('readiness-tips').innerHTML = `${readiness >= 85 ? '✅ 최상' : readiness >= 70 ? '✅ 양호' : '⚠️ 주의'} - ${load >= 700 ? '고강도 회복' : '보통 회복'}`;
  
  saveHistory({ date: new Date().toLocaleDateString(), distance: distance.toFixed(1), rank, load, pains: pains.length });
  showHistory();
  QRCode.toCanvas(document.getElementById('qr-container'), window.location.href, { width: 150 });
  
  document.getElementById('result').style.display = 'block';
  document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

function saveHistory(data) {
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  history.unshift(data);
  localStorage.setItem('matchHistory', JSON.stringify(history.slice(0, 10)));
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const list = document.getElementById('history-list');
  if (history.length) {
    list.innerHTML = history.map(h => 
      `<div class="history-item">
        <span>${h.date}</span>
        <span>${h.distance}km ${h.pains ? `+${h.pains}부위` : ''}</span>
        <span>${h.rank} ${h.load}</span>
      </div>`
    ).join('');
    document.getElementById('clear-history').style.display = 'inline-block';
  }
}

function shareResult() {
  const text = `⚽ 경기 분석\n거리: ${document.getElementById('distance-highlight').textContent}\n등급: ${document.getElementById('perf-rank').textContent}\n회복 플랜 👇\n${window.location.href}`;
  if (navigator.share) {
    navigator.share({ title: '풋살 분석', text, url: window.location.href });
  } else {
    navigator.clipboard.writeText(text);
    alert('클립보드 복사!');
  }
}

document.addEventListener('DOMContentLoaded', init);
showHistory();
