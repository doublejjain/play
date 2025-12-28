// PLAY - 운동 부하 계산기 (축구/러닝/헬스 공통)
class PlayCalculator {
  constructor() {
    this.form = document.getElementById('play-form');
    this.resultSection = document.getElementById('result');
    this.initEventListeners();
  }

  initEventListeners() {
    // 운동 종류 버튼
    document.querySelectorAll('#sport-type .mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#sport-type .mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // 강도 버튼
    document.querySelectorAll('#intensity-group .mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#intensity-group .mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();
    const data = this.getFormData();
    const result = this.calculateLoad(data);
    this.displayResult(result, data);
    this.updateDashboard(result, data);
  }

  getFormData() {
    return {
      sport: document.querySelector('#sport-type .mode-btn.active').dataset.type,
      minutes: parseInt(document.getElementById('minutes').value) || 90,
      intensity: parseInt(document.querySelector('#intensity-group .mode-btn.active').dataset.intensity) || 2,
      age: parseInt(document.getElementById('age').value) || 30,
      distance: parseFloat(document.getElementById('watchDistance').value) || 0,
      taping: document.getElementById('useTaping').checked,
      gel: document.getElementById('useGel').checked,
      protein: document.getElementById('useProtein').checked
    };
  }

  // 핵심: 시간 × 강도 × 운동가중치 × 나이계수
  calculateLoad(data) {
    // 1. 기본 부하 = 시간 × RPE (0-10 스케일로 변환)
    const rpeScale = data.intensity * 3.33; // 1→3.3, 2→6.6, 3→10
    let baseLoad = data.minutes * rpeScale;

    // 2. 운동별 가중치 (축구>러닝>헬스)
    const sportWeights = { football: 1.3, running: 1.1, gym: 1.0 };
    baseLoad *= sportWeights[data.sport] || 1.0;

    // 3. 거리 보너스 (스마트워치)
    if (data.distance > 0) {
      baseLoad += data.distance * 20; // km당 20점 추가
    }

    // 4. 나이 조정 (30대 기준 1.0, 20대 0.9, 40대+ 1.1)
    const ageFactor = this.getAgeFactor(data.age);
    baseLoad *= ageFactor;

    // 5. 보호요소 감소 (테이핑/젤/프로틴)
    if (data.taping) baseLoad *= 0.92;
    if (data.gel) baseLoad *= 0.95;
    if (data.protein) baseLoad *= 0.90;

    // 6. 위험도 구간 (하루 기준)
    const riskLevel = this.getRiskLevel(baseLoad);
    
    return {
      baseLoad: Math.round(baseLoad),
      riskLevel,
      riskScore: this.getRiskScore(baseLoad), // 0-100
      sport: data.sport,
      advice: this.getAdvice(riskLevel, data)
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
    return '빨간불';
  }

  getRiskScore(load) {
    if (load < 400) return Math.min(33, load / 12);
    if (load < 700) return 33 + Math.min(33, (load - 400) / 9);
    return 66 + Math.min(34, (load - 700) / 10);
  }

  getAdvice(level, data) {
    const sportKR = { football: '축구/풋살', running: '러닝', gym: '헬스' };
    const sportName = sportKR[data.sport] || '운동';
    
    const advice = {
      안전: `오늘 ${sportName} ${data.minutes}분은 내일 컨디션 기준으로 **안전 존**입니다. 내일 비슷한 강도로도 괜찮아요.`,
      주의: `오늘 ${sportName} ${data.minutes}분은 **주의** 수준입니다. 내일은 시간을 70% 정도로 줄이거나 강도를 낮추세요.`,
      '빨간불': `오늘 ${sportName} ${data.minutes}분은 **고부하**입니다. 내일은 완전 휴식 또는 30분 걷기 정도로만 하세요.`
    };
    return advice[level];
  }

  displayResult(result, data) {
    // 결과 보이기
    document.getElementById('risk-level').textContent = result.riskLevel;
    document.getElementById('risk-fill').style.width = `${result.riskScore}%`;
    document.getElementById('summary').textContent = `부하 점수: ${result.baseLoad}점`;
    document.getElementById('summary').dataset.load = result.baseLoad;
    document.getElementById('advice').innerHTML = result.advice;

    // 칩스 (sport + 보호요소)
    const chips = document.getElementById('dash-chips');
    chips.innerHTML = `
      <span class="chip chip-sport">${result.sport === 'football' ? '⚽' : result.sport === 'running' ? '🏃' : '💪'} ${result.sport}</span>
      ${data.taping ? '<span class="chip chip-good">테이핑</span>' : ''}
      ${data.gel ? '<span class="chip chip-good">젤</span>' : ''}
      ${data.protein ? '<span class="chip chip-good">프로틴</span>' : ''}
    `;

    this.resultSection.style.display = 'block';
    this.resultSection.scrollIntoView({ behavior: 'smooth' });
  }

  updateDashboard(result, data) {
    // 강화 영역 업데이트
    this.updateFocusArea('fitness', result.riskLevel === '안전' ? 'high' : 'mid');
    this.updateFocusArea('strength', data.sport === 'gym' ? 'high' : 'mid');
    this.updateFocusArea('injury', result.riskLevel === '빨간불' ? 'high' : 'low');

    // 추천 모드
    const recList = document.getElementById('dash-mode-list');
    recList.innerHTML = `
      <li>${result.advice.split('입니다.')[0]}입니다.</li>
      <li><strong>내일 추천:</strong> ${this.getTomorrowRec(result.riskLevel, data.sport)}</li>
    `;
  }

  updateFocusArea(id, level) {
    const bar = document.getElementById(`focus-${id}`);
    const text = document.getElementById(`focus-${id}-text`);
    bar.className = `focus-bar focus-${level}`;
  }

  getTomorrowRec(risk, sport) {
    const recs = {
      안전: {
        football: '가벼운 풋살 or 인터벌 러닝 45분',
        running: '인터벌 or 언덕 러닝 50분',
        gym: '전신 웨이트 + 코어 60분'
      },
      주의: {
        football: '러닝 30분 or 헬스 하체 40분',
        running: '가벼운 조깅 30분 or 헬스 상체',
        gym: '상체 위주 or 유산소 40분'
      },
      '빨간불': {
        football: '완전 휴식 or 20분 산책',
        running: '스트레칭 + 폼롤러',
        gym: '상체 가볍게 or 요가'
      }
    };
    return recs[risk][sport] || '가벼운 산책 or 스트레칭';
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PlayCalculator();
});
