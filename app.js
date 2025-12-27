document.getElementById('play-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const games = parseInt(document.getElementById('games').value || "0", 10);
  const minutes = parseInt(document.getElementById('minutes').value || "0", 10);
  const intensity = parseInt(document.getElementById('intensity').value || "1", 10);

  const totalMinutes = games * minutes;
  const loadScore = totalMinutes * intensity; // 아주 단순한 운동 부하 점수

  let riskLevel = "중간";
  let riskClass = "medium";
  let summary = "";
  let advice = "";

  if (loadScore <= 180) {
    riskLevel = "낮음";
    riskClass = "low";
    summary = `${games}경기, 총 ${totalMinutes}분이면 꽤 안정적인 수준입니다.`;
    advice = "지금 루틴을 유지하되, 주 1일은 완전 휴식이나 가벼운 스트레칭만 해 주세요.";
  } else if (loadScore <= 360) {
    riskLevel = "중간";
    riskClass = "medium";
    summary = `${games}경기, ${totalMinutes}분(강도 ${intensity})은 몸에 적당한 자극을 주는 수준입니다.`;
    advice = "근육통이 이틀 이상 가면 다음 주엔 경기 수를 1경기 줄이거나, 강도를 살짝 낮춰 보세요.";
  } else {
    riskLevel = "높음";
    riskClass = "high";
    summary = `${games}경기, ${totalMinutes}분(강도 ${intensity})은 과부하에 가까운 수준입니다.`;
    advice = "다음 2~3일은 전력 질주는 피하고, 수면·수분·스트레칭에 집중해서 회복을 최우선으로 두는 게 좋습니다.";
  }

  const resultSection = document.getElementById('result');
  const resultCard = document.getElementById('result-card');
  const riskFill = document.getElementById('risk-fill');

  // 텍스트 업데이트
  document.getElementById('risk-level').textContent = riskLevel;
  document.getElementById('summary').textContent = summary;
  document.getElementById('advice').textContent = advice;

  // 클래스 및 바 폭 업데이트
  resultCard.classList.remove('low', 'medium', 'high');
  resultCard.classList.add(riskClass);
  riskFill.id = "risk-fill"; // id 유지
  riskFill.parentElement.id = "risk-bar";
  if (riskClass === "low") riskFill.style.width = "30%";
  else if (riskClass === "medium") riskFill.style.width = "65%";
  else riskFill.style.width = "100%";

  // 보이게 + 스크롤
  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
