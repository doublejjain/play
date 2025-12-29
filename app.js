// ==== 기본 데이터 ====
const SPORT_DATA = {
  futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 },
  football: { avg: 10.5, pro: 12.0, calPerKm: 110 }
};

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

const NUTRITION_GUIDE = {
  high: '🚨 고강도: 탄수8g/kg+BCAA5g',
  medium: '✅ 중강도: 단백2g/kg+체리주스',
  low: '😌 보통: 마그네슘400mg+물3L'
};

// ==== 통증 개수 표시 ====
function updatePainCount() {
  const checked = document.querySelectorAll('input[name="pain"]:checked').length;
  const label = document.getElementById('pain-count');
  if (label) label.textContent = `(${checked}개)`;
}

// ==== 초기화 ====
function init() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('prematch')) {
    document.getElementById('page-title').textContent = '⚽ 경기 전 체크';
    document.getElementById('subtitle').textContent = '30초만에 준비도 확인';
  }

  document.querySelectorAll('.watch-btn')
    .forEach(b => b.addEventListener('click', onWatchClick));
  document.querySelectorAll('.sport-btn')
    .forEach(b => b.addEventListener('click', onSportClick));

  const rpe = document.getElementById('rpe');
  if (rpe) {
    rpe.addEventListener('input', () => {
      document.getElementById('rpe-value').textContent = rpe.value;
    });
  }

  document.getElementById('match-form')
    .addEventListener('submit', onSubmit);

  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('matchHistory');
      showHistory();
    });
  }

  // 통증 체크박스: "없음" 상호배제 + 개수 표시
  document.querySelectorAll('input[name="pain"]').forEach(cb => {
    cb.addEventListener('change', function () {
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

// ==== 워치 / 스포츠 버튼 ====
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

// ==== 메인 제출 ====
function onSubmit(e) {
  e.preventDefault();
  try {
    const watchBtn = document.querySelector('.watch-btn.active');
    const sportBtn = document.querySelector('.sport-btn.active');

    // 방어 코드: 버튼 못 찾으면 에러 막기
    if (!watchBtn || !sportBtn) {
      alert('워치 착용 여부와 운동 종류를 먼저 선택해 주세요.');
      return;
    }

    const hasWatch = watchBtn.dataset.watch === 'yes';
    const sportKey = sportBtn.dataset.sport;
    const sport = SPORT_DATA[sportKey];

    if (!sport) {
      alert('운동 종류 데이터에 오류가 있습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }

    const duration = parseInt(document.getElementById('duration').value, 10);

    // 통증 선택
    let pains = Array.from(
      document.querySelectorAll('input[name="pain"]:checked')
    ).map(cb => cb.value);

    const noneChecked = document.querySelector('input[value="none"]').checked;
    if (noneChecked) pains = ['none'];
    else pains = pains.filter(v => v !== 'none');

    // 거리 / RPE / 부하 계산
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

    // 등급
    let rank;
    if (distance < sport.avg * 0.8) rank = '하위 40%';
    else if (distance < sport.avg * 1.1) rank = '중위 50%';
    else if (distance < sport.pro) rank = '상위 25%';
    else rank = '프로급 TOP 10%';

    const calories = Math.round(distance * sport.calPerKm);
    const intensity = load >= 700 ? 'high' : load >= 500 ? 'medium' : 'low';

    // 화면 반영
    document.getElementById('sport-badge').textContent =
      sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
    document.getElementById('distance-highlight').textContent =
      `${distance.toFixed(1)}km (${rank})`;
    document.getElementById('perf-rank').textContent = rank;
    document.getElementById('calories').textContent = calories;
    document.getElementById('load-score').textContent = load;
    document.getElementById('benchmark-note').innerHTML =
      `기준: ${sport.avg.toFixed(1)}km(평균) ~ ${sport.pro.toFixed(1)}km(프로)`;

    const mainPain = pains[0] || 'none';
    const plan = RECOVERY_PLANS[mainPain] || RECOVERY_PLANS.none;
    document.getElementById('now-action').textContent = plan.now;
    document.getElementById('step1-action').textContent = plan.s1;
    document.getElementById('step2-action').textContent = plan.s2;
    document.getElementById('step3-action').textContent = plan.s3;
    document.getElementById('prep-action').textContent = plan.prep;

    document.getElementById('nutrition-guide').textContent =
      NUTRITION_GUIDE[intensity];

    const readiness = Math.max(60, 100 - (load / 10));
    document.getElementById('readiness-score').textContent = `${readiness}%`;
    document.getElementById('readiness-tips').innerHTML =
      `${readiness >= 85 ? '✅ 최상' : readiness >= 70 ? '✅ 양호' : '⚠️ 주의'} - ` +
      `${load >= 700 ? '고강도 회복 집중' : '보통 회복'} 필요`;

    // 히스토리
    saveHistory({
      date: new Date().toLocaleDateString('ko-KR'),
      distance: distance.toFixed(1),
      rank,
      load
    });
    showHistory();

    // 결과 섹션 노출
    const result = document.getElementById('result');
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth' });

    // 애드센스 리로드 (에러 나더라도 앱 안죽게)
    try {
      if (typeof adsbygoogle !== 'undefined') {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (adErr) {
      console.warn('Adsense error:', adErr);  // 앱 동작에는 영향 없음 [web:68][web:71]
    }
  } catch (error) {
    console.error('분석 오류:', error);
    alert('분석 중 오류가 발생했습니다. 다시 한 번 시도해 주세요.');
  }
}

// ==== 히스토리 관련 ====
function saveHistory(data) {
  try {
    const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
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
    if (!list) return;

    if (history.length) {
      list.innerHTML = history.map(h => `
        <div class="history-item">
          <span>${h.date}</span>
          <span>${h.distance}km ${h.rank}</span>
          <span>${h.load}</span>
        </div>
      `).join('');
      const btn = document.getElementById('clear-history');
      if (btn) btn.style.display = 'inline-block';
    } else {
      list.textContent = '분석 후 표시됩니다';
    }
  } catch (e) {
    console.warn('히스토리 로드 실패:', e);
    const list = document.getElementById('history-list');
    if (list) list.textContent = '기록 로드 실패';
  }
}

// ==== 공유 ====
function shareResult() {
  const text =
`⚽ 오늘 경기 분석
거리: ${document.getElementById('distance-highlight').textContent}
등급: ${document.getElementById('perf-rank').textContent}
회복 플랜 👇
${window.location.href}`;

  if (navigator.share) {
    navigator.share({
      title: '풋살 컨디션',
      text,
      url: window.location.href
    }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => alert('클립보드에 복사!'))
      .catch(() => alert('공유 실패. 링크를 손으로 복사해 주세요.'));
  } else {
    alert('공유 기능을 지원하지 않는 브라우저입니다.');
  }
}

document.addEventListener('DOMContentLoaded', init);
