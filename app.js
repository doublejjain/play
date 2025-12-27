document.getElementById('play-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const games = parseInt(document.getElementById('games').value);
  const minutes = parseInt(document.getElementById('minutes').value);
  const intensity = parseInt(document.getElementById('intensity').value);
  
  const totalMinutes = games * minutes * intensity;
  let riskLevel, advice;
  
  if (totalMinutes <= 120) {
    riskLevel = '낮음';
    advice = '완벽합니다! 몸 상태 좋습니다. 자신 있게 다음 경기 준비하세요.';
  } else if (totalMinutes <= 240) {
    riskLevel = '중간';
    advice = `${games}경기(${totalMinutes}분)은 적당한 부하입니다. 휴식과 영양 보충 잘 챙기세요.`;
  } else {
    riskLevel = '높음';
    advice = '과부하 위험! 내일은 완전 휴식, 근육통 있으면 2-3일 쉬세요.';
  }
  
  document.getElementById('risk-level').textContent = riskLevel;
  document.getElementById('advice').textContent = advice;
  document.getElementById('result').style.display = 'block';
  document.getElementById('result').className = `result-section risk-${riskLevel.toLowerCase()}`;
});
