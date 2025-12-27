document.getElementById('play-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const games = parseInt(document.getElementById('games').value || "0", 10);
  const minutes = parseInt(document.getElementById('minutes').value || "0", 10);
  const intensity = parseInt(document.getElementById('intensity').value || "2", 10);

  const weeklyMinutes = games * minutes;

  // 체감 강도 → 세션 RPE 매핑 (대략적인 값)
  let sessionRPE = 5;
  if (intensity === 1) sessionRPE = 3;      // 가볍게
  if (intensity === 2) sessionRPE = 5;      // 보통
  if (intensity === 3) sessionRPE = 8;      // 강도 높음

  // 주간 부하 점수 (sRPE 개념 단순화)
  const loadScore = weeklyMinutes * sessionRPE; 

  let label = "";
  let riskLevel = "";
  let riskClass = "";
  let summary = "";
  let advice = "";

  if (loadScore < 800) {
    label = "안전 존";
    riskLevel = "낮음";
    riskClass = "low";
    summary = `이번 주 총 ${weeklyMinutes}분, 체감 강도 ${sessionRPE}/10이라 몸이 편안하게 적응할 만한 주간입니다.`;
    advice = "이 정도 볼륨은 대부분의 아마추어에게 무난한 수준입니다. 다만 주 1일은 완전 휴식으로 비워 두면 더 좋습니다.";
  } else if (loadScore < 1600) {
    label = "주의 존";
    riskLevel = "중간";
    riskClass = "medium";
    summary = `총 ${weeklyMinutes}분에 체감 강도 ${sessionRPE}/10이라, 체력이 올라가는 대신 피로도도 꽤 쌓이는 구간입니다.`;
    advice = "이번 주처럼 뛰고 싶다면, 다음 주에는 경기 수를 1경기 줄이거나 강도를 한 단계만 낮춰서 파동을 만들어 주세요.";
  } else {
    label = "레드 존";
    riskLevel = "높음";
    riskClass = "high";
    summary = `총 ${weeklyMinutes}분, 체감 강도 ${sessionRPE}/10이라 과부하에 가까운 수준입니다. 부상 위험이 확 올라가는 영역입니다.`;
    advice = "다음 7일 동안은 전력 질주·몸싸움이 많은 경기는 1~2번만 잡고, 나머지는 회복 위주(가볍게 킥·패스, 러닝)로 가져가는 걸 추천합니다.";
  }

  const resultSection = document.getElementById('result');
  const resultCard = document.getElementById('result-card');
  const riskFill = document.getElementById('risk-fill');

  document.getElementById('risk-level').textContent = `${label} (${riskLevel})`;
  document.getElementById('summary').textContent =
    `이번 주 부하 점수는 약 ${Math.round(loadScore)}점입니다. ${summary}`;
  document.getElementById('advice').textContent = advice;

  resultCard.classList.remove('low', 'medium', 'high');
  resultCard.classList.add(riskClass);

  if (riskClass === "low") riskFill.style.width = "30%";
  else if (riskClass === "medium") riskFill.style.width = "65%";
  else riskFill.style.width = "100%";

  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
