// PLAY 계산기 + 대시보드 연동 (나이 / 워치 거리 / 테이핑·보충 포함)

// 하단 대시보드 업데이트
function updateDashboard(last) {
  if (!last) return;

  const {
    games,
    minutesPerGame,
    weeklyMinutes,
    sessionRPE,
    loadScore,
    label,
    riskLevel,
    riskClass,
    perfScore,
    age,
    distanceKm,
    useTaping,
    useGel,
    useProtein,
  } = last;

  const dashScore = document.getElementById('dash-score');
  const dashRank = document.getElementById('dash-rank');
  const dashMini = document.getElementById('dash-mini');

  if (dashScore) dashScore.textContent = `${perfScore}점`;

  if (dashRank) {
    if (age) {
      dashRank.textContent = `${age}세 또래 기준 임시 활동 지수 ${perfScore}/100`;
    } else {
      dashRank.textContent = `임시 기준: 이번 주 활동량 지수 ${perfScore}/100`;
    }
  }

  if (dashMini) {
    const km = distanceKm != null ? distanceKm : (weeklyMinutes * 0.09) / 1000; // km 추정
    const kmText = km > 0 ? `${km.toFixed(1)}km` : "거리 정보 없음";
    dashMini.textContent =
      `경기 ${games}회 · 총 ${weeklyMinutes}분(경기당 ${minutesPerGame}분, RPE ${sessionRPE}/10) · ` +
      `추정/입력 거리 ${kmText} · ${label} (${riskLevel})`;
  }

  // 오늘 추천 모드
  const modeList = document.getElementById('dash-mode-list');
  if (modeList) {
    modeList.innerHTML = "";
    const add = (t) => {
      const li = document.createElement('li');
      li.textContent = t;
      modeList.appendChild(li);
    };

    if (riskClass === "low") {
      add("이번 주는 무난한 부하입니다. 이번 주말에 추가로 1게임 더 뛰어도 괜찮은 수준입니다.");
      if (age && age >= 35) {
        add("다만 35세 이상이라면, 주 1일은 완전 휴식으로 비워 두고 수면 7시간 이상을 한 번 챙겨 보세요.");
      } else {
        add("주 1일은 완전 휴식으로 비워 두고, 가볍게 걷기나 스트레칭 정도만 해도 충분합니다.");
      }
      add("경기 전에 바나나·파워젤 중 하나와 물만 챙겨도 후반 퍼포먼스 유지에 도움이 됩니다.");
    } else if (riskClass === "medium") {
      add("주의 존입니다. 이번 주 추가 경기는 1게임까지만, 연속 2게임은 가급적 피하는 걸 추천합니다.");
      add("오늘 뛴다면, 다음 48시간은 전력 질주보다 기술·볼터치 위주로 가볍게 가져가 보세요.");
      if (!useProtein) {
        add("이번 주는 경기 후 단백질 보충(프로틴·고기·계란)을 한 번 챙겨보면 회복에 도움이 됩니다.");
      } else {
        add("경기 후 단백질을 잘 챙기고 있으니, 수분·수면만 조금 더 신경 쓰면 좋습니다.");
      }
    } else {
      add("레드 존입니다. 오늘은 새로운 경기보다는 회복 모드(산책·가벼운 볼터치)를 가장 추천합니다.");
      add("최소 이틀은 전력 질주가 많은 경기·대회는 피하고, 스트레칭과 수면에 집중해 주세요.");
      if (!useTaping) {
        add("발목·무릎이 불안하다면, 다음 고강도 경기 전에는 발목/무릎 테이핑을 한 번 고려해 보세요.");
      } else {
        add("테이핑까지 하고 있는 상태라면, 지금은 경기 수 자체를 줄여서 관절에 쉬는 날을 주는 게 좋습니다.");
      }
    }
  }

  // 강화해야 할 부분 (간단 매핑)
  const fitnessBar = document.getElementById('focus-fitness');
  const strengthBar = document.getElementById('focus-strength');
  const injuryBar = document.getElementById('focus-injury');
  const fitnessText = document.getElementById('focus-fitness-text');
  const strengthText = document.getElementById('focus-strength-text');
  const injuryText = document.getElementById('focus-injury-text');

  if (fitnessBar && strengthBar && injuryBar) {
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
    if (useTaping) {
      injuryText.textContent =
        "이미 테이핑까지 하고 있다면, 지금은 경기 수와 강도를 조절해 관절에 쉬는 날을 주는 게 더 중요합니다.";
    } else {
      injuryText.textContent =
        "햄스트링·발목이 자주 불안하다면, FIFA 11+ 스타일 준비운동과 간단 테이핑을 고강도 경기 전에만이라도 적용해 보세요.";
    }
  }
}

// 계산기 메인
document.getElementById('play-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const games = parseInt(document.getElementById('games').value || "0", 10);
  const minutes = parseInt(document.getElementById('minutes').value || "0", 10);
  const intensity = parseInt(document.getElementById('intensity').value || "2", 10);
  const age = parseInt(document.getElementById('age')?.value || "", 10);
  const watchDistanceRaw = document.getElementById('watchDistance')?.value;
  const distanceKm = watchDistanceRaw ? parseFloat(watchDistanceRaw) : null;
  const useTaping = document.getElementById('useTaping')?.checked || false;
  const useGel = document.getElementById('useGel')?.checked || false;
  const useProtein = document.getElementById('useProtein')?.checked || false;

  const weeklyMinutes = games * minutes;

  let sessionRPE = 5;
  if (intensity === 1) sessionRPE = 3;
  if (intensity === 2) sessionRPE = 5;
  if (intensity === 3) sessionRPE = 8;

  const loadScoreBase = weeklyMinutes * sessionRPE;

  // 나이 보정: 30대 이후는 부하를 조금 더 높게 평가
  let ageFactor = 1;
  if (!isNaN(age)) {
    if (age >= 30 && age < 35) ageFactor = 1.1;
    else if (age >= 35 && age < 40) ageFactor = 1.25;
    else if (age >= 40) ageFactor = 1.4;
  }
  const loadScore = loadScoreBase * ageFactor;

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

  // 퍼포먼스 점수 (간단)
  const perfScore = Math.max(
    0,
    Math.min(
      100,
      Math.round((loadScoreBase / 1600) * 60 + (riskClass === "low" ? 25 : riskClass === "medium" ? 15 : 5))
    )
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
    age: isNaN(age) ? null : age,
    distanceKm,
    useTaping,
    useGel,
    useProtein,
    timestamp: Date.now(),
  };
  localStorage.setItem('play_last_result', JSON.stringify(lastResult));
  updateDashboard(lastResult);
});

// 페이지 로드 시 이전 결과 불러오기
window.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('play_last_result');
  if (!raw) return;
  try {
    const last = JSON.parse(raw);
    updateDashboard(last);
  } catch {}
});
