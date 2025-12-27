const form = document.getElementById("load-form");
const resultCard = document.getElementById("result-card");
const totalLoadEl = document.getElementById("total-load");
const changeLineEl = document.getElementById("change-line");
const riskBadgeEl = document.getElementById("risk-badge");
const adviceEl = document.getElementById("advice-text");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const mode = form.mode.value; // soccer or futsal
  const matches = Number(form.matches.value) || 0;
  const minutes = Number(form.minutes.value) || 0;
  const trainings = Number(form.trainings.value) || 0;
  const trainingMinutes = Number(form.trainingMinutes.value) || 0;
  const rpe = Number(form.rpe.value) || 0;
  const lastWeekLoad = Number(form.lastWeekLoad.value) || 0;

  // 1) 총 활동 시간(분)
  let totalMinutes =
    matches * minutes + trainings * trainingMinutes;

  // 종목별 가중치 (풋살은 단위 시간 강도 조금 더 높게)
  const modeFactor = mode === "futsal" ? 1.2 : 1.0;

  // 2) 부하 점수: 시간 × RPE × 종목 계수
  const totalLoad = Math.round(totalMinutes * rpe * modeFactor);

  // 3) 증가율 계산
  let changeText = "지난 주 데이터가 없어 증가율을 계산할 수 없습니다.";
  let changeRate = null;

  if (lastWeekLoad > 0) {
    changeRate = ((totalLoad - lastWeekLoad) / lastWeekLoad) * 100;
    const sign = changeRate >= 0 ? "+" : "";
    changeText = `지난 주 대비 ${sign}${changeRate.toFixed(
      1
    )}% 변화`;
  }

  // 4) 위험 레벨 판단
  let level = "safe";
  let badgeText = "안전 구간";
  let advice = "지금처럼 꾸준히 유지하면 좋습니다. 몸 상태 체크만 잊지 마세요.";

  if (changeRate === null) {
    // 데이터 없음 → 절대값 기준만 간단 적용
    if (totalLoad >= 2500) {
      level = "danger";
      badgeText = "주의: 높은 부하";
      advice =
        "부하가 꽤 높은 편입니다. 다음 주에는 경기/훈련 시간을 조금 줄이고 회복에 신경 쓰세요.";
    } else if (totalLoad >= 1500) {
      level = "warn";
      badgeText = "주의 구간";
      advice =
        "부하가 중간 이상입니다. 수면·영양·가벼운 스트레칭으로 회복을 챙기세요.";
    }
  } else {
    if (changeRate > 30) {
      level = "danger";
      badgeText = "위험: 부하 급증";
      advice =
        "지난 주보다 부하가 많이 늘었습니다. 다음 주에는 경기/훈련량을 20~30% 줄이고, 회복 세션(가벼운 조깅·스트레칭)을 넣는 걸 추천합니다.";
    } else if (changeRate > 10) {
      level = "warn";
      badgeText = "주의 구간";
      advice =
        "부하가 10~30% 증가했습니다. 근육통·피로가 심하면 세션 하나를 가볍게 조정하거나 휴식을 고려하세요.";
    } else if (changeRate < -20) {
      level = "safe";
      badgeText = "부하 감소";
      advice =
        "이번 주는 부하가 많이 줄었습니다. 컨디션 회복에는 좋지만, 너무 오래 낮게 유지되면 체력이 떨어질 수 있으니 다음 주에는 조금씩 다시 올려 보세요.";
    }
  }

  // 5) 화면 반영
  totalLoadEl.textContent = totalLoad;
  changeLineEl.textContent = changeText;

  riskBadgeEl.classList.remove("safe", "warn", "danger");
  riskBadgeEl.classList.add(level);
  riskBadgeEl.textContent = badgeText;

  adviceEl.textContent = advice;

  resultCard.classList.remove("hidden");
});
