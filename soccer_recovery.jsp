<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>⚽ 풋살/축구 컨디션 분석기 (JSP v1.0)</title>
    <style>
        /* [CSS] 모바일 최적화 스타일 */
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f7f9;padding:12px;color:#1a1a1a}
        .app-container{max-width:550px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 15px 35px rgba(0,0,0,0.1);overflow:hidden}
        .header-section{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;padding:30px 20px}
        .header-section h1{font-size:1.6rem;font-weight:900;margin-bottom:8px}
        .form-body{padding:20px}
        .input-card{margin-bottom:18px;padding:15px;background:#f8fafc;border-radius:18px}
        .input-card label{display:block;font-weight:800;margin-bottom:12px;font-size:0.95rem;color:#475569}
        .btn-group{display:flex;gap:10px}
        .toggle-btn{flex:1;padding:14px;border:2px solid #e2e8f0;border-radius:14px;background:#fff;font-weight:700;cursor:pointer;transition:0.2s}
        .toggle-btn.active{background:#4f46e5;color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(79,70,229,0.3)}
        .num-input{width:100%;padding:14px;font-size:1.6rem;text-align:center;border:2px solid #e2e8f0;border-radius:14px;font-weight:900}
        .custom-select{width:100%;padding:14px;font-size:1rem;border:2px solid #e2e8f0;border-radius:14px;background:#fff;font-weight:700}
        .pain-list{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
        .pain-item{display:flex;align-items:center;justify-content:center;padding:12px;border:1.5px solid #edf2f7;border-radius:12px;cursor:pointer;background:#fff}
        .pain-item input{display:none}
        .pain-item:has(input:checked){background:#eef2ff;border-color:#4f46e5;color:#4f46e5;font-weight:800}
        .submit-btn{width:100%;min-height:60px;background:#10b981;color:#fff;border:none;border-radius:20px;font-size:1.1rem;font-weight:900;cursor:pointer;margin-top:10px;box-shadow:0 8px 20px rgba(16,185,129,0.3)}
        #analysis-result{display:none;padding:20px;border-top:1px solid #f1f5f9;animation:slideIn 0.5s ease}
        @keyframes slideIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}
        .stat-box{text-align:center;background:#f1f5f9;padding:15px;border-radius:16px}
        .stat-val{font-size:1.3rem;font-weight:900;color:#ef4444}
        .recovery-note{background:#fff7ed;padding:15px;border-left:5px solid #f97316;border-radius:8px;font-size:0.9rem;line-height:1.6}
    </style>
</head>
<body>
    <div class="app-container">
        <div class="header-section">
            <h1>⚽ 풋살/축구 컨디션 분석</h1>
            <p>Science-based Recovery System</p>
        </div>

        <form id="analysis-form" class="form-body">
            <!-- 종목 선택 -->
            <div class="input-card">
                <label>🏃 운동 종목 선택</label>
                <div class="btn-group">
                    <button type="button" class="toggle-btn sport-sel active" data-val="futsal">🏠 풋살</button>
                    <button type="button" class="toggle-btn sport-sel" data-val="football">🌳 축구</button>
                </div>
            </div>

            <!-- 거리 입력 -->
            <div class="input-card">
                <label>📏 활동 거리 (km)</label>
                <input type="number" id="match-dist" class="num-input" value="3.8" step="0.1">
            </div>

            <!-- 시간 선택 (서버 사이드 방식 적용) -->
            <div class="input-card">
                <label>⏱️ 경기 상세 시간</label>
                <select id="match-duration" class="custom-select">
                    <optgroup label="🏠 풋살 전용" id="opt-futsal">
                        <option value="60">15분 x 4쿼터 (60분)</option>
                        <option value="90">15분 x 6쿼터 (90분)</option>
                        <option value="120">20분 x 6쿼터 (120분)</option>
                    </optgroup>
                    <optgroup label="🌳 축구 전용" id="opt-football" style="display:none;">
                        <option value="90">45분 x 2쿼터 (90분)</option>
                        <option value="100">25분 x 4쿼터 (100분)</option>
                        <option value="150">25분 x 6쿼터 (150분)</option>
                    </optgroup>
                </select>
            </div>

            <!-- 통증 부위 -->
            <div class="input-card">
                <label>🩹 불편한 부위 (다중 선택)</label>
                <div class="pain-list">
                    <label class="pain-item"><input type="checkbox" name="pain" value="calf"><span>종아리</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="knee"><span>무릎</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="hamstring"><span>햄스트링</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="none" checked><span>통증 없음</span></label>
                </div>
            </div>

            <button type="submit" class="submit-btn">📊 맞춤 회복 리포트 생성</button>
        </form>

        <!-- 결과 영역 -->
        <div id="analysis-result">
            <div class="stat-grid">
                <div class="stat-box"><div class="stat-val" id="out-dist">-</div><div>활동량</div></div>
                <div class="stat-box"><div class="stat-val" id="out-load">-</div><div>부하 지수</div></div>
                <div class="stat-box"><div class="stat-val" id="out-ready">-</div><div>준비도</div></div>
            </div>
            <div class="recovery-note">
                <strong>🍎 영양 및 파워젤 추천:</strong><br>
                <span id="out-nutrition">분석 중...</span>
            </div>
            <div id="history-box" style="margin-top:20px; font-size:0.85rem; color:#64748b;">
                <strong>📋 최근 5회 기록:</strong>
                <div id="history-content"></div>
                <button id="del-history" style="width:100%; margin-top:10px; padding:8px; border:none; border-radius:10px; cursor:pointer;">기록 전체 삭제</button>
            </div>
        </div>
    </div>

    <script>
        const MULTI = { calf: 1.3, knee: 1.5, hamstring: 1.45, none: 1.0 };

        document.addEventListener('DOMContentLoaded', () => {
            // 종목 전환 시 시간 선택창 동기화
            document.querySelectorAll('.sport-sel').forEach(btn => {
                btn.addEventListener('click', e => {
                    document.querySelectorAll('.sport-sel').forEach(x => x.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    const sport = e.currentTarget.dataset.val;
                    const isFutsal = sport === 'futsal';
                    document.getElementById('opt-futsal').style.display = isFutsal ? 'block' : 'none';
                    document.getElementById('opt-football').style.display = isFutsal ? 'none' : 'block';
                    document.getElementById('match-duration').value = isFutsal ? "60" : "90";
                });
            });

            // 히스토리 삭제 기능 (즉각 반영)
            document.getElementById('del-history').addEventListener('click', () => {
                if(confirm('모든 기록을 삭제하시겠습니까?')) {
                    localStorage.removeItem('matchHistory');
                    renderHistory();
                }
            });

            // 폼 분석 로직
            document.getElementById('analysis-form').addEventListener('submit', e => {
                e.preventDefault();
                const dist = parseFloat(document.getElementById('match-dist').value || "3.8");
                const duration = parseInt(document.getElementById('match-duration').value, 10);
                let mult = 1.0;
                document.querySelectorAll('input[name="pain"]:checked').forEach(cb => {
                    mult *= (MULTI[cb.value] || 1.15);
                });

                const load = Math.round(dist * duration * mult / 8);
                const ready = Math.max(30, 100 - Math.round(load / 5));

                // 결과 노출
                document.getElementById('out-dist').innerText = dist + "km";
                document.getElementById('out-load').innerText = load;
                document.getElementById('out-ready').innerText = ready + "%";
                document.getElementById('out-nutrition').innerText = 
                    duration >= 90 ? "킥오프 전 1개 + 후반전 시작 전 1개 추천" : "킥오프 10분 전 1개 추천";
                
                document.getElementById('analysis-result').style.display = 'block';
                document.getElementById('analysis-result').scrollIntoView({behavior:'smooth'});

                saveHistory({ date: new Date().toLocaleDateString(), dist, load });
                renderHistory();
            });

            renderHistory();
        });

        function saveHistory(data) {
            let h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
            h.unshift(data);
            localStorage.setItem('matchHistory', JSON.stringify(h.slice(0, 5)));
        }

        function renderHistory() {
            const h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
            const box = document.getElementById('history-content');
            box.innerHTML = h.length ? h.map(i => `<div style="padding:5px 0; border-bottom:1px solid #eee;">${i.date} - ${i.dist}km (부하 ${i.load})</div>`).join('') : '데이터 없음';
        }
    </script>
</body>
</html>
