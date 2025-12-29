const SPORT_DATA = {
  futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 },
  football: { avg: 10.5, pro: 12.0, calPerKm: 110 }
};

const RECOVERY_PLANS = {
  none: {
    now: '🧊 RICE(휴식+얼음+압박+거상) 20분',
    s1: '🍽️ 탄수화물 1.2g/kg + 단백질 25g (바나나+우유)',
    s2: '🧴 전신 폼롤러 10분',
    s3: '💊 마그네슘 400mg + 수면 8시간',
    prep: '🚶 동적 스트레칭 5분'
  },
  calf: {
    now: '🧊 종아리 RICE 25분 (발목 15도 상향)',
    s1: '💊 마그네슘 400mg + 체리주스 200ml',
    s2: '🧴 종아리 폼롤러 (3세트×30초)',
    s3: '🛌 수면 8.5시간 + 다리 높게',
    prep: '⤵ 앵클 펌프 3분'
  },
  shin: {
    now: '🧊 정강이 얼음찜질 20분',
    s1: '🩹 정강이 테이핑 준비',
    s2: '🥛 칼슘 1000mg + 비타민D 2000IU',
    s3: '🦶 발목/종아리 스트레칭',
    prep: '👟 쿠션 깔창 착용'
  }
};

const NUTRITION_GUIDE = {
  high: '🚨 고강도: 탄수화물 8g/kg/일 + BCAA 5g',
  medium: '✅ 중강도: 단백질 2g/kg + 체리주스 200ml',
  low: '😌 보통: 마그네슘 400mg + 물 3L'
};

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('prematch')) {
    document.getElementById('page-title').textContent = '⚽ 경기 전 컨디션 체크';
    document.getElementById('subtitle').textContent = '30초만에 준비도 확인';
  }

  document.querySelectorAll('.watch-btn').forEach(b => b.addEventListener('click', onWatchClick));
  document.querySelectorAll('.sport-btn').forEach(b => b.addEventListener('click', onSportClick));
  
  const rpe = document.getElementById('rpe');
  if (rpe) rpe.addEventListener('input', () => document.getElementById('rpe-value').textContent = rpe.value);
  
  document.getElementById('match-form').addEventListener('submit', onSubmit);
  document.getElementById('clear-history')?.addEventListener('click', () => localStorage.removeItem('matchHistory'));
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
  let distance, rpe, load;
  
  if (hasWatch) {
    distance = parseFloat(document.getElementById('distance').value || sport.avg);
    rpe = Math.min(10, Math.max(2, (distance / sport.avg) * 6));
    load = Math.round(duration * rpe);
  } else {
    rpe = parseInt(document.getElementById('rpe').value || '6', 10);
    load = Math.round(duration * rpe);
    distance = +(sport.avg * (rpe / 6)).toFixed(1);
  }

  let rank;
  if (distance < sport.avg * 0.8) rank = '하위 40%';
  else if (distance < sport.avg * 1.1) rank = '중위 50%';
  else if (distance < sport.pro) rank = '상위 25%';
  else rank = '프로급 TOP 10%';

  const calories = Math.round(distance * sport.calPerKm);
  const intensity = load >= 700 ? 'high' : load >= 500 ? 'medium' : 'low';

  // 결과 표시
  document.getElementById('sport-badge').textContent = sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
  document.getElementById('distance-highlight').textContent = `${distance.toFixed(1)}km (${rank})`;
  document.getElementById('perf-rank').textContent = rank;
  document.getElementById('calories').textContent = calories;
  document.getElementById('load-score').textContent = load;

  document.getElementById('benchmark-note').innerHTML = `
    ${rank.includes('프로급') ? '🏆' : '📈'} 기준: ${sport.avg.toFixed(1)}km(평균) ~ ${sport.pro.toFixed(1)}km(프로) [web:698]
  `;

  const mainPain = pains[0] || 'none';
  const plan = RECOVERY_PLANS[mainPain] || RECOVERY_PLANS.none;
  document.getElementById('now-action').textContent = plan.now;
  document.getElementById('step1-action').textContent = plan.s1;
  document.getElementById('step2-action').textContent = plan.s2;
  document.getElementById('step3-action').textContent = plan.s3;
  document.getElementById('prep-action').textContent = plan.prep;

  document.getElementById('nutrition-guide').innerHTML = NUTRITION_GUIDE[intensity];
  
  const readiness = Math.max(60, 100 - (load / 10));
  document.getElementById('readiness-score').textContent = `${readiness}%`;
  document.getElementById('readiness-tips').innerHTML = `
    <div style="padding:.5rem;background:#f0f9ff;border-radius:8px;margin-top:.5rem;font-size:.9rem;">
      ${readiness >= 85 ? '✅ 최상' : readiness >= 70 ? '✅ 양호' : '⚠️ 주의'} - ${load >= 700 ? '고강도 회복 집중' : '보통 회복'} 필요
    </div>
  `;

  // 히스토리 저장 & 표시
  saveHistory({ date: new Date().toLocaleDateString(), distance: distance.toFixed(1), rank, load });
  showHistory();

  // QR 코드 생성
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
    list.innerHTML = history.map(h => `
      <div class="history-item">
        <span>${h.date}</span>
        <span>${h.distance}km ${h.rank}</span>
        <span>${h.load}</span>
      </div>
    `).join('');
    document.getElementById('clear-history').style.display = 'inline-block';
  }
}

function shareResult() {
  const text = `⚽ 오늘 경기 분석 완료!\n거리: ${document.getElementById('distance-highlight').textContent}\n등급: ${document.getElementById('perf-rank').textContent}\n회복 플랜 확인 👇\n${window.location.href}`;
  if (navigator.share) {
    navigator.share({ title: '풋살 컨디션 분석', text, url: window.location.href });
  } else {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사됐습니다!');
  }
}

document.addEventListener('DOMContentLoaded', init);
showHistory();
