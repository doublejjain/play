// PLAY 계산기 메인 로직

document.getElementById('play-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const games = parseInt(document.getElementById('games').value || "0", 10);
  const minutes = parseInt(document.getElementById('minutes').value || "0", 10);
  const intensity = parseInt(document.getElementById('intensity').value || "2", 10);

  const weeklyMinutes = games * minutes; // 이번 주 실제 뛴 총 시간(분)

  // 체감 강도 → 세션 RPE 매핑
  let sessionRPE = 5;
  if (intensity === 1) sessionRPE = 3;
  if (intensity === 2) sessionRPE = 5;
  if (intensity === 3) sessionRPE = 8;

  // 세션 RPE × 시간 = 주간 부하 점수(대략적인 값)
  const loadScore = weeklyMinutes * sessionRPE;

  let label, riskLevel, riskClass, summary, advice;

  if (loadScore < 800) {
    label = "안전 존";
    riskLevel = "낮음";
    riskClass = "low";
    summary = `이번 주 부하 점수는 약 ${Math.round(loadScore)}점으로, 몸이 편하게 적응할 수 있는 수준입니다.`;
    advice = "지금 패턴을 유지하되, 주 1일은 완전 휴식으로 비워 두면 다음 경기 퍼포먼스도 잘 나올 가능성이 큽니다.";
  } else if (loadScore < 1600) {
    label = "주의 존";
    riskLevel = "중간";
    riskClass = "medium";
    summary = `부하 점수 약 ${Math.round(loadScore)}점으로, 체력은 오르지만 피로도도 꽤 쌓이는 구간입니다.`;
    advice = "다음 주엔 경기 수를 1경기 줄이거나, 한 경기만 강도를 ‘가볍게’로 내려서 파동을 만들어 주면 부상 위험을 줄일 수 있습니다.";
  } else {
    label = "레드 존";
    riskLevel = "높음";
    riskClass = "high";
    summary = `부하 점수 약 ${Math.round(loadScore)}점으로, 과부하와 부상 위험이 확 올라가는 영역입니다.`;
    advice = "향후 7일 동안은 전력 질주가 많은 경기·대회를 피하고, 공만 살짝 만지는 회복 세션이나 가벼운 러닝 위주로 조절하는 걸 추천합니다.";
  }

  const resultSection = document.getElementById('result');
  const resultCard = document.getElementById('result-card');
  const riskFill = document.getElementById('risk-fill');

  document.getElementById('risk-level').textContent = `${label} (${riskLevel})`;
  document.getElementById('summary').textContent =
    `경기 ${games}회, 총 ${weeklyMinutes}분, 체감 강도 ${sessionRPE}/10 기준입니다. ${summary}`;
  document.getElementById('advice').textContent = advice;

  resultCard.classList.remove('low', 'medium', 'high');
  resultCard.classList.add(riskClass);

  if (riskClass === "low") riskFill.style.width = "30%";
  else if (riskClass === "medium") riskFill.style.width = "65%";
  else riskFill.style.width = "100%";

  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 👉 대시보드에서 쓸 수 있도록 최근 결과 저장
  const lastResult = {
    games,
    minutesPerGame: minutes,
    weeklyMinutes,
    sessionRPE,
    loadScore,
    label,
    riskLevel,
    riskClass,
    summary,
    advice,
    // 간단한 퍼포먼스 점수(0~100 스케일로 변환)
    perfScore: Math.max(
      0,
      Math.min(100, Math.round((loadScore / 1600) * 70 + (riskClass === "low" ? 20 : riskClass === "medium" ? 10 : 0)))
    ),
    timestamp: Date.now(),
  };
  localStorage.setItem('play_last_result', JSON.stringify(lastResult));
});
