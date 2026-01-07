/* 
  motion.js
  AI 모션 분석 로직 (동영상 업로드 방식)
  ============================================
*/

// ========== DOM 요소 확인 ==========
console.log('🔍 DOM 체크 시작...');

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

// 필수 요소 존재 확인
if (!uploadBox) console.error('❌ uploadBox 없음');
if (!fileInput) console.error('❌ fileInput 없음');
if (!canvas) console.error('❌ canvas 없음');
if (!analyzeBtn) console.error('❌ analyzeBtn 없음');

console.log('✅ DOM 체크 완료:', {
  uploadBox: !!uploadBox,
  fileInput: !!fileInput,
  canvas: !!canvas,
  analyzeBtn: !!analyzeBtn
});

let selectedFile = null;
let poseResults = [];
let poseAnalyzer = null;

// ========== MediaPipe Pose 초기화 ==========
function initializePose() {
  if (typeof Pose === 'undefined') {
    console.warn('⏳ MediaPipe 대기 중...');
    setTimeout(initializePose, 500);
    return;
  }

  try {
    poseAnalyzer = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    poseAnalyzer.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    poseAnalyzer.onResults(onPoseResults);
    console.log('✅ MediaPipe Pose 초기화 완료');
  } catch (err) {
    console.error('❌ MediaPipe 초기화 실패:', err);
  }
}

// MediaPipe 결과 처리
function onPoseResults(results) {
  if (!ctx) return;
  
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    // 관절 연결선 (녹색)
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4
    });
    
    // 관절 점 (빨간색)
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 2,
      radius: 5
    });

    // 분석 데이터 저장
    poseResults.push({
      landmarks: results.poseLandmarks,
      timestamp: videoPlayer.currentTime
    });
  }

  ctx.restore();
}

// ========== 이벤트 핸들러 ==========

// 업로드 박스 클릭
if (uploadBox) {
  uploadBox.addEventListener('click', () => {
    console.log('📂 업로드 박스 클릭됨!');
    if (fileInput) {
      fileInput.click();
      console.log('📂 파일 선택창 열림');
    } else {
      console.error('❌ fileInput이 없습니다!');
    }
  });
  console.log('✅ uploadBox 이벤트 등록 완료');
} else {
  console.error('❌ uploadBox를 찾을 수 없습니다!');
}

// 파일 선택
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    console.log('📁 파일 선택 이벤트 발생:', e.target.files);
    
    const file = e.target.files[0];
    if (!file) {
      console.warn('⚠️ 파일이 선택되지 않음');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('video/')) {
      alert('동영상 파일만 업로드 가능합니다.');
      console.error('❌ 잘못된 파일 타입:', file.type);
      return;
    }

    // 파일 크기 체크 (100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 100MB 이하 영상을 선택해주세요.');
      console.error('❌ 파일 크기 초과:', file.size);
      return;
    }

    console.log('✅ 파일 검증 통과:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    selectedFile = file;
    const url = URL.createObjectURL(file);
    
    videoPlayer.src = url;
    videoPlayer.load();
    
    // UI 업데이트
    uploadBox.classList.add('active');
    uploadBox.querySelector('.upload-text').textContent = '✅ 영상 선택됨';
    uploadBox.querySelector('.upload-subtext').textContent = file.name;
    
    videoWrapper.classList.add('show');
    analyzeBtn.disabled = false;
    resetBtn.style.display = 'inline-block';
    
    // 캔버스 크기 설정
    videoPlayer.addEventListener('loadedmetadata', () => {
      canvas.width = videoPlayer.videoWidth;
      canvas.height = videoPlayer.videoHeight;
      console.log('📹 비디오 메타데이터 로드:', canvas.width, 'x', canvas.height);
    }, { once: true });
  });
  console.log('✅ fileInput 이벤트 등록 완료');
} else {
  console.error('❌ fileInput를 찾을 수 없습니다!');
}

// 분석 시작 버튼
if (analyzeBtn) {
  analyzeBtn.addEventListener('click', async () => {
    console.log('🔍 분석 시작 버튼 클릭!');
    
    if (!poseAnalyzer) {
      alert('AI 모델이 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      console.error('❌ poseAnalyzer가 초기화되지 않음');
      return;
    }

    analyzeBtn.disabled = true;
    loading.style.display = 'block';
    resultBox.classList.remove('show');
    poseResults = [];

    // 비디오 재생
    videoPlayer.currentTime = 0;
    videoPlayer.play();
    console.log('▶️ 비디오 재생 시작');

    // 프레임별 분석 (초당 10프레임)
    const fps = 10;
    const interval = 1000 / fps;
    let frameCount = 0;

    const analyzeInterval = setInterval(async () => {
      if (videoPlayer.ended || videoPlayer.paused) {
        clearInterval(analyzeInterval);
        
        console.log(`✅ 분석 완료 (총 ${frameCount}프레임 처리)`);
        
        // 결과 계산
        calculateResults();
        loading.style.display = 'none';
        resultBox.classList.add('show');
        analyzeBtn.disabled = false;
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        return;
      }

      // MediaPipe에 프레임 전송
      try {
        await poseAnalyzer.send({ image: videoPlayer });
        frameCount++;
      } catch (err) {
        console.error('❌ 프레임 분석 오류:', err);
      }
    }, interval);
  });
  console.log('✅ analyzeBtn 이벤트 등록 완료');
}

// 다시 선택 버튼
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    console.log('🔄 페이지 새로고침');
    location.reload();
  });
}

// ========== 분석 결과 계산 ==========

function calculateResults() {
  if (poseResults.length === 0) {
    alert('분석할 데이터가 없습니다. 영상이 너무 짧거나 사람이 감지되지 않았습니다.');
    console.error('❌ poseResults가 비어있음');
    return;
  }

  console.log(`📊 결과 계산 시작 (${poseResults.length}개 프레임)`);

  // 1. 좌우 밸런스 (왼발 vs 오른발)
  let leftWeight = 0;
  let rightWeight = 0;

  poseResults.forEach(frame => {
    const leftAnkle = frame.landmarks[27];
    const rightAnkle = frame.landmarks[28];
    
    if (leftAnkle && rightAnkle) {
      if (leftAnkle.y > rightAnkle.y) {
        leftWeight++;
      } else {
        rightWeight++;
      }
    }
  });

  const balanceScore = Math.round((Math.min(leftWeight, rightWeight) / poseResults.length) * 100);
  document.getElementById('balance').textContent = `${balanceScore}점`;
  document.getElementById('balanceBar').style.width = `${balanceScore}%`;
  console.log('✅ 밸런스:', balanceScore);

  // 2. 무릎 각도 (평균)
  let kneeAngles = [];
  
  poseResults.forEach(frame => {
    // 왼쪽 무릎
    const leftHip = frame.landmarks[23];
    const leftKnee = frame.landmarks[25];
    const leftAnkle = frame.landmarks[27];
    
    if (leftHip && leftKnee && leftAnkle) {
      kneeAngles.push(calculateAngle(leftHip, leftKnee, leftAnkle));
    }
    
    // 오른쪽 무릎
    const rightHip = frame.landmarks[24];
    const rightKnee = frame.landmarks[26];
    const rightAnkle = frame.landmarks[28];
    
    if (rightHip && rightKnee && rightAnkle) {
      kneeAngles.push(calculateAngle(rightHip, rightKnee, rightAnkle));
    }
  });

  const avgKnee = kneeAngles.length > 0 
    ? Math.round(kneeAngles.reduce((a, b) => a + b) / kneeAngles.length)
    : 0;
  
  document.getElementById('kneeAngle').textContent = `${avgKnee}°`;
  console.log('✅ 평균 무릎 각도:', avgKnee);

  // 3. 상체 기울기
  let tiltScores = [];
  
  poseResults.forEach(frame => {
    const shoulder = frame.landmarks[11];
    const hip = frame.landmarks[23];
    
    if (shoulder && hip) {
      tiltScores.push(Math.abs(shoulder.x - hip.x) * 100);
    }
  });

  const avgTilt = tiltScores.length > 0
    ? tiltScores.reduce((a, b) => a + b) / tiltScores.length
    : 0;
  
  const tiltGrade = avgTilt < 5 ? '우수' : avgTilt < 10 ? '보통' : '주의';
  document.getElementById('bodyTilt').textContent = tiltGrade;
  console.log('✅ 상체 기울기:', tiltGrade);

  // 4. 착지 안정성
  let movements = [];
  
  for (let i = 1; i < poseResults.length; i++) {
    const prev = poseResults[i - 1].landmarks[27];
    const curr = poseResults[i].landmarks[27];
    
    if (prev && curr) {
      movements.push(Math.abs(curr.y - prev.y));
    }
  }

  const avgMove = movements.length > 0
    ? movements.reduce((a, b) => a + b) / movements.length
    : 0;
  
  const stabilityGrade = avgMove < 0.02 ? '안정적' : avgMove < 0.05 ? '보통' : '불안정';
  document.getElementById('stability').textContent = stabilityGrade;
  console.log('✅ 착지 안정성:', stabilityGrade);

  console.log('📊 모든 결과 계산 완료!');
}

// ========== 유틸리티 함수 ==========

// 각도 계산 (3개 점을 이용한 각도)
function calculateAngle(pointA, pointB, pointC) {
  const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) 
                - Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
}

// ========== 페이지 초기화 ==========

window.addEventListener('load', () => {
  console.log('🚀 페이지 로드 완료');
  
  // 캔버스 초기 상태
  if (canvas && ctx) {
    canvas.width = 640;
    canvas.height = 480;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#64748b';
    ctx.font = '18px "Noto Sans KR"';
    ctx.textAlign = 'center';
    ctx.fillText('📹 동영상을 선택해주세요', 320, 240);
    console.log('✅ 캔버스 초기화 완료');
  }

  // MediaPipe 초기화 (1초 후)
  setTimeout(initializePose, 1000);
});
