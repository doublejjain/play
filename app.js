const SPORT_DATA = {
  futsal:   { avg: 3.8,  calPerKm: 280 },
  football: { avg:10.5,  calPerKm: 110 }
};

const RECOVERY_PLANS = {
  none:{ now:'가벼운 산책 10분', s1:'전신 폼롤러 5분', s2:'물 500ml', s3:'23시 취침', prep:'동적 스트레칭 5분' },
  calf:{ now:'종아리 얼음찜질 20분', s1:'종아리 폼롤러 10분', s2:'마그네슘 400mg', s3:'수면 8시간', prep:'앵클 펌프 2분' },
  shin:{ now:'정강이 얼음찜질 15분', s1:'정강이 테이핑', s2:'칼슘 1000mg', s3:'수면', prep:'쿠션 깔창' },
  hamstring:{ now:'햄스트링 얼음찜질', s1:'햄스트링 스트레칭 3세트', s2:'체리주스 200ml', s3:'수면 8시간', prep:'슬로우 조깅 5분' },
  knee:{ now:'무릎 얼음찜질', s1:'무릎 보호대', s2:'글루코사민', s3:'수면', prep:'자전거 5분' },
  ankle:{ now:'발목 얼음+압박', s1:'발목 테이핑', s2:'밸런스 스탠스', s3:'수면', prep:'발목 돌리기' },
  groin:{ now:'사타구니 얼음찜질', s1:'개구리 스트레칭', s2:'히알루론산', s3:'수면', prep:'워킹' },
  shoulder:{ now:'어깨 얼음찜질', s1:'밴드 로테이션', s2:'오메가3', s3:'수면', prep:'어깨 서클' },
  back:{ now:'허리 얼음찜질', s1:'폼롤러 흉추', s2:'비타민D', s3:'수면', prep:'코어 플랭크' },
  foot:{ now:'발바닥 얼음찜질', s1:'테니스공 롤링', s2:'마그네슘 오일', s3:'수면', prep:'맨발 워킹' }
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.watch-btn').forEach(b =>
    b.addEventListener('click', onWatchClick)
  );
  document.querySelectorAll('.sport-btn').forEach(b =>
    b.addEventListener('click', onSportClick)
  );
  const rpe = document.getElementById('rpe');
  if (rpe) {
    rpe.addEventListener('input', () => {
      document.getElementById('rpe-value').textContent = rpe.value;
    });
  }
  document.getElementById('match-form').addEventListener('submit', onSubmit);
});

function onWatchClick(e){
  document.querySelectorAll('.watch-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  const hasWatch = e.target.dataset.watch === 'yes';
  document.getElementById('distance-group').style.display = hasWatch ? 'block' : 'none';
  document.getElementById('rpe-group').style.display      = hasWatch ? 'none'  : 'block';
}

function onSportClick(e){
  document.querySelectorAll('.sport-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
}

function onSubmit(e){
  e.preventDefault();

  const hasWatch = document.querySelector('.watch-btn.active').dataset.watch === 'yes';
  const sportKey = document.querySelector('.sport-btn.active').dataset.sport;
  const duration = parseInt(document.getElementById('duration').value, 10);
  const pains = Array.from(document.querySelectorAll('input[name="pain"]:checked'))
                     .map(cb => cb.value).filter(v => v !== 'none');

  const sport = SPORT_DATA[sportKey];

  let distance, rpe, load;
  if (hasWatch) {
    distance = parseFloat(document.getElementById('distance').value || sport.avg);
    rpe = Math.min(10, Math.max(2, (distance / sport.avg) * 6));
    load = Math.round(duration * rpe);
  } else {
    rpe = parseInt(document.getElementById('rpe').value || '6', 10);
    load = Math.round(duration * rpe);
    distance = +(sport.avg * (rpe / 6)).toFixed(1);
  }

  let rank;
  if (distance < sport.avg * 0.7)      rank = '하위 40%';
  else if (distance < sport.avg * 1.0) rank = '중위 50%';
  else if (distance < sport.avg * 1.2) rank = '상위 25%';
  else                                 rank = 'TOP 10%';

  const calories = Math.round(distance * sport.calPerKm);

  document.getElementById('sport-badge').textContent =
    sportKey === 'futsal' ? '🏠 풋살' : '🌳 축구';
  document.getElementById('distance-highlight').textContent =
    `${distance.toFixed(1)} km (${rank})`;
  document.getElementById('perf-rank').textContent  = rank;
  document.getElementById('calories').textContent   = calories;
  document.getElementById('load-score').textContent = load;

  const mainPain = pains[0] || 'none';
  const plan = RECOVERY_PLANS[mainPain] || RECOVERY_PLANS.none;
  document.getElementById('now-action').textContent   = plan.now;
  document.getElementById('step1-action').textContent = plan.s1;
  document.getElementById('step2-action').textContent = plan.s2;
  document.getElementById('step3-action').textContent = plan.s3;
  document.getElementById('prep-action').textContent  = plan.prep;

  document.getElementById('result').style.display = 'block';
  document.getElementById('result').scrollIntoView({ behavior:'smooth' });
}
