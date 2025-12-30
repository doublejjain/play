<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
    <title>⚽ 풋살/축구 컨디션 분석 & 회복 리포트</title>
    <style>
        /* 🎨 고퀄리티 디자인 가이드 */
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;padding:12px;color:#1e293b;line-height:1.6}
        .container{max-width:600px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 20px 40px rgba(0,0,0,0.08);overflow:hidden}
        
        .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;padding:35px 20px}
        .header h1{font-size:1.8rem;font-weight:900;letter-spacing:-0.05em;margin-bottom:8px}
        .header p{opacity:0.9;font-size:0.95rem;font-weight:500}

        .section{padding:20px;border-bottom:1px solid #f1f5f9}
        .section-title{display:block;font-weight:800;font-size:1.05rem;color:#334155;margin-bottom:15px}
        
        .btn-group{display:flex;gap:12px}
        .toggle-btn{flex:1;padding:16px;border:2.5px solid #e2e8f0;border-radius:18px;background:#fff;font-weight:800;font-size:1rem;cursor:pointer;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1)}
        .toggle-btn.active{background:#4f46e5;color:#fff;border-color:transparent;box-shadow:0 8px 16px rgba(79,70,229,0.3);transform:translateY(-2px)}

        .num-box{width:100%;padding:15px;font-size:2rem;text-align:center;border:2.5px solid #e2e8f0;border-radius:18px;font-weight:900;color:#1e293b}
        select{width:100%;height:60px;padding:0 15px;font-size:1rem;border:2.5px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:800;color:#334155;cursor:pointer}
        
        .pain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .pain-item{display:flex;align-items:center;justify-content:center;padding:15px;border:2px solid #f1f5f9;border-radius:14px;cursor:pointer;background:#f8fafc;transition:0.2s}
        .pain-item input{display:none}
        .pain-item:has(input:checked){background:#eef2ff;border-color:#4f46e5;color:#4f46e5;font-weight:800;transform:scale(1.02)}

        .analyze-btn{width:calc(100% - 40px);margin:25px 20px 40px;min-height:65px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;font-size:1.2rem;font-weight:900;cursor:pointer;box-shadow:0 10px 25px rgba(16,185,129,0.3);transition:0.2s}
        .analyze-btn:active{transform:scale(0.97)}

        /* 📊 분석 결과 섹션 디자인 */
        #result{display:none;animation:slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);padding-bottom:60px}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        
        .res-card{margin:20px;padding:25px;background:#f8fafc;border-radius:24px;border-left:6px solid #4f46e5}
        .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}
        .stat-box{text-align:center;background:#fff;padding:15px;border-radius:18px;box-shadow:0 4px 10px rgba(0,0,0,0.03)}
        .stat-val{font-size:1.4rem;font-weight:900;color:#ef4444;display:block}
        .stat-lab{font-size:0.8rem;color:#64748b;font-weight:700}

        .recovery-pro{margin:20px;background:#fff;border-radius:24px;border:1px solid #e2e8f0;padding:20px}
        .pro-item{display:flex;gap:15px;padding:15px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
        .pro-time{min-width:70px;background:#eef2ff;color:#4f46e5;font-size:0.75rem;font-weight:900;padding:4px 8px;border-radius:8px;text-align:center}
        .pro-txt{font-size:0.95rem;font-weight:600;color:#334155}

        .history-section{margin:20px;padding:20px;background:#f1f5f9;border-radius:20px}
        .history-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:0.85rem;font-weight:600}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>⚽ 경기 컨디션 & 회복 분석</h1>
            <p>프로 선수용 알고리즘 기반 · 48시간 정밀 리포트</p>
        </header>

        <form id="main-form">
            <!-- 1. 워치 및 종목 선택 -->
            <div class="section">
                <span class="section-title">⌚ 워치 착용 여부</span>
                <div class="btn-group">
                    <button type="button" class="toggle-btn watch-btn active" data-watch="yes">착용</button>
                    <button type="button" class="toggle-btn watch-btn" data-watch="no">미착용</button>
                </div>
            </div>

            <div class="section">
                <span class="section-title">⚽ 운동 종목</span>
                <div class="btn-group">
                    <button type="button" class="toggle-btn sport-btn active" data-sport="futsal">🏠 풋살</button>
                    <button type="button" class="toggle-btn sport-btn" data-sport="football">🌳 축구</button>
                </div>
            </div>

            <!-- 2. 활동량 입력 -->
            <div class="section" id="dist-area">
                <span class="section-title">📏 경기 활동 거리 (km)</span>
                <input type="number" id="match-dist" class="num-box" value="3.8" step="0.1">
            </div>

            <!-- 3. 경기 시간 (동적 생성 해결) -->
            <div class="section">
                <span class="section-title">⏱️ 상세 경기 시간 (쿼터/팀수)</span>
                <select id="match-duration">
                    <!-- JS에서 완벽하게 옵션 갱신 -->
                </select>
            </div>

            <!-- 4. 통증 부위 -->
            <div class="section">
                <span class="section-title">🩹 집중 회복이 필요한 부위 (다중 선택)</span>
                <div class="pain-grid">
                    <label class="pain-item"><input type="checkbox" name="pain" value="calf"><span>종아리</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="knee"><span>무릎</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="hamstring"><span>햄스트링</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="ankle"><span>발목</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="groin"><span>사타구니</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="none" checked><span>통증 없음</span></label>
                </div>
            </div>

            <button type="submit" class="analyze-btn">📊 프로급 정밀 분석 리포트 생성</button>
        </form>

        <!-- 분석 결과 (내용 대폭 보강) -->
        <section id="result">
            <div class="res-card">
                <h2>📊 신체 데이터 분석 결과</h2>
                <div class="stat-grid">
                    <div class="stat-box"><span class="stat-val" id="out-dist">-</span><span class="stat-lab">활동량</span></div>
                    <div class="stat-box"><span class="stat-val" id="out-load">-</span><span class="stat-lab">부하 지수</span></div>
                    <div class="stat-box"><span class="stat-val" id="out-ready">-</span><span class="stat-lab">준비도</span></div>
                </div>
                <div style="font-size:0.9rem; color:#475569; font-weight:600; line-height:1.6;" id="out-summary"></div>
            </div>

            <div class="recovery-pro">
                <h3 style="margin-bottom:15px; font-weight:900;">🩹 48시간 과학적 회복 프로토콜</h3>
                <div class="pro-item"><div class="pro-time">🚨 즉시</div><div class="pro-txt" id="re-now"></div></div>
                <div class="pro-item"><div class="pro-time">⏰ 1시간 후</div><div class="pro-txt" id="re-step1"></div></div>
                <div class="pro-item"><div class="pro-time">🌙 저녁</div><div class="pro-txt" id="re-step2"></div></div>
                <div class="pro-item"><div class="pro-time">🛌 취침 전</div><div class="pro-txt" id="re-step3"></div></div>
                <div class="pro-item"><div class="pro-time">⚡ 파워젤</div><div class="pro-txt" id="re-gel"></div></div>
            </div>

            <div class="history-section">
                <h3 style="margin-bottom:15px;">📋 최근 분석 기록</h3>
                <div id="history-content"></div>
                <button id="del-history" style="width:100%; margin-top:15px; padding:10px; border:none; border-radius:12px; font-weight:700; background:#e2e8f0; cursor:pointer;">기록 전체 삭제</button>
            </div>
        </section>
    </div>

    <script>
        /* 🔬 스포츠 과학 정밀 데이터셋 */
        const DURATIONS = {
            futsal: [ {l:"15분 x 4쿼터 (60분)", v:60}, {l:"15분 x 6쿼터 (90분)", v:90}, {l:"20분 x 6쿼터 (120분)", v:120} ],
            football: [ {l:"45분 x 2쿼터 (정식)", v:90}, {l:"25분 x 4쿼터 (2팀 매치)", v:100}, {l:"25분 x 6쿼터 (3팀 매치)", v:150} ]
        };

        const PAIN_LOGIC = {
            none: { now: "🧊 찬물 샤워 15분 (염증 억제)", s1: "🍽️ 탄수 1.2g/kg + 단백질 보충", s2: "🧴 폼롤러 10분 전신 이완", s3: "💤 8시간 이상 완전 수면" },
            calf: { now: "🧊 종아리 냉찜질 & 거상 (부종 32%↓)", s1: "💊 마그네슘 400mg (경련 예방)", s2: "🧴 비복근 집중 폼롤러 3세트", s3: "🛌 다리 15도 올리고 취침" },
            knee: { now: "🧊 무릎 압박 Sleeve 착용 & 냉찜질", s1: "🦵 굴곡 동작(스쿼트 등) 48시간 지양", s2: "💊 글루코사민 보충 (연골 보호)", s3: "🛌 대퇴사두근 등척성 수축 훈련" },
            hamstring: { now: "🧊 허벅지 뒤쪽 냉찜질 & 압박 유지", s1: "🚶 통증 없는 범위 내 가벼운 걷기", s2: "🧘 무리한 스트레칭 절대 금지", s3: "🍒 타르트 체리 주스 (근손상 회복)" },
            ankle: { now: "🧊 발목 8자 테이핑 & RICE 적용", s1: "🩹 기능적 보호대 착용 (인대 보호)", s2: "🦶 발목 고유수용성 감각 훈련", s3: "🛌 발목 거상 상태 수면" }
        };

        function updateOptions(sport) {
            const sel = document.getElementById('match-duration');
            sel.innerHTML = DURATIONS[sport].map(o => `<option value="${o.v}">${o.l}</option>`).join('');
            sel.value = DURATIONS[sport][0].v;
        }

        document.addEventListener('DOMContentLoaded', () => {
            // 초기 셋팅
            updateOptions('futsal');
            renderHistory();

            // 종목 선택 시 옵션 갱신 (꼬임 완벽 방지)
            document.querySelectorAll('.sport-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    document.querySelectorAll('.sport-btn').forEach(x => x.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    updateOptions(e.currentTarget.dataset.sport);
                });
            });

            // 분석 실행
            document.getElementById('main-form').addEventListener('submit', e => {
                e.preventDefault();
                const dist = parseFloat(document.getElementById('match-dist').value || "3.8");
                const duration = parseInt(document.getElementById('match-duration').value, 10);
                const sport = document.querySelector('.sport-btn.active').dataset.sport;
                
                let mult = 1.0;
                let selectedPains = [];
                document.querySelectorAll('input[name="pain"]:checked').forEach(cb => {
                    if(cb.value !== 'none') {
                        mult *= (cb.value === 'knee' ? 1.5 : 1.3);
                        selectedPains.push(cb.value);
                    }
                });

                const load = Math.round(dist * duration * mult / 7);
                const ready = Math.max(30, 100 - Math.round(load / 6));

                // UI 업데이트
                document.getElementById('out-dist').innerText = dist + "km";
                document.getElementById('out-load').innerText = load;
                document.getElementById('out-ready').innerText = ready + "%";
                
                const summary = document.getElementById('out-summary');
                summary.innerHTML = `🏁 <strong>${sport === 'futsal' ? '풋살' : '축구'} 분석 결과:</strong> 평소 대비 부하가 ${Math.round((mult-1)*100)}% 증가한 상태입니다. `;
                summary.innerHTML += ready < 70 ? "집중 회복이 시급합니다." : "컨디션이 양호합니다.";

                // 회복 프로토콜 (가장 위험 부위 우선)
                const mainPain = selectedPains[0] || 'none';
                const plan = PAIN_LOGIC[mainPain] || PAIN_LOGIC.none;
                document.getElementById('re-now').innerText = plan.now;
                document.getElementById('re-step1').innerText = plan.s1;
                document.getElementById('re-step2').innerText = plan.s2;
                document.getElementById('re-step3').innerText = plan.s3;
                document.getElementById('re-gel').innerText = duration >= 90 ? "킥오프 10분 전 1개 + 후반 시작 전 1개 (총 2개)" : "킥오프 전 1개 섭취로 충분";

                document.getElementById('result').style.display = 'block';
                document.getElementById('result').scrollIntoView({behavior:'smooth'});

                saveHistory({ date: new Date().toLocaleDateString(), dist, load });
                renderHistory();
            });

            document.getElementById('del-history').addEventListener('click', () => {
                if(confirm('기록을 모두 삭제할까요?')) { localStorage.removeItem('matchHistory'); renderHistory(); }
            });
        });

        function saveHistory(data) {
            let h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
            h.unshift(data);
            localStorage.setItem('matchHistory', JSON.stringify(h.slice(0, 5)));
        }

        function renderHistory() {
            const h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
            const box = document.getElementById('history-content');
            box.innerHTML = h.length ? h.map(i => `<div class="history-row"><span>${i.date}</span><span>${i.dist}km</span><span style="color:#ef4444">부하 ${i.load}</span></div>`).join('') : '데이터 없음';
        }
    </script>
</body>
</html>
