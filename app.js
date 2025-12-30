const SPORT_DATA = { futsal: { avg: 4.2, pro: 4.5, calPerKm: 280 }, football: { avg: 10.5, pro: 12.0, calPerKm: 110 } };
const PAIN_LOAD_MULTIPLIERS = { calf: 1.3, shin: 1.25, hamstring: 1.45, knee: 1.5, ankle: 1.35, groin: 1.25, shoulder: 1.1, back: 1.2, foot: 1.15 };
const DURATION_OPTIONS = {
  futsal: [ { label: "15분 x 4쿼터 (1시간)", value: 60 }, { label: "15분 x 6쿼터 (1.5시간)", value: 90 }, { label: "20분 x 6쿼터 (2시간)", value: 120 } ],
  football: [ { label: "45분 x 2쿼터 (정식 경기)", value: 90 }, { label: "25분 x 4쿼터 (2팀 매치)", value: 100 }, { label: "25분 x 6쿼터 (3팀 매치)", value: 150 } ]
};

const RECOVERY_PLANS = {
  none: { now: '🧊 찬물 샤워 15분 (12-15°C, 염증 억제)', s1: '🍽️ 탄수 1.2g/kg + 단백질 0.3g/kg 섭취', s2: '🧴 폼롤러 10분 (근막 이완)', s3: '💤 8시간 이상의 완전 수면', prep: '🚶 20분 가벼운 능동적 회복' },
  calf: { now: '🧊 종아리 냉찜질 20분 (거상 유지)', s1: '💊 마그네슘 400mg 섭취 (근육 경련 방지)', s2: '🧴 폼롤러 3세트 (경직 15%↓)', s3: '🛌 다리를 높게 유지하고 취침', prep: '⤵ 발목 가동성 훈련 + 동적 스트레칭' },
  shin: { now: '🧊 정강이 전면 얼음 마사지 15분', s1: '📉 지면 충격 점프·스프린트 48시간 금지', s2: '🦶 발바닥 아치 이완 스트레칭', s3: '💊 비타민D 및 칼슘 보충', prep: '👟 아치 지지 깔창 및 보호 테이핑' },
  hamstring: { now: '🧊 허벅지 뒤쪽 냉찜질 및 압박', s1: '🚶 통증 없는 범위 내 가벼운 걷기', s2: '🧘 무리한 스트레칭 금지, 부드러운 가동 훈련', s3: '🍒 타르트 체리 주스 (IL-6 감소)', prep: '🏃 등척성 수축 후 점진적 가속 점검' },
  knee: { now: '🧊 무릎 냉찜질 + 압박 Sleeve 착용', s1: '🦵 스쿼트 등 무릎 굴곡 각도 제한', s2: '💊 글루코사민 (연골 보호)', s3: '🛌 대퇴사두근 등척성 수축 훈련', prep: '🚲 고정 자전거 10분 관절액 활성화' },
  ankle: { now: '🧊 발목 RICE 20분 + 압박 밴드', s1: '🩹 보호 테이핑 (인대 불안정성 보완)', s2: '🦶 발목 고유수용성 감각 훈련', s3: '🛌 수면 시 발목 고정 및 거상', prep: '🧘 한 발 서기 평형 운동 4세트' }
};

const GEL_GUIDE = {
  short: '👟 [에너지 젤] 1시간 이내 경기: 식사가 충분했다면 필수는 아닙니다. 후반 체력 저하 시 킥오프 전 1개 권장.',
  medium: '⚽ [에너지 젤] 60-100분 경기: 킥오프 전 1개 + 후반 시작 전 1개 (총 2개) 추천.',
  long: '🏃 [에너지 젤] 100분 이상: 전반 중반 1개 + 후반 시작 전 1개 + 필요시 추가 1개 (최대 3개).'
};

function updatePainCount() { document.getElementById('pain-count').textContent = `(${document.querySelectorAll('input[name="pain"]:checked').length}개)`; }
function updateDuration(sport) { const sel = document.getElementById('duration'); sel.innerHTML = DURATION_OPTIONS[sport].map(o => `<option value="${o.value}">${o.label}</option>`).join(''); }

function init() {
  document.querySelectorAll('.watch-btn').forEach(b => b.addEventListener('click', e => {
    document.querySelectorAll('.watch-btn').forEach(x => x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.getElementById('distance-group').style.display = e.currentTarget.dataset.watch === 'yes' ? 'block' : 'none';
    document.getElementById('rpe-group').style.display = e.currentTarget.dataset.watch === 'yes' ? 'none' : 'block';
  }));
  document.querySelectorAll('.sport-btn').forEach(b => b.addEventListener('click', e => {
    document.querySelectorAll('.sport-btn').forEach(x => x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    updateDuration(e.currentTarget.dataset.sport);
  }));
  document.getElementById('match-form').addEventListener('submit', onSubmit);
  document.getElementById('clear-history').addEventListener('click', () => { if(confirm('기록을 삭제할까요?')) { localStorage.removeItem('matchHistory'); showHistory(); } });
  document.querySelectorAll('input[name="pain"]').forEach(cb => cb.addEventListener('change', function() {
    const noneCb = document.querySelector('input[value="none"]');
    if (this.value !== 'none' && this.checked && noneCb) noneCb.checked = false;
    else if (this.value === 'none' && this.checked) document.querySelectorAll('input[name="pain"]').forEach(o => { if (o.value !== 'none') o.checked = false; });
    updatePainCount();
  }));
  updateDuration('futsal'); showHistory();
}

function onSubmit(e) {
  e.preventDefault();
  try {
    const watchBtn = document.querySelector('.watch-btn.active'), sportBtn = document.querySelector('.sport-btn.active');
    const hasWatch = watchBtn.dataset.watch === 'yes', sportKey = sportBtn.dataset.sport, sport = SPORT_DATA[sportKey], duration = parseInt(document.getElementById('duration').value, 10);
    let pains = Array.from(document.querySelectorAll('input[name="pain"]:checked')).map(cb => cb.value).filter(v => v !== 'none');
    let mult = 1.0; pains.forEach(p => { mult *= (PAIN_LOAD_MULTIPLIERS[p] || 1.15); });
    let dist, rpe, load;
    if (hasWatch) { dist = parseFloat(document.getElementById('distance').value || sport.avg); rpe = Math.min(10, Math.max(2, (dist / sport.avg) * 6)); load = Math.round(duration * rpe); }
    else { rpe = parseInt(document.getElementById('rpe').value || '6', 10); load = Math.round(duration * rpe); dist = +(sport.avg * (rpe / 6)).toFixed(1); }
    const fLoad = Math.round(load * mult); const adjDist = dist / mult;
    let rank = adjDist < sport.avg * 0.8 ? '하위 40%' : adjDist < sport.avg * 1.1 ? '중위 50%' : adjDist < sport.pro ? '상위 25%' : '프로 레벨';
    document.getElementById('sport-badge').textContent = sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
    document.getElementById('distance-highlight').textContent = `${dist.toFixed(1)}km (${rank}) ${pains.length > 0 ? `+${Math.round((mult-1)*100)}% 부하` : ''}`;
    document.getElementById('perf-rank').textContent = rank; document.getElementById('calories').textContent = Math.round(dist * sport.calPerKm); document.getElementById('load-score').textContent = fLoad;
    const plan = RECOVERY_PLANS[pains[0] || 'none'];
    document.getElementById('now-action').textContent = plan.now; document.getElementById('step1-action').textContent = plan.s1; document.getElementById('step2-action').textContent = plan.s2; document.getElementById('step3-action').textContent = plan.s3; document.getElementById('prep-action').textContent = plan.prep;
    const gelText = duration <= 60 ? GEL_GUIDE.short : duration <= 100 ? GEL_GUIDE.medium : GEL_GUIDE.long;
    document.getElementById('nutrition-guide').textContent = (fLoad >= 700 ? '🔥 고강도 영양 보충' : fLoad >= 500 ? '✅ 중강도 영양 보충' : '😌 저강도 관리') + '\n' + gelText;
    const ready = Math.max(30, 100 - (fLoad / 10)); document.getElementById('readiness-score').textContent = `${Math.round(ready)}%`;
    saveHistory({ date: new Date().toLocaleDateString('ko-KR'), distance: dist.toFixed(1), rank, load: fLoad }); showHistory();
    document.getElementById('result').style.display = 'block'; document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
  } catch (err) { alert('데이터 분석 중 오류 발생'); }
}

function saveHistory(d) { let h = JSON.parse(localStorage.getItem('matchHistory') || '[]'); h.unshift(d); localStorage.setItem('matchHistory', JSON.stringify(h.slice(0, 10))); }
function showHistory() {
  const h = JSON.parse(localStorage.getItem('matchHistory') || '[]'); const l = document.getElementById('history-list'); const b = document.getElementById('clear-history');
  if (h.length) { l.innerHTML = h.map(i => `<div style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid #f1f5f9;font-size:0.85rem"><b>${i.date}</b><span>${i.distance}km</span><span style="color:#ef4444">부하 ${i.load}</span></div>`).join(''); b.style.display = 'block'; }
  else { l.innerHTML = '<div style="text-align:center;padding:1rem;color:#94a3b8">데이터 없음</div>'; b.style.display = 'none'; }
}
function shareResult() {
  const t = `⚽ 오늘 경기 분석\n활동량: ${document.getElementById('distance-highlight').textContent}\n등급: ${document.getElementById('perf-rank').textContent}\n분석 리포트 👇\n${window.location.href}`;
  if (navigator.share) navigator.share({ title: '경기 결과', text: t, url: window.location.href });
  else alert('텍스트가 복사되었습니다!');
}
document.addEventListener('DOMContentLoaded', init);
