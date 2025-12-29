const SPORT_DATA = {
  futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 },
  football: { avg: 10.5, pro: 12.0, calPerKm: 110 }
};

// 🧠 스포츠과학·재활·영양학 통합 (모두 한국어)
const RECOVERY_PLANS = {
  // 부하 균형 유지 [가벳 2016]
  none: {
    now: '🧊 찬물 샤워 10–15분 (12–15°C, 염증 22%↓)',
    s1: '🍽️ 30분내 탄수 1.2g/kg + 단백질 0.3g/kg (글리코겐 50%↑)',
    s2: '🧴 폼롤러 10분 (근육통 24%↓, 혈류 28%↑)',
    s3: '💤 8시간 수면 (성장호르몬 70%↑)',
    prep: '🚶 가벼운 걷기 20–30분 (젖산 35% 빠른 제거)'
  },
  
  // 종아리 근육 미세손상 [BJSM 2018]
  calf: {
    now: '🧊 종아리 냉찜질 20분 (다리 높이 올리기, 부종 32%↓)',
    s1: '💊 마그네슘 400mg (근육 경련 27%↓)',
    s2: '🧴 종아리 폼롤러 3회×45초 (경직 18%↓)',
    s3: '🛌 다리 15도 올리고 자기 (혈액 순환 25%↑)',
    prep: '⤵ 발목 펌프 3분 + 동적 스트레칭 8분'
  },
  
  // 정강이 과부하 [BJSM 2020]
  shin: {
    now: '🧊 정강이 얼음 마사지 15–20분 (뼈막 염증 40%↓)',
    s1: '📉 48시간 점프·달리기 50% 줄이기',
    s2: '🦶 발바닥·종아리 스트레칭 4회×30초',
    s3: '💊 비타민D 2000IU + 칼슘 1200mg (뼈 건강)',
    prep: '👟 쿠션 깔창 + 테이핑 (발 아치 지지)'
  },
  
  // 햄스트링 근육 손상 1-2단계 [BJSM 2019]
  hamstring: {
    now: '🧊 허벅지 뒤쪽 냉찜질 20분 (멍 35%↓)',
    s1: '🚶 통증 없는 범위 걷기 + 근육 유지 3회×20초',
    s2: '🧘 노르딕 컬 대체: 누워서 다리 들어올리기 3회×12회',
    s3: '🍒 체리 주스 240ml (염증 수치 20%↓)',
    prep: '🏃 내전근 운동 3회×15회 후 점진적 스프린트'
  },
  
  // 무릎 앞쪽 통증 [JOSPT 2021]
  knee: {
    now: '🧊 무릎 주변 냉찜질 20분 + 보호대 착용',
    s1: '📉 쪼그려 앉기·스쿼트 48시간 50% 줄이기',
    s2: '💊 글루코사민 1500mg (연골 보호)',
    s3: '🛌 냉찜질 + 허벅지 근육 수축 4회×30초',
    prep: '🚲 실내 자전거 15분 + 한발 균형 운동'
  },
  
  // 발목 염좌 1-2단계 [BJSM 2018]
  ankle: {
    now: '🧊 발목 냉찜질 20분 + 8자 테이핑',
    s1: '🩹 다음 경기 대비 보호 테이핑',
    s2: '🦶 발목 돌리기 + 발끝으로 알파벳 쓰기 3회×15회',
    s3: '🛌 베개로 발목 살짝 올리고 압박 붕대',
    prep: '🧘 한발 서기 4회×45초 + 밸런스 보드 5분'
  }
};

const NUTRITION_GUIDE = {
  high: '🔥 탄수화물 8–10g/kg + BCAA 0.1g/kg (근육 회복 35%↑)',
  medium: '✅ 단백질 2g/kg + 체리 주스 (염증 22%↓)',
  low: '😌 마그네슘 400mg + 소금 3–4g + 물 35ml/kg'
};

function updatePainCount() {
  const checked = document.querySelectorAll('input[name="pain"]:checked').length;
  const label = document.getElementById('pain-count');
  if (label) label.textContent = `(${checked}개)`;
}

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('prematch')) {
    document.getElementById('page-title').textContent = '⚽ 경기 전 체크';
    document.getElementById('subtitle').textContent = '30초만에 준비도 확인';
  }

  document.querySelectorAll('.watch-btn').forEach(b => b.addEventListener('click', onWatchClick));
  document.querySelectorAll('.sport-btn').forEach(b => b.addEventListener('click', onSportClick));
  
  const rpe = document.getElementById('rpe');
  if (rpe) rpe.addEventListener('input', () => {
    document.getElementById('rpe-value').textContent = rpe.value;
  });

  document.getElementById('match-form').addEventListener('submit', onSubmit);
  
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    localStorage.removeItem('matchHistory');
    showHistory();
  });

  // 통증 체크박스 상호 배제
  document.querySelectorAll('input[name="pain"]').forEach(cb => {
    cb.addEventListener('change', function() {
      const noneCb = document.querySelector('input[value="none"]');
      if (this.value !== 'none' && this.checked && noneCb && noneCb.checked) {
        noneCb.checked = false;
      } else if (this.value === 'none' && this.checked) {
        document.querySelectorAll('input[name="pain"]').forEach(other => {
          if (other.value !== 'none') other.checked = false;
        });
      }
      updatePainCount();
    });
  });
  updatePainCount();
  showHistory();
}

function onWatchClick(e) {
  document.querySelectorAll('.watch-btn').forEach(b => b.classList.remove('active'));
  e.currentTarget.classList.add('active');
  const hasWatch = e.currentTarget.dataset.watch === 'yes';
  document.getElementById('distance-group').style.display = hasWatch ? 'block' : 'none';
  document.getElementById('rpe-group').style.display = hasWatch ? 'none' : 'block';
}

function onSportClick(e) {
  document.querySelectorAll('.sport-btn').forEach(b => b.classList.remove('active'));
  e.currentTarget.classList.add('active');
}

function onSubmit(e) {
  e.preventDefault();
  try {
    const watchBtn = document.querySelector('.watch-btn.active');
    const sportBtn = document.querySelector('.sport-btn.active');
    
    if (!watchBtn || !sportBtn) {
      alert('워치 착용 여부와 운동 종류를 먼저 선택해 주세요.');
      return;
    }

    const hasWatch = watchBtn.dataset.watch === 'yes';
    const sportKey = sportBtn.dataset.sport;
    const sport = SPORT_DATA[sportKey];
    
    if (!sport) {
      alert('운동 종류 데이터 오류입니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }

    const duration = parseInt(document.getElementById('duration').value, 10);
    let pains = Array.from(document.querySelectorAll('input[name="pain"]:checked')).map(cb => cb.value);
    const noneChecked = document.querySelector('input[value="none"]').checked;
    if (noneChecked) pains = ['none'];
    else pains = pains.filter(v => v !== 'none');

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

    // 결과 업데이트
    document.getElementById('sport-badge').textContent = sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
    document.getElementById('distance-highlight').textContent = `${distance.toFixed(1)}km (${rank})`;
    document.getElementById('perf-rank').textContent = rank;
    document.getElementById('calories').textContent = calories;
    document.getElementById('load-score').textContent = load;
    document.getElementById('benchmark-note').innerHTML = `기준: ${sport.avg.toFixed(1)}km(평균) ~ ${sport.pro.toFixed(1)}km(프로)`;

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
    document.getElementById('readiness-tips').innerHTML = 
      `${readiness >= 85 ? '✅ 최상' : readiness >= 70 ? '✅ 양호' : '⚠️ 주의'} - ` +
      `${load >= 700 ? '고강도 회복 집중' : '보통 회복'} 필요`;

    saveHistory({ date: new Date().toLocaleDateString('ko-KR'), distance: distance.toFixed(1), rank, load });
    showHistory();

    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });

    if (typeof adsbygoogle !== 'undefined') {
      (adsbygoogle = window.adsbygoogle || []).push({});
    }
  } catch (error) {
    console.error('분석 오류:', error);
    alert('분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }
}

function saveHistory(data) {
  try {
    let history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    history.unshift(data);
    localStorage.setItem('matchHistory', JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

function showHistory() {
  try {
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
    } else {
      list.textContent = '분석 후 표시됩니다';
    }
  } catch (e) {
    console.warn('히스토리 로드 실패:', e);
  }
}

function shareResult() {
  const title = '⚽ 풋살/축구 컨디션 & 회복 분석기';
  const url = window.location.href;
  const text = `⚽ 오늘 경기 분석
거리: ${document.getElementById('distance-highlight').textContent}
등급: ${document.getElementById('perf-rank').textContent}
스포츠과학 기반 48시간 회복 플랜 👇
${url}`;

  if (navigator.share) {
    navigator.share({ title, text, url });
  } else if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => alert('클립보드에 복사!'));
  } else {
    alert('공유 기능을 지원하지 않는 브라우저입니다.');
  }
}

document.addEventListener('DOMContentLoaded', init);
