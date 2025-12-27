// PLAY 계산기 + 대시보드 연동

// 결과를 받아서 하단 대시보드 갱신
function updateDashboard(last) {
  if (!last) return;

  const { games, minutesPerGame, weeklyMinutes, sessionRPE, loadScore, label, riskLevel, riskClass, perfScore } = last;

  // 점수 / 요약
  const dashScore = document.getElementById('dash-score');
  const dashRank = document.getElementById('dash-rank');
  const dashMini = document.getElementById('dash-mini');

  if (dashScore) dashScore.textContent = `${perfScore}점`;
  if (dashRank) dashRank.textContent = `임시 기준: 이번 주 활동량 지수 ${perfScore}/100`;
  if (dashMini) {
    const kmEstimate = (weeklyMinutes * 0.09 / 1000).toFixed(1); // 대략 0.09km/분 가정
    dashMini.textContent =
      `경기 ${games}회 · 총 ${weeklyMinutes}분(경기당 ${minutesPerGame}분, RPE ${sessionRPE}/10) · 추정 거리 약 ${kmEstimate}km · ${label} (${riskLevel})`;
  }

  // 오늘 추천 모드
  const modeList = document.getElementById('dash-mode-list');
  if (modeList) {
    modeList.innerHTML = "";
    const li1 = document.createElement('li');
    const li2 = document.createElement('li');
    const li3 = document.createElement('li');

    if (riskClass === "low") {
      li1.textContent = "이번 주는 무난한 부하입니다. 이번 주말에 추가로 1게임 더 뛰어도 괜찮은 수준입니다.";
      li2.textContent = "다만 주 1일은 완전 휴식으로 비워 두고, 수면 7시간 이상만 챙겨 주세요.";
      li3.textContent = "경기 전에 가벼운 탄수(바나나·젤)와 물만 챙겨도 퍼포먼스 유지에 도움이 됩니다.";
    } else if (riskClass === "medium") {
      li1.textContent = "주의 존입니다. 이번 주 추가 경기는 1게임까지만, 연속 2게임은 가급적 피하는 걸 추천합니다.";
      li2.textContent = "오늘 뛴다면, 다음 48시간은 전력 질주보다 기술·볼터치 위주로 가볍게.";
      li3.textContent = "경기 후 2시간 안에 탄수+단백질 식사와 수분 보충을 신경 써 주세요.";
    } else {
      li1.textContent = "레드 존입니다. 오늘은 새로운 경기보다는 회복 모드(산책·가벼운 볼터치)를 가장 추천합니다.";
      li2.textContent = "최소 이틀은 전력 질주가 많은 경기·대회는 피하고, 스트레칭과 수면에 집중해 주세요.";
      li3.textContent = "발목·무릎이 불안하다면, 다음 고강도 경기 전에는 준비운동과 테이핑을 꼭 고려해 보세요.";
    }

    modeList.appendChild(li1);
    modeList.appendChild(li2);
    modeList.appendChild(li3);
  }

  // 강화하면 좋은 부분 간단 매핑
  const fitnessBar = document.getElementById('focus-fitness');
  const strengthBar = document.getElementById('focus-strength');
  const injuryBar = document.getElementById('focus-injury');
  const fitnessText = document.getElementById('focus-fitness-text');
  const strengthText = document.getElementById('focus-strength-text');
  const injuryText = document.getElementById('focus-injury-text');

  if (fitnessBar && strengthBar && injuryBar) {
    // 일단 부하 기준으로만 단순한 판단
    if (loadScore < 800) {
      fitnessBar.className = "focus-bar focus-mid";
      injuryBar.className = "focus-bar focus-high";
    } else if (loadScore < 1600) {
      fitnessBar.className = "focus-bar focus-high";
      injuryBar.className = "focus-bar focus-mid";
    } else {
      fitnessBar.className = "focus-bar focus-high";
      injuryBar.className = "focus-bar focus-low";
    }
    strengthBar.className = "focus-bar focus-mid";
  }

  if (fitnessText) {
    fitnessText.textContent =
      "주 1회만이라도 20초 전력 + 40초 걷기 셔틀런 6세트를 넣어주면 후반 체력 유지에 도움이 됩니다.";
  }
  if (strengthText) {
    strengthText.textContent =
      "하루 10분, 스쿼트·런지·플랭크·브리지만 해도 몸싸움·균형감이 눈에 띄게 좋아질 수 있습니다.";
  }
  if (injuryText) {
    injuryText.textContent =
      "햄스트링·발목이 자주 불안하다면, FIFA 11+ 스타일 준비운동과 간단 테이핑을 고강도 경기 전에만이라도 적용해 보세요.";
  }
}

// 계산기 메인 로직
document.getElementById('play-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const games = parseInt(document.getElementById('games').value || "0", 10);
  const minutes = parseInt(document.getElementById('minutes').value || "0", 10);
  const intensity = parseInt(document.getElementById('intensity').value || "2", 10);

  const weeklyMinutes = games * minutes;

  // 체감 강도 → 세션 RPE
  let sessionRPE = 5;
  if (intensity === 1) sessionRPE = 3;
  if (intensity === 2) sessionRPE = 5;
  if (intensity === 3) sessionRPE = 8;

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

  // localStorage에 저장
  const perfScore = Math.max(
    0,
    Math.min(100, Math.round((loadScore / 1600) * 70 + (riskClass === "low" ? 20 : riskClass === "medium" ? 10 : 0)))
  );

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
    perfScore,
    timestamp: Date.now(),
  };
  localStorage.setItem('play_last_result', JSON.stringify(lastResult));

  // 대시보드 즉시 갱신
  updateDashboard(lastResult);
});

// 페이지 처음 열 때, 이전 결과가 있으면 대시보드에 보여주기
window.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('play_last_result');
  if (!raw) return;
  try {
    const last = JSON.parse(raw);
    updateDashboard(last);
  } catch (e) {
    console.error(e);
  }
});
