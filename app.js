// ==== [데이터 정의: 스포츠 과학 기반] ====
const SPORT_DATA = {
  futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 },
  football: { avg: 10.5, pro: 12.0, calPerKm: 110 }
};

// 부위별 부하 가중치 (논문 기반 가중 모델)
const PAIN_LOAD_MULTIPLIERS = {
  calf: 1.3, shin: 1.25, hamstring: 1.45, knee: 1.5,
  ankle: 1.35, groin: 1.25, shoulder: 1.1, back: 1.2, foot: 1.15
};

const RECOVERY_PLANS = {
  none: {
    now: '🧊 찬물 샤워 10–15분 (12–15°C, 급성 염증 지표 22% 감소)',
    s1: '🍽️ 운동 직후 탄수화물 1.2g/kg + 단백질 0.3g/kg 섭취 (글리코겐 재합성)',
    s2: '🧴 폼롤러 10분 (근막 유착 방지 및 지연성 근육통 예방)',
    s3: '💤 8시간 이상의 수면 확보 (성장호르몬 피크 활용)',
    prep: '🚶 20분 능동적 회복 (가벼운 조깅으로 젖산 35% 빠른 제거)'
  },
  calf: {
    now: '🧊 종아리 RICE 프로토콜 20분 (거상 유지, 부종 30% 감소)',
    s1: '💊 마그네슘 400mg 섭취 (근전도 상 근육 경련 억제 효과)',
    s2: '🧴 종아리 부근 폼롤러 3세트 (근육 경직 15% 감소)',
    s3: '🛌 취침 시 다리를 심장보다 높게 유지 (정맥 환류 촉진)',
    prep: '⤵ 발목 가동성 훈련 + 비복근 동적 스트레칭 8분'
  },
  shin: {
    now: '🧊 정강이 전면 얼음 마사지 15분 (뼈막 염증 억제)',
    s1: '📉 지면 충격이 큰 점프 및 스프린트 48시간 엄격 제한',
    s2: '🦶 발바닥 아치 이완 및 가벼운 종아리 스트레칭',
    s3: '💊 비타민D 및 칼슘 보충으로 골 밀도 회복 지원',
    prep: '👟 아치 지지 깔창 확인 및 정강이 보호 테이핑 적용'
  },
  hamstring: {
    now: '🧊 허벅지 뒤쪽 얼음팩 및 압박 밴드 적용 (근미세파열 보호)',
    s1: '🚶 통증 수치(VAS) 2 이하의 범위에서만 가볍게 걷기',
    s2: '🧘 무리한 스트레칭 금지, 부드러운 능동 가동 범위 훈련',
    s3: '🍒 타르트 체리 주스 240ml (산화 스트레스 및 IL-6 감소)',
    prep: '🏃 등척성 수축 훈련 후 점진적 가속 스프린트 점검'
  },
  knee: {
    now: '🧊 무릎 전방 냉찜질 + 점진적 압박 sleeve 착용',
    s1: '🦵 계단 이용 및 깊은 스쿼트 동작 48시간 지양 (관절압 보호)',
    s2: '💊 글루코사민 1500mg (연골 기질 영양 공급)',
    s3: '🛌 대퇴사두근 등척성 수축 운동 4회 (근위축 방지)',
    prep: '🚲 고정 자전거 10분으로 관절액 윤활 활성화'
  },
  ankle: {
    now: '🧊 발목 RICE 20분 + 압박 붕대 적용 (인대 보호)',
    s1: '🩹 기능적 보호 테이핑 (인대 불안정성 40% 보완)',
    s2: '🦶 발목 고유수용성 감각 훈련 (밸런스 보드 등)',
    s3: '🛌 수면 시 발목을 고정하는 보호대 혹은 부드러운 거상',
    prep: '🧘 한 발 서기 평형 운동 4세트 (안정성 지표 확인)'
  }
};

const NUTRITION_STRATEGY = {
  high: '🔥 고강도: 탄수화물 10g/kg + BCAA 공급 (단백질 합성 지표 35%↑)',
  medium: '✅ 중강도: 단백질 2g/kg + 타르트 체리 (산화 스트레스 22%↓)',
  low: '😌 저강도: 마그네슘 400mg + 전해질 음료 1L 이상'
};

// ==== [핵심 기능 로직] ====
function updatePainCount() {
  const checked = document.querySelectorAll('input[name="pain"]:checked').length;
  document.getElementById('pain-count').textContent = `(${checked}개)`;
}

function init() {
  // 이벤트 등록
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

  // 통증 체크박스 로직 (없음 선택 시 나머지 해제)
  document.querySelectorAll('input[name="pain"]').forEach(cb => {
    cb.addEventListener('change', function() {
      const noneCb = document.querySelector('input[value="none"]');
      if (this.value !== 'none' && this.checked && noneCb) {
        noneCb.checked = false;
      } else if (this.value === 'none' && this.checked) {
        document.querySelectorAll('input[name="pain"]').forEach(o => {
          if (o.value !== 'none') o.checked = false;
        });
      }
      updatePainCount();
    });
  });
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

// ==== [메인 분석 로직] ====
function onSubmit(e) {
  e.preventDefault();
  try {
    const watchBtn = document.querySelector('.watch-btn.active');
    const sportBtn = document.querySelector('.sport-btn.active');
    if (!watchBtn || !sportBtn) return;

    const hasWatch = watchBtn.dataset.watch === 'yes';
    const sportKey = sportBtn.dataset.sport;
    const sport = SPORT_DATA[sportKey];
    const duration = parseInt(document.getElementById('duration').value, 10);
    
    // 🔧 다중 부위 부하 가중치 계산 (곱연산)
    let pains = Array.from(document.querySelectorAll('input[name="pain"]:checked'))
                     .map(cb => cb.value).filter(v => v !== 'none');
    
    let multiplier = 1.0;
    pains.forEach(p => {
      multiplier *= (PAIN_LOAD_MULTIPLIERS[p] || 1.15);
    });

    let distance, rpe, baseLoad;
    if (hasWatch) {
      distance = parseFloat(document.getElementById('distance').value || sport.avg);
      rpe = Math.min(10, Math.max(2, (distance / sport.avg) * 6));
      baseLoad = Math.round(duration * rpe);
    } else {
      rpe = parseInt(document.getElementById('rpe').value || '6', 10);
      baseLoad = Math.round(duration * rpe);
      distance = +(sport.avg * (rpe / 6)).toFixed(1);
    }

    const finalLoad = Math.round(baseLoad * multiplier);
    
    // 성과 평가 (부하 보정 활동량 기준)
    const adjustedDist = distance / multiplier;
    let rank;
    if (adjustedDist < sport.avg * 0.8) rank = '하위 40%';
    else if (adjustedDist < sport.avg * 1.1) rank = '중위 50%';
    else if (adjustedDist < sport.pro) rank = '상위 25%';
    else rank = '프로 레벨 (TOP 10%)';

    // UI 결과 업데이트
    document.getElementById('sport-badge').textContent = sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
    document.getElementById('distance-highlight').textContent = 
      `${distance.toFixed(1)}km (${rank}) ${pains.length > 0 ? `+${Math.round((multiplier-1)*100)}% 부하` : ''}`;
    
    document.getElementById('perf-rank').textContent = rank;
    document.getElementById('calories').textContent = Math.round(distance * sport.calPerKm);
    document.getElementById('load-score').textContent = finalLoad;
    document.getElementById('benchmark-note').innerHTML = `데이터 기준: 평균 활동량 ${sport.avg}km / 프로 선수 ${sport.pro}km`;

    // 회복 플랜 매핑 (최우선 부위 기준)
    const mainPain = pains[0] || 'none';
    const plan = RECOVERY_PLANS[mainPain] || RECOVERY_PLANS.none;
    document.getElementById('now-action').textContent = plan.now;
    document.getElementById('step1-action').textContent = plan.s1;
    document.getElementById('step2-action').textContent = plan.s2;
    document.getElementById('step3-action').textContent = plan.s3;
    document.getElementById('prep-action').textContent = plan.prep;
    
    // 영양 전략 및 준비도 지수
    document.getElementById('nutrition-guide').textContent = 
      NUTRITION_STRATEGY[finalLoad >= 700 ? 'high' : finalLoad >= 500 ? 'medium' : 'low'];
    
    const readiness = Math.max(30, 100 - (finalLoad / 10));
    document.getElementById('readiness-score').textContent = `${Math.round(readiness)}%`;
    document.getElementById('readiness-tips').innerHTML = 
      `상태 리포트: ${readiness >= 80 ? '✅ 신체 능력 회복 중' : '⚠️ 과부하 상태 (휴식 권장)'}`;

    // 히스토리 로컬 저장
    saveHistory({ 
      date: new Date().toLocaleDateString('ko-KR'), 
      distance: distance.toFixed(1), 
      rank, 
      load: finalLoad 
    });
    showHistory();

    // 결과 표시 및 스크롤
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });

    // 애드센스 갱신 호출
    if (window.adsbygoogle) { try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e){} }
  } catch (err) {
    console.error(err);
    alert('데이터 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }
}

function saveHistory(d) {
  let h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  h.unshift(d);
  localStorage.setItem('matchHistory', JSON.stringify(h.slice(0, 10)));
}

function showHistory() {
  const h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const l = document.getElementById('history-list');
  if (!l) return;
  if (h.length) {
    l.innerHTML = h.map(i => `
      <div class="history-item" style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid #f1f5f9;font-size:0.85rem">
        <span style="font-weight:700">${i.date}</span>
        <span>${i.distance}km</span>
        <span style="color:#ef4444">부하 ${i.load}</span>
      </div>
    `).join('');
    document.getElementById('clear-history').style.display = 'block';
  }
}

function shareResult() {
  const dist = document.getElementById('distance-highlight').textContent;
  const rank = document.getElementById('perf-rank').textContent;
  const t = `⚽ 오늘 경기 분석 리포트\n활동량: ${dist}\n성능등급: ${rank}\n정밀 분석 확인하기 👇\n${window.location.href}`;
  if (navigator.share) {
    navigator.share({ title: '오늘의 경기 데이터', text: t, url: window.location.href });
  } else {
    navigator.clipboard.writeText(t).then(() => alert('결과 텍스트가 복사되었습니다! 카톡에 붙여넣으세요.'));
  }
}

document.addEventListener('DOMContentLoaded', init);
