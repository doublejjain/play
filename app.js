const SPORT_DATA={
  futsal:{avg:4.2,pro:4.5,calPerKm:280},
  football:{avg:10.5,pro:12.0,calPerKm:110}
};
const RECOVERY_PLANS={
  none:{now:'🧊 RICE(휴식+얼음+압박+거상) 20분',s1:'🍽️ 탄수+단백 1:4 (바나나+우유)',s2:'🧴 폼롤러 10분',s3:'💊 마그네슘 400mg+수면8시간',prep:'🚶 동적 스트레칭 5분'},
  calf:{now:'🧊 종아리 RICE 25분(다리↑)',s1:'💊 마그네슘400mg+체리주스',s2:'🧴 폼롤러(3x30초)',s3:'🛌 수면8.5시간+다리높이',prep:'⤵ 앵클펌프3분'},
  shin:{now:'🧊 정강이 얼음 20분',s1:'🩹 테이핑준비',s2:'🥛 칼슘1000mg+D2000IU',s3:'🦶 발목스트레칭',prep:'👟 쿠션깔창'},
  hamstring:{now:'🧊 햄스트링 RICE 20분',s1:'🧘 햄스트링 스트레칭3세트',s2:'🍒 체리주스200ml',s3:'🛌 수면8시간',prep:'🏃 슬로우조깅5분'},
  knee:{now:'🧊 무릎 RICE 25분',s1:'🦵 보호대착용',s2:'💊 글루코사민1500mg',s3:'🛌 수면',prep:'🚲 자전거5분'},
  ankle:{now:'🧊 발목 RICE+압박',s1:'🩹 테이핑연습',s2:'🦶 밸런스3세트',s3:'🛌 수면',prep:'🧘 발목돌리기2분'}
};
const NUTRITION_GUIDE={
  high:'🚨 고강도: 탄수8g/kg+BCAA5g 체리주스200ml',
  medium:'✅ 중강도: 단백2g/kg+체리주스 마그네슘400mg',
  low:'😌 보통: 마그네슘400mg+물3L 수면8시간'
};

function init(){
  // URL 파라미터 처리
  const urlParams=new URLSearchParams(window.location.search);
  if(urlParams.get('prematch')){
    document.getElementById('page-title').textContent='⚽ 경기 전 체크';
    document.getElementById('subtitle').textContent='30초만에 준비도 확인';
  }
  
  // 이벤트 바인딩 (안전장치)
  document.querySelectorAll('.watch-btn')?.forEach(b=>b.addEventListener('click',onWatchClick));
  document.querySelectorAll('.sport-btn')?.forEach(b=>b.addEventListener('click',onSportClick));
  
  const rpe=document.getElementById('rpe');
  if(rpe)rpe.addEventListener('input',()=>document.getElementById('rpe-value').textContent=rpe.value);
  
  const form=document.getElementById('match-form');
  if(form)form.addEventListener('submit',onSubmit);
  
  // 🔒 완전 안전장치
  const clearBtn=document.getElementById('clear-history');
  if(clearBtn)clearBtn.addEventListener('click',clearHistory);
  
  showHistory();
}

function onWatchClick(e){
  document.querySelectorAll('.watch-btn').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  const hasWatch=e.target.dataset.watch==='yes';
  document.getElementById('distance-group').style.display=hasWatch?'block':'none';
  document.getElementById('rpe-group').style.display=hasWatch?'none':'block';
}

function onSportClick(e){
  document.querySelectorAll('.sport-btn').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
}

function onSubmit(e){
  e.preventDefault();
  
  try {
    const hasWatch=document.querySelector('.watch-btn.active').dataset.watch==='yes';
    const sportKey=document.querySelector('.sport-btn.active').dataset.sport;
    const duration=parseInt(document.getElementById('duration').value,10);
    const pains=Array.from(document.querySelectorAll('input[name="pain"]:checked'))
      .map(cb=>cb.value).filter(v=>v!=='none');
    
    const sport=SPORT_DATA[sportKey];
    let distance,rpe,load;
    
    if(hasWatch){
      distance=parseFloat(document.getElementById('distance').value||sport.avg);
      rpe=Math.min(10,Math.max(2,(distance/sport.avg)*6));
      load=Math.round(duration*rpe);
    }else{
      rpe=parseInt(document.getElementById('rpe').value||'6',10);
      load=Math.round(duration*rpe);
      distance=+(sport.avg*(rpe/6)).toFixed(1);
    }
    
    // 등급 계산
    let rank;
    if(distance<sport.avg*.8)rank='하위 40%';
    else if(distance<sport.avg*1.1)rank='중위 50%';
    else if(distance<sport.pro)rank='상위 25%';
    else rank='프로급 TOP 10%';
    
    const calories=Math.round(distance*sport.calPerKm);
    const intensity=load>=700?'high':load>=500?'medium':'low';
    
    // UI 업데이트
    updateUI(sportKey,distance,rank,calories,load,sport,intensity,pains);
    
    // 히스토리 저장 및 QR 생성
    saveHistory({date:new Date().toLocaleDateString('ko-KR'),distance:distance.toFixed(1),rank,load});
    showHistory();
    
    if(typeof QRCode!=='undefined'){
      QRCode.toCanvas(document.getElementById('qr-container'),window.location.href,{width:150});
    }
    
    document.getElementById('result').style.display='block';
    document.getElementById('result').scrollIntoView({behavior:'smooth'});
    
  } catch(error) {
    console.error('분석 에러:',error);
    alert('분석 중 오류 발생! 페이지를 새로고침해주세요.');
  }
}

function updateUI(sportKey,distance,rank,calories,load,sport,intensity,pains){
  document.getElementById('sport-badge').textContent=sportKey==='futsal'?'🏠 풋살':'🌳 축구';
  document.getElementById('distance-highlight').textContent=`${distance.toFixed(1)}km (${rank})`;
  document.getElementById('perf-rank').textContent=rank;
  document.getElementById('calories').textContent=calories.toLocaleString();
  document.getElementById('load-score').textContent=load;
  document.getElementById('benchmark-note').innerHTML=`기준: ${sport.avg.toFixed(1)}km(평균) ~ ${sport.pro.toFixed(1)}km(프로)`;
  
  const mainPain=pains[0]||'none';
  const plan=RECOVERY_PLANS[mainPain]||RECOVERY_PLANS.none;
  ['now','step1','step2','step3','prep'].forEach((key,i)=>{
    document.getElementById(`${key}-action`)&&(document.getElementById(`${key}-action`).textContent=plan[key]);
  });
  
  document.getElementById('nutrition-guide').textContent=NUTRITION_GUIDE[intensity];
  const readiness=Math.max(60,100-(load/10));
  document.getElementById('readiness-score').textContent=`${readiness}%`;
  document.getElementById('readiness-tips').innerHTML=`${readiness>=85?'✅ 최상':readiness>=70?'✅ 양호':'⚠️ 주의'} - ${load>=700?'고강도 회복 집중':'보통 회복'} 필요`;
}

function clearHistory(){
  localStorage.removeItem('matchHistory');
  showHistory();
}

function saveHistory(data){
  const history=JSON.parse(localStorage.getItem('matchHistory')||'[]');
  history.unshift(data);
  localStorage.setItem('matchHistory',JSON.stringify(history.slice(0,10)));
}

function showHistory(){
  const history=JSON.parse(localStorage.getItem('matchHistory')||'[]');
  const list=document.getElementById('history-list');
  if(!list)return;
  
  if(history.length){
    list.innerHTML=history.map(h=>`
      <div class="history-item">
        <span>${h.date}</span>
        <span>${h.distance}km ${h.rank}</span>
        <span>${h.load}</span>
      </div>
    `).join('');
    document.getElementById('clear-history').style.display='block';
  }else{
    list.innerHTML='📭 분석 기록이 없습니다';
    document.getElementById('clear-history').style.display='none';
  }
}

function shareResult(){
  const distanceEl=document.getElementById('distance-highlight');
  const rankEl=document.getElementById('perf-rank');
  const text=`⚽ 오늘 경기 분석 완료!
거리: ${distanceEl.textContent}
등급: ${rankEl.textContent}
회복 플랜 👇
${window.location.href}`;
  
  if(navigator.share){
    navigator.share({title:'풋살/축구 컨디션 분석',text,url:window.location.href});
  }else{
    navigator.clipboard.writeText(text).then(()=>alert('📋 카톡에 붙여넣기 복사됨!'));
  }
}

// 초기화
document.addEventListener('DOMContentLoaded',init);
