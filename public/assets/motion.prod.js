/* motion.js - 수정 버전 */

console.log('🔍 Motion.js 로드됨');

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

let selectedFile = null;
let poseResults = [];
let poseAnalyzer = null;

// MediaPipe 초기화
function initializePose() {
  if (typeof Pose === 'undefined') {
    console.warn('MediaPipe 대기 중...');
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
    console.log('✅ MediaPipe 초기화 완료');
  } catch (err) {
    console.error('MediaPipe 초기화 실패:', err);
    alert('AI 모델 로딩에 실패했습니다. 페이지를 새로고침해주세요.');
  }
}

function onPoseResults(results) {
  if (!ctx || !canvas) return;
  
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4
    });
    
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 2,
      radius: 5
    });

    poseResults.push({
      landmarks: results.poseLandmarks,
      timestamp: Date.now()
    });
    
    console.log('✅ 프레임 저장:', poseResults.length);
  } else {
    console.warn('⚠️ 이 프레임에서 사람 미감지');
  }

  ctx.restore();
}

// 업로드 박스 클릭
if (uploadBox) {
  uploadBox.addEventListener('click', () => {
    console.log('업로드 박스 클릭');
    fileInput.click();
  });
}

// 파일 선택
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('동영상 파일만 업로드 가능합니다.');
      return;
    }

    console.log('파일 선택됨:', file.name);

    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    videoPlayer.load();
    
    uploadBox.classList.add('active');
    uploadBox.querySelector('.upload-text').textContent = '✅ 영상 선택됨';
    uploadBox.querySelector('.upload-subtext').textContent = file.name;
    
    videoWrapper.classList.add('show');
    analyzeBtn.disabled = false;
    resetBtn.style.display = 'inline-block';
    
    videoPlayer.addEventListener('loadedmetadata', () => {
      canvas.width = videoPlayer.videoWidth;
      canvas.height = videoPlayer.videoHeight;
      console.log('비디오 크기:', canvas.width, 'x', canvas.height);
    }, { once: true });
  });
}

// 분석 시작 (수정된 로직)
if (analyzeBtn) {
  analyzeBtn.addEventListener('click', async () => {
    console.log('=== 분석 시작 ===');
    
    if (!poseAnalyzer) {
      alert('AI 모델이 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    analyzeBtn.disabled = true;
    loading.style.display = 'block';
    resultBox.classList.remove('show');
    poseResults = [];

    videoPlayer.currentTime = 0;
    
    // ✅ 수정: requestVideoFrameCallback 또는 타이머 방식
    let isAnalyzing = true;
    let frameCount = 0;
    const maxFrames = 100; // 최대 100프레임
    
    videoPlayer.play();

    // 0.1초마다 프레임 캡처
    const captureFrame = setInterval(async () => {
      if (!isAnalyzing || videoPlayer.ended || frameCount >= maxFrames) {
        clearInterval(captureFrame);
        videoPlayer.pause();
        
        console.log('=== 분석 종료 ===');
        console.log('캡처된 프레임:', poseResults.length);
        
        // 0.5초 대기 후 결과 계산 (마지막 프레임 처리 시간 확보)
        setTimeout(() => {
          if (poseResults.length === 0) {
            alert('영상에서 사람을 감지하지 못했습니다. 전신이 화면에 나오는 영상을 사용해주세요.');
            loading.style.display = 'none';
            analyzeBtn.disabled = false;
            return;
          }
          
          calculateResults();
          loading.style.display = 'none';
          resultBox.classList.add('show');
          analyzeBtn.disabled = false;
        }, 500);
        
        return;
      }

      // MediaPipe로 현재 프레임 전송
      try {
        await poseAnalyzer.send({ image: videoPlayer });
        frameCount++;
      } catch (err) {
        console.error('프레임 분석 오류:', err);
      }
    }, 100); // 0.1초마다 (초당 10프레임)
  });
}

// 다시 선택
if (resetBtn) {
  resetBtn.addEventListener('click', () => location.reload());
}

// 결과 계산
function calculateResults() {
  console.log('📊 결과 계산 시작:', poseResults.length, '프레임');

  // 1. 좌우 밸런스 (수정된 로직: 어깨 기준)
  let leftShoulder총합 = 0;
  let rightShoulder총합 = 0;
  let 유효프레임 = 0;

  poseResults.forEach(frame => {
    const leftShoulder = frame.landmarks[11];
    const rightShoulder = frame.landmarks[12];
    
    if (leftShoulder && rightShoulder) {
      leftShoulder총합 += leftShoulder.y;
      rightShoulder총합 += rightShoulder.y;
      유효프레임++;
    }
  });

  const 평균차이 = Math.abs((leftShoulder총합 / 유효프레임) - (rightShoulder총합 / 유효프레임));
  const balanceScore = Math.max(0, Math.min(100, Math.round((1 - 평균차이 * 10) * 100)));
  
  document.getElementById('balance').textContent = balanceScore + '점';
  document.getElementById('balanceBar').style.width = balanceScore + '%';
  console.log('밸런스:', balanceScore);

  // 2. 무릎 각도
  let kneeAngles = [];
  
  poseResults.forEach(frame => {
    const leftHip = frame.landmarks[23];
    const leftKnee = frame.landmarks[25];
    const leftAnkle = frame.landmarks[27];
    
    if (leftHip && leftKnee && leftAnkle) {
      kneeAngles.push(calculateAngle(leftHip, leftKnee, leftAnkle));
    }
    
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
  
  document.getElementById('kneeAngle').textContent = avgKnee + '°';

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
  
  console.log('📊 계산 완료!');
}

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

// 초기화
window.addEventListener('load', () => {
  console.log('페이지 로드 완료');
  
  if (canvas && ctx) {
    canvas.width = 640;
    canvas.height = 480;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📹 동영상을 선택해주세요', 320, 240);
  }

  setTimeout(initializePose, 1000);
});
