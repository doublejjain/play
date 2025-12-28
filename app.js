document.addEventListener('DOMContentLoaded', function() {
  // 버튼 이벤트
  document.querySelectorAll('.sport-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sport-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  document.querySelectorAll('.intensity-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  document.getElementById('calc-btn').addEventListener('click', calculateLoad);
});

function calculateLoad() {
  // 데이터 수집
  const sport = document.querySelector('.sport-btn.active').dataset.type;
  const minutes = parseInt(document.getElementById('minutes').value) || 90;
  const intensity = parseInt(document.querySelector('.intensity-btn.active').dataset.intensity) || 2;

  // 부하 계산
  let load = minutes * (intensity * 3.33);
  const weights = { football: 1.3, running: 1.1, gym: 1.0 };
  load *= weights[sport] || 1.0;

  const riskLevel = load < 400 ? '안전' : load < 700 ? '주의' : '⚠️고위험';
  const riskScore = Math.min(100, Math.max(0, (load / 10)));

  // 결과 표시
  document.getElementById('result-section').style.display = 'block';
  document.querySelector('.input-section').style.display = 'none';
  
  document.getElementById('gauge-fill').style.width = riskScore + '%';
  document.getElementById('risk-title').textContent = riskLevel + ' 존';
  document.getElementById('risk-score').textContent = '부하 ' + Math.round(load) + '점';
  document.getElementById('risk-advice').textContent = getAdvice(riskLevel);
  
  // 칩
  document.getElementById('status-chips').innerHTML = 
    `<span class="chip">${sport === 'football' ? '⚽ 축구' : sport === 'running' ? '🏃 러닝' : '💪 헬스'}</span>`;
  
  // 추천
  document.getElementById('tomorrow-plan').textContent = getTomorrowPlan(riskLevel, sport);
  
  // 보강바
  document.querySelector('#fitness-focus .focus-bar').className = 'focus-bar ' + (riskLevel === '안전' ? 'low' : 'mid');
  document.querySelector('#strength-focus .focus-bar').className = 'focus-bar mid';
  document.querySelector('#injury-focus .focus-bar').className = 'focus-bar ' + (riskLevel === '⚠️고위험' ? 'high' : 'low');
  
  document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
}

function getAdvice(level) {
  return {
    '안전': '내일도 비슷한 강도로 OK 👍',
    '주의': '내일은 70% 강도로 줄여보세요 ⚠️',
    '⚠️고위험': '최소 48시간 완전 휴식 🚨'
  }[level];
}

function getTomorrowPlan(level, sport) {
  const plans = {
    '안전': '같은 운동 90% 강도',
    '주의': '러닝 40분 or 스트레칭',
    '⚠️고위험': '완전 휴식 + 폼롤러'
  };
  return plans[level];
}
