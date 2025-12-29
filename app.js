// ... 기존 상수들은 동일 ...

function init() {
  // 체크박스 상호 배제 로직 추가
  setupPainCheckboxes();
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('prematch')) {
    document.getElementById('page-title').textContent = '⚽ 경기 전 체크';
    document.getElementById('subtitle').textContent = '30초만에 준비도 확인';
  }
  
  document.querySelectorAll('.watch-btn, .sport-btn').forEach(b => b.addEventListener('click', handleButtonClick));
  
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

// 🔧 체크박스 상호 배제 로직
function setupPainCheckboxes() {
  const painCheckboxes = document.querySelectorAll('input[name="pain"]');
  painCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const noneCheckbox = document.querySelector('input[name="pain"][value="none"]');
      const hasOtherPain = Array.from(painCheckboxes)
        .some(cb => cb !== noneCheckbox && cb.checked);
      
      if (hasOtherPain && this.value === 'none') {
        this.checked = false; // 없음 자동 해제
      } else if (this.checked && this.value === 'none') {
        // 없음 선택시 다른 체크 해제
        painCheckboxes.forEach(cb => {
          if (cb.value !== 'none') cb.checked = false;
        });
      }
    });
  });
}

function calculateWeightedPain(pains) {
  // "없음"만 있거나 pains가 비어있으면 정상
  const validPains = pains.filter(p => p !== 'none');
  
  if (validPains.length === 0) {
    return { 
      weight: 1.0, 
      recoveryFactor: 1.0, 
      primary: 'none', 
      count: 0, 
      secondary: [],
      pains: []
    };
  }
  
  const sortedPains = validPains.sort((a,b) => 
    RECOVERY_PLANS_PRIORITY.indexOf(a) - RECOVERY_PLANS_PRIORITY.indexOf(b)
  );
  const primary = sortedPains[0];
  
  let totalLoad = 1.0, totalRecovery = 1.0;
  sortedPains.forEach(pain => {
    totalLoad *= PAIN_WEIGHTS[pain]?.load || 1.1;
    totalRecovery *= PAIN_WEIGHTS[pain]?.recovery || 0.9;
  });
  
  return {
    weight: totalLoad,
    recoveryFactor: totalRecovery,
    primary: primary || 'none',
    count: sortedPains.length,
    secondary: sortedPains.slice(1),
    pains: sortedPains
  };
}

// 🔧 다음 경기 준비도 개선된 계산
function calculateReadiness(baseLoad, painAnalysis, baseRPE, duration) {
  // 1. 기본 준비도 (운동 강도 반영)
  let baseReadiness = Math.max(40, 100 - (baseLoad / 15));
  
  // 2. 통증 패널티 (복합시 가중)
  const painPenalty = (1 - painAnalysis.recoveryFactor) * 40;
  
  // 3. RPE/지속시간 보너스/패널티
  const rpeBonus = baseRPE <= 6 ? 10 : baseRPE >= 9 ? -15 : 0;
  const durationPenalty = duration > 100 ? -10 : 0;
  
  // 4. 최종 계산
  const finalReadiness = Math.max(30, Math.round(
    baseReadiness - painPenalty + rpeBonus + durationPenalty
  ));
  
  return {
    score: finalReadiness,
    factors: {
      base: Math.round(baseReadiness),
      pain: Math.round(painPenalty),
      rpe: rpeBonus,
      duration: durationPenalty
    }
  };
}

function onSubmit(e) {
  e.preventDefault();
  
  try {
    const hasWatch = document.querySelector('.watch-btn.active').dataset.watch === 'yes';
    const sportKey = document.querySelector('.sport-btn.active').dataset.sport;
    const duration = parseInt(document.getElementById('duration').value, 10);
    const allPains = Array.from(document.querySelectorAll('input[name="pain"]:checked'))
      .map(cb => cb.value);
    
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
    
    const painAnalysis = calculateWeightedPain(allPains);
    const finalLoad = Math.round(baseLoad * painAnalysis.weight);
    
    // 🔧 개선된 준비도 계산
    const readinessData = calculateReadiness(baseLoad, painAnalysis, baseRPE, duration);
    
    let rank;
    const adjustedDistance = baseDistance * painAnalysis.recoveryFactor;
    if (adjustedDistance < sport.avg * 0.8) rank = '하위 40%';
    else if (adjustedDistance < sport.avg * 1.1) rank = '중위 50%';
    else if (adjustedDistance < sport.pro) rank = '상위 25%';
    else rank = '프로급 TOP 10%';
    
    const calories = Math.round(baseDistance * sport.calPerKm * painAnalysis.weight);
    const intensity = finalLoad >= 700 ? 'high' : finalLoad >= 500 ? 'medium' : 'low';
    
    updateUI(sportKey, baseDistance, rank, calories, finalLoad, sport, intensity, painAnalysis, readinessData);
    
    saveHistory({
      date: Date.now(),
      distance: baseDistance.toFixed(1),
      pains: painAnalysis.pains.length ? painAnalysis.pains.map(getPainName).join('+') : '없음',
      rank,
      load: finalLoad,
      readiness: readinessData.score
    });
    
    showHistory();
    if (typeof QRCode !== 'undefined') {
      QRCode.toCanvas(document.getElementById('qr-container'), window.location.href, { width: 150 });
    }
    
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('분석 에러:', error);
    alert('분석 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
  }
}

function updateUI(sportKey, baseDistance, rank, calories, finalLoad, sport, intensity, painAnalysis, readinessData) {
  // 기본 UI 업데이트
  document.getElementById('sport-badge').textContent = sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
  document.getElementById('distance-highlight').textContent = `${baseDistance.toFixed(1)}km (${rank})`;
  document.getElementById('perf-rank').textContent = rank;
  document.getElementById('calories').textContent = calories.toLocaleString();
  document.getElementById('load-score').textContent = `${finalLoad} (${painAnalysis.count || 0}부위)`;
  
  const primaryName = getPainName(painAnalysis.primary);
  document.getElementById('benchmark-note').innerHTML = 
    `기준: ${sport.avg.toFixed(1)}km(평균) ~ ${sport.pro.toFixed(1)}km(프로)<br>` +
    `<small>${primaryName} ${painAnalysis.secondary.length ? `+${painAnalysis.secondary.length}` : ''} → 부하 ${Math.round(painAnalysis.weight*100)}%↑</small>`;
  
  const plan = RECOVERY_PLANS[painAnalysis.primary] || RECOVERY_PLANS.none;
  ['now','step1','step2','step3','prep'].forEach(key => {
    const el = document.getElementById(`${key}-action`);
    if (el) {
      el.innerHTML = plan[key] + (key === 'now' && painAnalysis.secondary.length ? 
        `<br><small>추가: ${painAnalysis.secondary.map(getPainName).join(', ')}</small>` : '');
    }
  });
  
  document.getElementById('nutrition-guide').innerHTML = NUTRITION_CALCULATOR[intensity](finalLoad, painAnalysis.count);
  
  // 🔧 개선된 준비도 표시
  document.getElementById('readiness-score').textContent = `${readinessData.score}%`;
  document.getElementById('readiness-tips').innerHTML = 
    `<strong>${readinessData.score >= 85 ? '✅ 최상' : readinessData.score >= 70 ? '✅ 양호' : '⚠️ 주의'}</strong><br>` +
    `${primaryName} 회복 ${Math.round(painAnalysis.recoveryFactor*100)}% | 운동강도 ${Math.round((100-readinessData.factors.base))}%↓<br>` +
    `<small>RPE${baseRPE} ${readinessData.factors.rpe !== 0 ? (readinessData.factors.rpe > 0 ? '+' : '') + readinessData.factors.rpe + '%' : ''} | ${duration}분 ${readinessData.factors.duration !== 0 ? readinessData.factors.duration + '%' : ''}</small>`;
}

// ... 나머지 함수들 동일 (clearHistory, saveHistory, showHistory, shareResult) ...
