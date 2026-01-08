/* 
  motion.js - AI Coach Edition
  축구/풋살 특화 모션 분석 + 맞춤형 솔루션 제공
*/

console.log('🏃 AI Motion Coach loaded');

// DOM 요소
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const videoWrapper = document.getElementById('videoWrapper');
const videoPlayer = document.getElementById('videoPlayer');
const canvas = document.getElementById('output_canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');
const loading = document.getElementById('loading');
const resultBox = document.getElementById('resultBox');

let poseResults = [];
let poseAnalyzer = null;

// ========== MediaPipe 초기화 ==========
function initializePose() {
  if (typeof Pose === 'undefined') {
    setTimeout(initializePose, 500);
    return;
  }

  try {
    poseAnalyzer = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    poseAnalyzer.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.3,
      minTrackingConfidence: 0.3
    });

    poseAnalyzer.onResults(onPoseResults);
    console.log('✅ MediaPipe ready');
  } catch (err) {
    console.error('MediaPipe failed:', err);
  }
}

function onPoseResults(results) {
  if (!results.poseLandmarks) return;

  if (ctx && canvas) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4
    });
    
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 2,
      radius: 5
    });

    ctx.restore();
  }

  poseResults.push({
    landmarks: results.poseLandmarks,
    timestamp: Date.now()
  });
}

// ========== 이벤트 핸들러 ==========

if (uploadBox) {
  uploadBox.addEventListener('click', () => fileInput.click());
}

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;

    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    
    uploadBox.classList.add('active');
    uploadBox.querySelector('.upload-text').textContent = '영상 선택됨';
    uploadBox.querySelector('.upload-subtext').textContent = file.name;
    
    videoWrapper.classList.add('show');
    analyzeBtn.disabled = false;
    resetBtn.style.display = 'inline-block';
    
    videoPlayer.addEventListener('loadeddata', () => {
      const c = document.getElementById('output_canvas');
      if (c) {
        c.width = videoPlayer.videoWidth || 640;
        c.height = videoPlayer.videoHeight || 480;
      }
    }, { once: true });
  });
}

if (analyzeBtn) {
  analyzeBtn.addEventListener('click', async () => {
    if (!poseAnalyzer) return;

    analyzeBtn.disabled = true;
    loading.style.display = 'block';
    resultBox.classList.remove('show');
    poseResults = [];

    videoPlayer.currentTime = 0;
    await videoPlayer.play();

    let frameCount = 0;
    const maxFrames = 150;

    const processFrame = async () => {
      if (videoPlayer.ended || frameCount >= maxFrames) {
        videoPlayer.pause();
        
        setTimeout(() => {
          if (poseResults.length < 10) {
            alert('프레임이 너무 적습니다. 5초 이상 영상을 사용해주세요.');
            loading.style.display = 'none';
            analyzeBtn.disabled = false;
            return;
          }
          
          calculateResults();
          loading.style.display = 'none';
          resultBox.classList.add('show');
          analyzeBtn.disabled = false;
        }, 1000);
        
        return;
      }

      if (ctx && canvas) {
        ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
        
        try {
          await poseAnalyzer.send({ image: canvas });
          frameCount++;
        } catch (err) {
          console.error('Frame error:', err);
        }
      }

      setTimeout(processFrame, 50);
    };

    if (videoPlayer.readyState >= 2) {
      processFrame();
    } else {
      videoPlayer.addEventListener('canplay', processFrame, { once: true });
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => location.reload());
}

// ========== 분석 함수들 ==========

// 각도 계산
function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

// 동작 인식
function detectMotionType() {
  let tilts = [];
  let knees = [];

  poseResults.forEach(frame => {
    const shoulder = frame.landmarks[11];
    const hip = frame.landmarks[23];
    const knee = frame.landmarks[25];
    const ankle = frame.landmarks[27];

    if (shoulder && hip) {
      tilts.push((shoulder.x - hip.x) * 100);
    }

    if (hip && knee && ankle) {
      knees.push(calculateAngle(hip, knee, ankle));
    }
  });

  const avgTilt = Math.abs(tilts.reduce((a, b) => a + b) / tilts.length);
  const avgKnee = knees.reduce((a, b) => a + b) / knees.length;

  if (avgKnee < 135 && avgTilt > 10) {
    return {
      type: 'DRIBBLING',
      name: '드리블',
      desc: '드리블 시에는 중심을 낮추고 상체를 숙이는 게 정상입니다. 무릎 120°, 상체 15° 기울기가 일반적입니다.',
      normalRanges: {
        tilt: { min: 8, max: 20 },
        knee: { min: 110, max: 140 }
      }
    };
  } else if (avgKnee > 150 && avgTilt < 8) {
    return {
      type: 'PASSING',
      name: '패스/주행',
      desc: '패스나 일반 달리기에서는 상체가 거의 수직이어야 합니다. 무릎 150° 이상, 상체 5° 이내가 이상적입니다.',
      normalRanges: {
        tilt: { min: -3, max: 8 },
        knee: { min: 140, max: 170 }
      }
    };
  } else if (avgTilt > 15) {
    return {
      type: 'SHOOTING',
      name: '슛',
      desc: '슛 동작에서는 백스윙으로 상체가 뒤로 젖혀지고, 축발 무릎이 깊게 굽혀집니다.',
      normalRanges: {
        tilt: { min: 10, max: 35 },
        knee: { min: 80, max: 120 }
      }
    };
  } else {
    return {
      type: 'GENERAL',
      name: '일반 움직임',
      desc: '일반적인 움직임 패턴입니다.',
      normalRanges: {
        tilt: { min: -5, max: 5 },
        knee: { min: 130, max: 170 }
      }
    };
  }
}

// 좌우 밸런스 분석
function analyzeBalance() {
  let leftDown = 0, rightDown = 0;
  let leftKneeAngles = [], rightKneeAngles = [];

  poseResults.forEach(frame => {
    const leftAnkle = frame.landmarks[27];
    const rightAnkle = frame.landmarks[28];
    
    if (leftAnkle && rightAnkle) {
      if (leftAnkle.y > rightAnkle.y) leftDown++;
      else rightDown++;
    }

    // 좌우 무릎 각도
    const lh = frame.landmarks[23], lk = frame.landmarks[25], la = frame.landmarks[27];
    if (lh && lk && la) leftKneeAngles.push(calculateAngle(lh, lk, la));

    const rh = frame.landmarks[24], rk = frame.landmarks[26], ra = frame.landmarks[28];
    if (rh && rk && ra) rightKneeAngles.push(calculateAngle(rh, rk, ra));
  });

  const total = leftDown + rightDown;
  const leftPct = (leftDown / total) * 100;
  const rightPct = (rightDown / total) * 100;
  const imbalance = Math.abs(leftPct - rightPct);
  const score = Math.max(0, 100 - (imbalance * 2));

  const leftKneeAvg = leftKneeAngles.reduce((a, b) => a + b) / leftKneeAngles.length;
  const rightKneeAvg = rightKneeAngles.reduce((a, b) => a + b) / rightKneeAngles.length;
  const kneeAsymmetry = Math.abs(leftKneeAvg - rightKneeAvg);

  return {
    score,
    leftPct: leftPct.toFixed(1),
    rightPct: rightPct.toFixed(1),
    imbalance: imbalance.toFixed(1),
    leftKneeAvg,
    rightKneeAvg,
    kneeAsymmetry
  };
}

// 무릎 각도 분석
function analyzeKnee() {
  let allAngles = [];
  let leftAngles = [];
  let rightAngles = [];

  poseResults.forEach(frame => {
    const lh = frame.landmarks[23], lk = frame.landmarks[25], la = frame.landmarks[27];
    if (lh && lk && la) {
      const angle = calculateAngle(lh, lk, la);
      allAngles.push(angle);
      leftAngles.push(angle);
    }

    const rh = frame.landmarks[24], rk = frame.landmarks[26], ra = frame.landmarks[28];
    if (rh && rk && ra) {
      const angle = calculateAngle(rh, rk, ra);
      allAngles.push(angle);
      rightAngles.push(angle);
    }
  });

  const avg = allAngles.reduce((a, b) => a + b) / allAngles.length;
  const min = Math.min(...allAngles);
  const max = Math.max(...allAngles);
  const leftAvg = leftAngles.reduce((a, b) => a + b) / leftAngles.length;
  const rightAvg = rightAngles.reduce((a, b) => a + b) / rightAngles.length;
  const asymmetry = Math.abs(leftAvg - rightAvg);

  return { avg, min, max, leftAvg, rightAvg, asymmetry };
}

// 상체 기울기 분석
function analyzePosture() {
  let tilts = [];
  let wobbles = [];

  poseResults.forEach(frame => {
    const shoulder = frame.landmarks[11];
    const hip = frame.landmarks[23];
    
    if (shoulder && hip) {
      const tilt = (shoulder.x - hip.x) * 100;
      tilts.push(tilt);
    }
  });

  const avgTilt = tilts.reduce((a, b) => a + b) / tilts.length;
  
  // 흔들림 계산 (표준편차)
  const mean = avgTilt;
  const variance = tilts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / tilts.length;
  const wobble = Math.sqrt(variance);

  return { avgTilt, wobble };
}

// 착지 안정성 분석
function analyzeLanding() {
  let leftShakes = [];
  let rightShakes = [];

  for (let i = 1; i < poseResults.length; i++) {
    const prevLeft = poseResults[i - 1].landmarks[27];
    const currLeft = poseResults[i].landmarks[27];
    if (prevLeft && currLeft) {
      leftShakes.push(Math.abs(currLeft.y - prevLeft.y));
    }

    const prevRight = poseResults[i - 1].landmarks[28];
    const currRight = poseResults[i].landmarks[28];
    if (prevRight && currRight) {
      rightShakes.push(Math.abs(currRight.y - prevRight.y));
    }
  }

  const leftShake = leftShakes.reduce((a, b) => a + b) / leftShakes.length;
  const rightShake = rightShakes.reduce((a, b) => a + b) / rightShakes.length;
  const avgShake = (leftShake + rightShake) / 2;

  return { avgShake, leftShake, rightShake };
}

// ========== 솔루션 데이터베이스 ==========

function getSolution(balance, knee, posture, landing) {
  const problems = [];
  
  // 문제 식별
  if (balance.imbalance > 15) problems.push('BALANCE');
  if (knee.avg < 130) problems.push('KNEE_BENT');
  if (knee.avg > 170) problems.push('KNEE_STRAIGHT');
  if (Math.abs(posture.avgTilt) > 12) problems.push('POSTURE');
  if (landing.avgShake > 0.050) problems.push('ANKLE');

  console.log('문제 식별:', problems);

  // ========== 케이스별 솔루션 매칭 ==========

  // 복합 문제 (3개 이상)
  if (problems.length >= 3) {
    return {
      rootCause: '🔴 연쇄 문제 감지',
      diagnosis: `
${problems.length}개 부위에서 동시 문제 발생.
한 부위 약점이 다른 부위로 연쇄 반응을 일으킨 상태입니다.`,
      risk: `
🚨 이 패턴 지속 시:
  • 부상 발생 확률 5배 이상 증가
  • 한 부위만 개선해도 다른 곳에서 재발
  • 전신 보상 동작으로 만성화 위험`,
      exercises: [
        { week: 1, focus: '발목/착지', detail: '카프 레이즈 20회 x 3 + 한발 균형 30초 x 3', why: '가장 급한 부상 위험 차단' },
        { week: 2, focus: '무릎 폼', detail: '스쿼트 깊이 교정 + 햄스트링 스트레칭', why: '중심 안정성 확보' },
        { week: 3, focus: '밸런스', detail: '보수볼 훈련 + 약한 발 집중', why: '좌우 균형 맞추기' },
        { week: 4, focus: '통합', detail: '전체 동작 재학습 + 재촬영', why: '개선 확인' }
      ],
      expert: '⚠️ 스포츠 물리치료사 또는 퍼스널 트레이너 상담 권장',
      timeline: '4주 단계별 접근 필수'
    };
  }

  // ========== 밸런스 + 무릎 조합 ==========
  if (problems.includes('BALANCE') && problems.includes('KNEE_BENT')) {
    // 원인 파악: 어느 쪽 무릎이 더 굽혀졌나?
    const weakerSide = balance.leftKneeAvg < balance.rightKneeAvg ? '오른쪽' : '왼쪽';
    const strongerSide = weakerSide === '오른쪽' ? '왼쪽' : '오른쪽';

    return {
      rootCause: `${weakerSide} 무릎 유연성 부족`,
      diagnosis: `
${weakerSide} 무릎이 덜 굽혀져서 ${strongerSide}에 체중이 쏠립니다.
(${weakerSide} 무릎: ${weakerSide === '오른쪽' ? Math.round(balance.rightKneeAvg) : Math.round(balance.leftKneeAvg)}° vs ${strongerSide}: ${strongerSide === '오른쪽' ? Math.round(balance.rightKneeAvg) : Math.round(balance.leftKneeAvg)}°)`,
      risk: `
⚠️ 이 패턴 지속 시:
  • ${strongerSide} 무릎 연골 조기 마모
  • ${weakerSide} 근력 저하 → 방향 전환 시 부상
  • 골반 보상 동작 → 허리 통증 유발`,
      exercises: [
        { name: `${weakerSide} 무릎 유연성`, detail: `런지 (${weakerSide}만) 12회 x 3`, priority: 1, why: '굽힘 각도 증가시켜 체중 분산' },
        { name: `${weakerSide} 근력 강화`, detail: `싱글 레그 스쿼트 8회 x 3`, priority: 2, why: '약한 쪽 강화' },
        { name: '밸런스 통합', detail: '보수볼 위 스쿼트 30초 x 3', priority: 3, why: '양쪽 균형 맞추기' }
      ],
      timeline: '3주 집중 → 밸런스 25% 개선 예상'
    };
  }

  // ========== 밸런스 + 발목 조합 ==========
  if (problems.includes('BALANCE') && problems.includes('ANKLE')) {
    const weakAnkleSide = landing.leftShake > landing.rightShake ? '왼쪽' : '오른쪽';
    const strongAnkleSide = weakAnkleSide === '왼쪽' ? '오른쪽' : '왼쪽';

    return {
      rootCause: `${weakAnkleSide} 발목 불안정`,
      diagnosis: `
${weakAnkleSide} 발목이 불안정해서 무의식적으로 ${strongAnkleSide}에 체중을 실고 있습니다.
(${weakAnkleSide} 흔들림: ${(weakAnkleSide === '왼쪽' ? landing.leftShake : landing.rightShake).toFixed(3)} vs ${strongAnkleSide}: ${(strongAnkleSide === '왼쪽' ? landing.leftShake : landing.rightShake).toFixed(3)})`,
      risk: `
🚨 이 패턴 지속 시:
  • ${weakAnkleSide} 발목 염좌 반복 → 만성 불안정
  • ${strongAnkleSide} 과부하 → 피로 골절 위험
  • 방향 전환 시 ${weakAnkleSide} 회피 → 플레이 제한`,
      exercises: [
        { name: `${weakAnkleSide} 발목 강화`, detail: `한발 카프 레이즈 (${weakAnkleSide}만) 20회 x 3`, priority: 1, why: '약한 발목 집중 강화' },
        { name: `${weakAnkleSide} 안정성`, detail: `${weakAnkleSide} 한발로 서서 공 받기 30초 x 5`, priority: 1, why: '실전 안정성 훈련' },
        { name: '테이핑', detail: `경기 시 ${weakAnkleSide} 발목 테이핑`, priority: 1, why: '즉시 부상 예방' }
      ],
      timeline: '2주 집중 강화 → 발목 안정 시 밸런스 자동 개선'
    };
  }

  // ========== 무릎 + 발목 조합 ==========
  if (problems.includes('KNEE_BENT') && problems.includes('ANKLE')) {
    return {
      rootCause: '무릎 과굽힘으로 인한 발목 충격 증가',
      diagnosis: `
무릎을 과도하게 구부려(평균 ${Math.round(knee.avg)}°) 착지 충격이 
발목에 집중되고 있습니다.`,
      risk: `
🚨 이 패턴 지속 시:
  • 발목이 무릎 충격 흡수 역할 → 아킬레스건 과부하
  • 슬개건 + 발목 동시 손상 위험
  • 점프 착지 시 복합 부상 가능성`,
      exercises: [
        { name: '무릎 각도 교정', detail: '착지 시 무릎 130° 이상 유지 연습', priority: 1, why: '근본 원인 제거' },
        { name: '햄스트링 유연성', detail: '누워서 다리 들기 스트레칭 30초 x 3', priority: 1, why: '무릎 각도 개선' },
        { name: '발목 보조 강화', detail: '카프 레이즈 15회 x 3', priority: 2, why: '충격 흡수 능력 향상' }
      ],
      timeline: '무릎 교정 우선 → 2주 후 발목 부담 자동 감소'
    };
  }

  // ========== 상체 + 코어 문제 ==========
  if (problems.includes('POSTURE')) {
    if (posture.wobble > 5) {
      return {
        rootCause: '코어 약화로 인한 상체 불안정',
        diagnosis: `
상체 흔들림이 크게 나타납니다(표준편차 ${posture.wobble.toFixed(1)}°).
코어 근력 부족으로 중심을 잡지 못하는 상태입니다.`,
        risk: `
⚠️ 이 패턴 지속 시:
  • 요추 과부하 → 허리 디스크 위험
  • 상체 흔들림 → 발목까지 연쇄 불안정
  • 경기 중 충돌 시 부상 위험 증가`,
        exercises: [
          { name: '코어 안정화', detail: '플랭크 40초 x 3 (매일 아침)', priority: 1, why: '모든 문제의 핵심' },
          { name: '측면 코어', detail: '사이드 플랭크 30초 x 3 (좌우)', priority: 1, why: '회전 안정성' },
          { name: '동적 코어', detail: '데드버그 12회 x 3', priority: 2, why: '움직임 중 안정성' }
        ],
        timeline: '2주 코어 집중 → 전신 안정성 30% 개선'
      };
    } else {
      return {
        rootCause: '자세 습관 문제',
        diagnosis: `
상체 기울기가 ${Math.round(Math.abs(posture.avgTilt))}°로 
치우쳐 있지만, 흔들림은 적어 구조적 문제보다는 
습관적 자세로 판단됩니다.`,
        risk: `
⚠️ 장기적 위험:
  • 습관 고착화 → 근육 불균형 발전
  • 한쪽 척추 근육만 과긴장 → 통증`,
        exercises: [
          { name: '자세 의식', detail: '거울 앞에서 폼 확인 (주 3회)', priority: 1, why: '시각적 피드백' },
          { name: '반대 방향 스트레칭', detail: posture.avgTilt > 0 ? '등 펴기 운동' : '복근 스트레칭', priority: 2 }
        ],
        timeline: '2주 의식 개선 → 자세 자동 교정'
      };
    }
  }

  // ========== 발목 단독 문제 ==========
  if (problems.includes('ANKLE') && problems.length === 1) {
    return {
      rootCause: '발목 자체의 안정성 부족',
      diagnosis: `
다른 부위는 양호하나 발목 흔들림만 기준치 초과.
발목 주변 근력 약화 또는 과거 부상 이력 가능성.`,
      risk: `
🚨 이 패턴 지속 시:
  • 발목 염좌 발생 확률 3배 증가
  • 아킬레스건 누적 피로 → 파열 위험
  • 만성 발목 불안정성으로 발전`,
      exercises: [
        { name: '발목 강화', detail: '카프 레이즈 25회 x 3 (매일)', priority: 1, why: '직접 원인 해결' },
        { name: '고유 수용 감각', detail: '한발 서기 (눈 감고) 30초 x 3', priority: 1, why: '신경-근육 연결 강화' },
        { name: '동적 안정성', detail: '한발 착지 후 3초 정지 x 10회', priority: 2, why: '실전 안정성' },
        { name: '예방', detail: '경기 시 테이핑 또는 보호대', priority: 1, why: '즉시 보호' }
      ],
      timeline: '4주 집중 훈련 → 안정성 40~50% 개선'
    };
  }

  // ========== 무릎 단독 문제 ==========
  if (problems.includes('KNEE_BENT') && problems.length === 1) {
    return {
      rootCause: '무릎 과굽힘 패턴',
      diagnosis: `
평균 무릎 각도 ${Math.round(knee.avg)}°로 과도하게 굽혀져 있습니다.
햄스트링 단축 또는 잘못된 스쿼트 폼 학습 가능성.`,
      risk: `
🚨 이 패턴 지속 시:
  • 슬개건염(Jumper's Knee) 발생률 4배 ↑
  • 대퇴사두근 만성 긴장 → 근육 파열
  • 점프 동작 시 무릎 앞쪽 통증 발생`,
      exercises: [
        { name: '햄스트링 유연성', detail: '누워서 다리 들기 스트레칭 40초 x 3', priority: 1, why: '무릎 각도 개선' },
        { name: '폼 재교육', detail: '거울 앞 스쿼트 (130° 유지 연습)', priority: 1, why: '올바른 동작 학습' },
        { name: '폼롤러', detail: '햄스트링 + 종아리 마사지', priority: 2, why: '근막 이완' }
      ],
      timeline: '2주 유연성 개선 → 무릎 각도 10~15° 증가'
    };
  }

  // ========== 밸런스만 문제 (단독) ==========
  if (problems.includes('BALANCE') && problems.length === 1) {
    // 세부 원인 파악
    if (balance.kneeAsymmetry > 5) {
      const bentSide = balance.leftKneeAvg < balance.rightKneeAvg ? '왼쪽' : '오른쪽';
      return {
        rootCause: `${bentSide} 무릎이 더 굽혀져 체중 편중`,
        diagnosis: `
좌우 무릎 각도 차이: ${balance.kneeAsymmetry.toFixed(1)}°
${bentSide} 무릎이 더 많이 굽혀져서 자연스럽게 체중이 실립니다.`,
        risk: `
⚠️ 이 패턴 지속 시:
  • ${bentSide} 과부하 → 연골 마모
  • 반대쪽 근력 저하 → 급격한 움직임 시 부상`,
        exercises: [
          { name: `${bentSide} 유연성`, detail: `런지 깊이 증가 (${bentSide}만)`, priority: 1, why: '각도 균형 맞추기' },
          { name: '의식 개선', detail: `양쪽 무릎 동일 각도 유지 연습`, priority: 2 }
        ],
        timeline: '2주 → 무릎 대칭도 개선되면 밸런스 자동 해결'
      };
    } else {
      return {
        rootCause: '습관적 편측 선호',
        diagnosis: `
신체적 문제는 발견 안 됐으나 ${balance.leftPct > balance.rightPct ? '왼발' : '오른발'}을 
${Math.max(balance.leftPct, balance.rightPct).toFixed(1)}% 사용 중입니다.
과거 부상 또는 주발 선호 습관으로 추정.`,
        risk: `
⚠️ 장기적 위험:
  • 약한 쪽 근육 퇴화 (사용 안 해서)
  • 습관 고착 → 향후 구조적 문제로 발전`,
        exercises: [
          { name: '약한 발 강제 사용', detail: '훈련 시 약한 발로만 패스 30분', priority: 1, why: '사용 빈도 강제 증가' },
          { name: '밸런스 보드', detail: '보수볼 위 양발 교대 10회 x 3', priority: 2 },
          { name: '기록', detail: '경기 중 약한 발 사용 횟수 카운트', priority: 3, why: '의식 개선' }
        ],
        timeline: '6주 습관 교정 집중'
      };
    }
  }

  // ========== 상체 + 발목 조합 (코어 연쇄) ==========
  if (problems.includes('POSTURE') && problems.includes('ANKLE')) {
    return {
      rootCause: '코어 약화로 인한 전신 불안정',
      diagnosis: `
상체가 흔들리면서(${posture.wobble.toFixed(1)}°) 발목까지 
영향을 받는 연쇄 불안정 패턴입니다.`,
      risk: `
🚨 이 패턴 지속 시:
  • 상체 흔들림 → 하체 보상 → 발목 과부하
  • 코어 약화 → 충돌 시 부상 위험 증가
  • 허리-골반-발목 연쇄 통증 발생`,
      exercises: [
        { name: '코어 집중', detail: '플랭크 45초 x 3 (매일 필수)', priority: 1, why: '근본 원인 해결' },
        { name: '동적 코어', detail: '버드독 12회 x 3', priority: 1, why: '움직임 중 안정성' },
        { name: '발목 보조', detail: '카프 레이즈 15회 x 3', priority: 2, why: '코어 안정되면 발목 부담 자동 감소' }
      ],
      timeline: '3주 코어 강화 → 상체+발목 동시 개선'
    };
  }

  // ========== 무릎만 문제 (과신전) ==========
  if (problems.includes('KNEE_STRAIGHT') && problems.length === 1) {
    return {
      rootCause: '무릎 과신전 (너무 펴짐)',
      diagnosis: `
평균 무릎 각도 ${Math.round(knee.avg)}°로 너무 펴져 있습니다.
햄스트링 과긴장 또는 발목 경직 보상 가능성.`,
      risk: `
⚠️ 이 패턴 지속 시:
  • 햄스트링 만성 긴장 → 파열 위험
  • 무릎 뒤쪽 압박 → 반월상연골 손상
  • 뒤꿈치 착지 충격 2배 증가`,
      exercises: [
        { name: '햄스트링 이완', detail: '폼롤러 마사지 5분 (매일)', priority: 1 },
        { name: '무릎 굽힘 연습', detail: '런지 깊이 증가 (벽 터치)', priority: 1 },
        { name: '발목 체크', detail: '발목 유연성 확인 → 경직 시 스트레칭', priority: 2 }
      ],
      timeline: '2주 → 무릎 각도 5~10° 감소 목표'
    };
  }

  // ========== 문제 없음 ==========
  if (problems.length === 0) {
    return {
      rootCause: '✅ 문제 없음',
      diagnosis: '현재 측정된 모든 지표가 정상 범위 내에 있습니다.',
      risk: '위험 없음',
      exercises: [
        { name: '현 상태 유지', detail: '지금 하는 훈련 그대로 지속', priority: 1 },
        { name: '정기 체크', detail: '한 달에 한 번 재촬영으로 추적', priority: 2 }
      ],
      timeline: '정기 모니터링'
    };
  }

  // 기본 반환 (예외 처리)
  return {
    rootCause: '복합 문제',
    diagnosis: '여러 요인이 복합적으로 작용',
    risk: '개별 항목 참조',
    exercises: [],
    timeline: '단계별 접근'
  };
}

// ========== 결과 계산 (메인 함수) ==========

function calculateResults() {
  console.log('📊 분석 시작:', poseResults.length, '프레임');

  // 각 부위 분석
  const motion = detectMotionType();
  const balance = analyzeBalance();
  const knee = analyzeKnee();
  const posture = analyzePosture();
  const landing = analyzeLanding();

  // AI 솔루션 생성
  const solution = getSolution(balance, knee, posture, landing);

  // ========== HTML 생성 ==========
  
  const html = `
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
      <h3 style="margin-bottom: 0.5rem;">🎬 감지된 동작: ${motion.name}</h3>
      <p style="font-size: 0.9rem; opacity: 0.95; line-height: 1.5;">${motion.desc}</p>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h4 style="color: #92400e; margin-bottom: 0.75rem;">🔍 근본 원인</h4>
      <p style="color: #78350f; font-weight: 600; margin-bottom: 0.5rem;">${solution.rootCause}</p>
      <p style="color: #78350f; font-size: 0.9rem; line-height: 1.6;">${solution.diagnosis}</p>
    </div>

    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h4 style="color: #991b1b; margin-bottom: 0.75rem;">🚨 이 패턴 지속 시 위험</h4>
      <div style="color: #7f1d1d; font-size: 0.9rem; line-height: 1.8; white-space: pre-line;">${solution.risk}</div>
    </div>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h4 style="color: #1e40af; margin-bottom: 1rem;">💊 맞춤 솔루션</h4>
      ${solution.exercises.map((ex, idx) => `
        <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; border: 1px solid #dbeafe;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700;">${idx + 1}</span>
            <strong style="color: #1e293b;">${ex.name}</strong>
            ${ex.priority === 1 ? '<span style="background: #fecaca; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">긴급</span>' : ''}
          </div>
          <div style="color: #475569; font-size: 0.9rem; margin-bottom: 0.25rem;">📋 ${ex.detail}</div>
          <div style="color: #64748b; font-size: 0.85rem;">💡 이유: ${ex.why || '개선 효과'}</div>
        </div>
      `).join('')}
      ${solution.expert ? `<div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin-top: 1rem; color: #78350f; font-size: 0.9rem;">${solution.expert}</div>` : ''}
    </div>

    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h4 style="color: #166534; margin-bottom: 0.75rem;">📈 예상 효과</h4>
      <p style="color: #166534; font-size: 0.9rem; line-height: 1.6;">${solution.timeline}</p>
    </div>

    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px;">
      <h4 style="margin-bottom: 1rem;">📊 상세 측정값</h4>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 0.9rem;">
        <div>
          <div style="color: #64748b;">좌우 밸런스</div>
          <div style="font-weight: 700; color: #0f172a;">왼발 ${balance.leftPct}% / 오른발 ${balance.rightPct}%</div>
        </div>
        <div>
          <div style="color: #64748b;">무릎 각도</div>
          <div style="font-weight: 700; color: #0f172a;">평균 ${Math.round(knee.avg)}° (${Math.round(knee.min)}~${Math.round(knee.max)}°)</div>
        </div>
        <div>
          <div style="color: #64748b;">상체 기울기</div>
          <div style="font-weight: 700; color: #0f172a;">${posture.avgTilt > 0 ? '앞으로' : '뒤로'} ${Math.abs(posture.avgTilt).toFixed(1)}°</div>
        </div>
        <div>
          <div style="color: #64748b;">발목 흔들림</div>
          <div style="font-weight: 700; color: #0f172a;">${landing.avgShake.toFixed(3)} (기준: 0.03)</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 2rem; padding: 1rem; background: #f1f5f9; border-radius: 8px; text-align: center;">
      <p style="font-size: 0.9rem; color: #475569;">
        💾 이 결과를 저장하고, <strong>${solution.timeline.includes('주') ? solution.timeline.match(/\d+/)[0] : '4'}주 후</strong> 같은 동작을 다시 촬영하여<br>
        개선도를 비교해보세요!
      </p>
    </div>
  `;

  resultBox.innerHTML = html;
  
  console.log('✅ AI 코치 분석 완료');
}

// ========== 초기화 ==========

window.addEventListener('load', () => {
  if (canvas && ctx) {
    canvas.width = 640;
    canvas.height = 480;
        ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('동영상을 선택해주세요', 320, 240);
  }

  setTimeout(initializePose, 1000);
});



