const SPORT_DATA = { futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 }, football: { avg: 10.5, pro: 12.0, calPerKm: 110 } };
const PAIN_MULTIPLIERS = { calf: 1.3, shin: 1.25, hamstring: 1.45, knee: 1.5, ankle: 1.35, groin: 1.25, none: 1.0 };
const DURATION_OPTIONS = {
  futsal: [ { label: "15분 x 4쿼터 (60분)", value: 60 }, { label: "15분 x 6쿼터 (90분)", value: 90 }, { label: "20분 x 6쿼터 (120분)", value: 120 } ],
  football: [ { label: "45분 x 2쿼터 (90분)", value: 90 }, { label: "25분 x 4쿼터 (100분)", value: 100 }, { label: "25분 x 6쿼터 (150분)", value: 150 } ]
};

// ⏱️ 경기 시간 옵션 생성 함수 (오류 방지)
function updateDuration(sport) {
  const sel = document.getElementById('duration');
  if(!sel) return;
  sel.innerHTML = DURATION_OPTIONS[sport].map(o => `<option value="${o.value}">${o.label}</option>`).join('');
}

// 📊 히스토리 표시 (오류 방지)
function showHistory() {
  const h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const l = document.getElementById('history-list');
  const b = document.getElementById('clear-history');
  if(!l || !b) return;

  if (h.length > 0) {
    l.innerHTML = h.map(i => `<div style="display:flex;justify-content:space-between;padding:0.7rem 0;border-bottom:1px solid #f1f5f9;"><b>${i.date}</b><span>${i.distance}km</span><span style="color:#ef4444">부하 ${i.load}</span></div>`).join('');
    b.style.display = 'block';
  } else {
    l.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#94a3b8">기록된 데이터가 없습니다.</div>';
    b.style.display = 'none';
  }
}

function init() {
  // 워치 버튼 이벤트
  document.querySelectorAll('.watch-btn').forEach(b => b.addEventListener('click', e => {
    document.querySelectorAll('.watch-btn').forEach(x => x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const isWatch = e.currentTarget.dataset.watch === 'yes';
    document.getElementById('distance-group').style.display = isWatch ? 'block' : 'none';
    document.getElementById('rpe-group').style.display = isWatch ? 'none' : 'block';
  }));

  // 종목 버튼 이벤트
  document.querySelectorAll('.sport-btn').forEach(b => b.addEventListener('click', e => {
    document.querySelectorAll('.sport-btn').forEach(x => x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    updateDuration(e.currentTarget.dataset.sport);
  }));

  // 히스토리 삭제
  const clearBtn = document.getElementById('clear-history');
  if(clearBtn) {
    clearBtn.addEventListener('click', () => {
      if(confirm('모든 기록을 삭제할까요?')) {
        localStorage.removeItem('matchHistory');
        showHistory();
      }
    });
  }

  // 통증 체크박스
  document.querySelectorAll('input[name="pain"]').forEach(cb => cb.addEventListener('change', function() {
    const noneCb = document.querySelector('input[value="none"]');
    if (this.value !== 'none' && this.checked && noneCb) noneCb.checked = false;
    else if (this.value === 'none' && this.checked) {
      document.querySelectorAll('input[name="pain"]').forEach(o => { if (o.value !== 'none') o.checked = false; });
    }
    const checked = document.querySelectorAll('input[name="pain"]:checked').length;
    const painCount = document.getElementById('pain-count');
    if(painCount) painCount.textContent = `(${checked}개)`;
  }));

  document.getElementById('match-form').addEventListener('submit', onSubmit);
  
  // 🚀 초기 실행
  updateDuration('futsal');
  showHistory();
}

function onSubmit(e) {
  e.preventDefault();
  try {
    const watchBtn = document.querySelector('.watch-btn.active');
    const sportBtn = document.querySelector('.sport-btn.active');
    const sportKey = sportBtn.dataset.sport;
    const sport = SPORT_DATA[sportKey];
    
    const duration = parseInt(document.getElementById('duration').value || "60", 10);
    const pains = Array.from(document.querySelectorAll('input[name="pain"]:checked')).map(cb => cb.value);
    let mult = 1.0; 
    pains.forEach(p => { if(p !== 'none') mult *= (PAIN_MULTIPLIERS[p] || 1.15); });

    let dist, rpe;
    if (watchBtn.dataset.watch === 'yes') {
      dist = parseFloat(document.getElementById('distance').value || "3.8");
      rpe = Math.min(10, Math.max(2, (dist / sport.avg) * 6));
    } else {
      rpe = parseInt(document.getElementById('rpe').value || "7", 10);
      dist = +(sport.avg * (rpe / 6)).toFixed(1);
    }
    
    const load = Math.round(duration * rpe * mult);
    const ready = Math.max(30, 100 - Math.round(load/12));

    // 결과 UI 업데이트 (null 체크 포함)
    const setTxt = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    setTxt('load-score', load);
    setTxt('distance-highlight', `${dist}km`);
    setTxt('readiness-score', `${ready}%`);
    
    const tips = document.getElementById('readiness-tips');
    if(tips) tips.innerHTML = `상태 리포트: ${ready >= 80 ? '✅ 양호' : '⚠️ 과부하 상태'}`;

    // 히스토리 저장
    const historyData = { date: new Date().toLocaleDateString(), distance: dist, load: load };
    let h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    h.unshift(historyData);
    localStorage.setItem('matchHistory', JSON.stringify(h.slice(0, 10)));
    
    showHistory();
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('분석 에러:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
