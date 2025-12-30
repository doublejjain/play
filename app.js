const SPORT_DATA = { futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 }, football: { avg: 10.5, pro: 12.0, calPerKm: 110 } };
const PAIN_MULTIPLIERS = { calf: 1.3, shin: 1.25, hamstring: 1.45, knee: 1.5, ankle: 1.35, groin: 1.25, none: 1.0 };
const DURATION_OPTIONS = {
  futsal: [ { label: "15분 x 4쿼터 (60분)", value: 60 }, { label: "15분 x 6쿼터 (90분)", value: 90 }, { label: "20분 x 6쿼터 (120분)", value: 120 } ],
  football: [ { label: "45분 x 2쿼터 (90분)", value: 90 }, { label: "25분 x 4쿼터 (100분)", value: 100 }, { label: "25분 x 6쿼터 (150분)", value: 150 } ]
};

function updateDuration(sport) {
  const sel = document.getElementById('duration');
  sel.innerHTML = DURATION_OPTIONS[sport].map(o => `<option value="${o.value}">${o.label}</option>`).join('');
}

function showHistory() {
  const h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const l = document.getElementById('history-list');
  const b = document.getElementById('clear-history');
  
  if (h.length > 0) {
    l.innerHTML = h.map(i => `<div style="display:flex;justify-content:space-between;padding:0.7rem 0;border-bottom:1px solid #f1f5f9;"><b>${i.date}</b><span>${i.distance}km</span><span style="color:#ef4444">부하 ${i.load}</span></div>`).join('');
    b.style.display = 'block';
  } else {
    l.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#94a3b8">기록된 데이터가 없습니다.</div>';
    b.style.display = 'none';
  }
}

function init() {
  document.querySelectorAll('.watch-btn').forEach(b => b.addEventListener('click', e => {
    document.querySelectorAll('.watch-btn').forEach(x => x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const isWatch = e.currentTarget.dataset.watch === 'yes';
    document.getElementById('distance-group').style.display = isWatch ? 'block' : 'none';
    document.getElementById('rpe-group').style.display = isWatch ? 'none' : 'block';
  }));

  document.querySelectorAll('.sport-btn').forEach(b => b.addEventListener('click', e => {
    document.querySelectorAll('.sport-btn').forEach(x => x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    updateDuration(e.currentTarget.dataset.sport);
  }));

  document.getElementById('clear-history').addEventListener('click', () => {
    if(confirm('모든 기록을 삭제할까요?')) {
      localStorage.removeItem('matchHistory');
      showHistory(); // 즉시 갱신
    }
  });

  document.getElementById('match-form').addEventListener('submit', onSubmit);
  updateDuration('futsal');
  showHistory();
}

function onSubmit(e) {
  e.preventDefault();
  const watchBtn = document.querySelector('.watch-btn.active');
  const sportBtn = document.querySelector('.sport-btn.active');
  const sportKey = sportBtn.dataset.sport;
  const sport = SPORT_DATA[sportKey];
  
  // 🚨 NaN 방지 로직
  const duration = parseInt(document.getElementById('duration').value || "60", 10);
  let pains = Array.from(document.querySelectorAll('input[name="pain"]:checked')).map(cb => cb.value);
  let mult = 1.0; 
  pains.forEach(p => { if(p !== 'none') mult *= (PAIN_MULTIPLIERS[p] || 1.15); });

  let dist, rpe, load;
  if (watchBtn.dataset.watch === 'yes') {
    dist = parseFloat(document.getElementById('distance').value || "3.8");
    rpe = Math.min(10, Math.max(2, (dist / sport.avg) * 6));
  } else {
    rpe = parseInt(document.getElementById('rpe').value || "7", 10);
    dist = +(sport.avg * (rpe / 6)).toFixed(1);
  }
  
  // 최종 부하 계산 (NaN 절대 방지)
  load = Math.round(duration * rpe * mult);
  if (isNaN(load)) load = 0; 

  // UI 업데이트
  document.getElementById('load-score').textContent = load;
  document.getElementById('distance-highlight').textContent = `${dist}km (${pains.length > 0 && !pains.includes('none') ? `+${Math.round((mult-1)*100)}% 부하` : '정상'})`;
  document.getElementById('readiness-score').textContent = `${Math.max(30, 100 - Math.round(load/12))}%`;
  
  // 데이터 저장 및 히스토리 갱신
  const historyData = { date: new Date().toLocaleDateString(), distance: dist, load: load };
  let h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  h.unshift(historyData);
  localStorage.setItem('matchHistory', JSON.stringify(h.slice(0, 10)));
  
  showHistory();
  document.getElementById('result').style.display = 'block';
  document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', init);
