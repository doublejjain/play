class PlayApp {
  constructor() {
    this.formData = {};
    this.init();
  }

  init() {
    this.bindEvents();
    this.setDefaultValues();
  }

  bindEvents() {
    // 스포츠 버튼
    document.querySelectorAll('.sport-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectSport(e));
    });

    // 강도 버튼
    document.querySelectorAll('.intensity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectIntensity(e));
    });

    // 계산 버튼
    document.getElementById('calc-btn').addEventListener('click', () => this.calculate());

    // 입력값 실시간 변경 감지
    document.getElementById('minutes').addEventListener('input', () => {
      this.formData.minutes = parseInt(document.getElementById('minutes').value) || 90;
    });
  }

  selectSport(e) {
    document.querySelectorAll('.sport-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    this.formData.sport = e.target.dataset.type;
  }

  selectIntensity(e) {
    document.querySelectorAll('.intensity-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    this.formData.intensity = parseInt(e.target.dataset.intensity);
  }

  setDefaultValues() {
    this.formData = {
      sport: 'football',
      minutes: 90,
      intensity: 2,
      age: 30,
      distance: 0,
      taping: false,
      gel: false,
      protein: false
    };
  }

  calculate() {
    // 폼 데이터 수집
    this.collectFormData();
    
    // 부하 계산
    const result = this.computeLoad();
    
    // 결과 표시
    this.showResult(result);
    
    // 추천 업데이트
    this.updateRecommendations(result);
    
    // 섹션 전환
    document.querySelector('.input-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
  }

  collectFormData() {
    this.formData.minutes = parseInt(document.getElementById('minutes').value) || 90;
    this.formData.intensity = parseInt(document.querySelector('.intensity-btn.active').dataset.intensity) || 2;
    this.formData.sport = document.querySelector('.sport-btn.active').dataset.type;
    this.formData.age = parseInt(document.getElementById('age').value) || 30;
    this.formData.distance = parseFloat(document.getElementById('distance').value) || 0;
    this.formData.taping = document.getElementById('taping').checked;
    this.formData.gel = document.getElementById('gel').checked;
    this.formData.protein = document.getElementById('protein').checked;
  }

  computeLoad() {
    let load = this.formData.minutes * (this.formData.intensity * 3.33);

    // 스포츠 가중치
    const weights = { football: 1.3, running: 1.1, gym: 1.0 };
    load *= weights[this.formData.sport] || 1.0;

    // 거리 보너스
    if (this.formData.distance > 0) load += this.formData.distance * 25;

    // 나이 팩터
    const ageFactor = this.getAgeFactor(this.formData.age);
    load *= ageFactor;

    // 보호 요소
    if (this.formData.taping) load *= 0.92;
    if (this.formData.gel) load *= 0.95;
    if (this.formData.protein) load *= 0.90;

    const riskLevel = this.getRiskLevel(load);
    const riskScore = this.getRiskScore(load);

    return {
      load: Math.round(load),
      riskLevel,
      riskScore,
      sportKR: { football: '축구', running: '러닝', gym: '헬스' }[this.formData.sport]
    };
  }

  getAgeFactor(age) {
    if (age < 25) return 0.90;
    if (age < 35) return 1.00;
    if (age < 45) return 1.10;
    return 1.25;
  }

  getRiskLevel(load) {
    if (load < 400) return '안전';
    if (load < 700) return '주의';
    return '⚠️고위험';
  }

  getRiskScore(load) {
    if (load < 400) return Math.min(33, load / 12);
    if (load < 700) return 33 + Math.min(33, (load - 400) / 9);
    return 66 + Math.min(34, (load - 700) / 10);
  }

  showResult(result) {
    document.getElementById('gauge-fill').style.width = `${result.riskScore}%`;
    document.getElementById('risk-title').textContent = result.riskLevel + ' 존';
    document.getElementById('risk-score').textContent = `부하 ${result.load}점`;
    document.getElementById('risk-advice').textContent = this.getAdvice(result.riskLevel);

    // 칩스
    const chipsEl = document.getElementById('status-chips');
    chipsEl.innerHTML = `
      <span class="chip">${result.sportKR}</span>
      ${this.formData.taping ? '<span class="chip">테이핑 ✓</span>' : ''}
      ${this.formData.gel ? '<span class="chip">젤 ✓</span>' : ''}
      ${this.formData.protein ? '<span class="chip">프로틴 ✓</span>' : ''}
    `;
  }

  getAdvice(level) {
    const advice = {
      '안전': '내일도 비슷한 강도로 OK 👍',
      '주의': '내일은 70% 강도로 줄여보세요 ⚠️',
      '⚠️고위험': '최소 48시간 휴식 권장 🚨'
    };
    return advice[level];
  }

  updateRecommendations(result) {
    // 내일 추천
    document.getElementById('tomorrow-plan').textContent = 
      this.getTomorrowPlan(result.riskLevel, result.sportKR);

    // 보강 바
    this.updateFocusBar('fitness-focus', result.riskLevel === '안전' ? 'low' : 'mid');
    this.updateFocusBar('strength-focus', result.sportKR === '헬스' ? 'low' : 'mid');
    this.updateFocusBar('injury-focus', result.riskLevel === '⚠️고위험' ? 'high' : 'low');
  }

  getTomorrowPlan(level, sport) {
    const plans = {
      '안전': `${sport} 90% 강도`,
      '주의': '러닝 40분 or 스트레칭',
      '⚠️고위험': '완전 휴식 + 폼롤러'
    };
    return plans[level];
  }

  updateFocusBar(id, level) {
    const bar = document.querySelector(`#${id} .focus-bar`);
    bar.className = `focus-bar ${level}`;
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PlayApp();
});
