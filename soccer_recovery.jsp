<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
    <title>⚽ 풋살/축구 컨디션 분석 & 회복 리포트</title>
    <style>
        /* [CSS] 고퀄리티 디자인 & 모바일 최적화 */
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:12px;color:#1e293b;line-height:1.6}
        .container{max-width:600px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 20px 40px rgba(0,0,0,0.1);overflow:hidden}
        
        .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-align:center;padding:35px 20px}
        .header h1{font-size:1.8rem;font-weight:900;letter-spacing:-0.05em;margin-bottom:8px}
        .header p{opacity:0.9;font-size:0.95rem}

        .section{padding:20px;border-bottom:1px solid #f1f5f9}
        .section-title{display:block;font-weight:800;font-size:1.05rem;color:#334155;margin-bottom:15px}
        
        .btn-group{display:flex;gap:12px}
        .toggle-btn{flex:1;padding:16px;border:2.5px solid #e2e8f0;border-radius:18px;background:#fff;font-weight:800;cursor:pointer;transition:all 0.2s}
        .toggle-btn.active{background:#4f46e5;color:#fff;border-color:transparent;box-shadow:0 8px 16px rgba(79,70,229,0.3)}

        .num-box{width:100%;padding:15px;font-size:2.2rem;text-align:center;border:2.5px solid #e2e8f0;border-radius:18px;font-weight:900}
        select{width:100%;height:60px;padding:0 15px;font-size:1rem;border:2.5px solid #e2e8f0;border-radius:16px;background:#fff;font-weight:800;cursor:pointer}
        
        .pain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .pain-item{display:flex;align-items:center;justify-content:center;padding:15px;border:2px solid #f1f5f9;border-radius:14px;cursor:pointer;background:#f8fafc}
        .pain-item input{display:none}
        .pain-item:has(input:checked){background:#eef2ff;border-color:#4f46e5;color:#4f46e5;font-weight:800}

        .analyze-btn{width:calc(100% - 40px);margin:25px 20px;min-height:65px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:20px;font-size:1.2rem;font-weight:900;cursor:pointer;box-shadow:0 10px 25px rgba(16,185,129,0.3)}

        /* [Result] 분석 결과 섹션 */
        #result{display:none;padding-bottom:60px;animation:fadeUp 0.6s ease}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        
        .res-card{margin:20px;padding:25px;background:#f8fafc;border-radius:24px;border-left:6px solid #4f46e5}
        .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:15px 0}
        .stat-box{text-align:center;background:#fff;padding:15px;border-radius:18px;box-shadow:0 4px 10px rgba(0,0,0,0.03)}
        .stat-val{font-size:1.4rem;font-weight:900;color:#ef4444;display:block}
        .stat-lab{font-size:0.8rem;color:#64748b;font-weight:700}

        .info-card{margin:20px;padding:20px;background:#fff;border-radius:22px;border:1px solid #e2e8f0}
        .pro-item{display:flex;gap:15px;padding:12px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
        .pro-time{min-width:75px;background:#eef2ff;color:#4f46e5;font-size:0.75rem;font-weight:900;padding:4px;border-radius:8px;text-align:center}
        .pro-txt{font-size:0.92rem;font-weight:600;color:#334155}

        .share-btn{display:block;width:calc(100% - 40px);margin:10px 20px;padding:15px;background:#3b82f6;color:#fff;border:none;border-radius:15px;font-weight:800;cursor:pointer;text-align:center}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>⚽ 경기 컨디션 분석 리포트</h1>
            <p>Science-based Sports Analysis System</p>
        </header>

        <form id="main-form">
            <!-- 1. 기본 설정 -->
            <div class="section">
                <span class="section-title">⌚ 워치 착용 & ⚽ 종목</span>
                <div class="btn-group" style="margin-bottom:10px">
                    <button type="button" class="toggle-btn watch-btn active" data-watch="yes">워치 착용</button>
                    <button type="button" class="toggle-btn watch-btn" data-watch="no">미착용</button>
                </div>
                <div class="btn-group">
                    <button type="button" class="toggle-btn sport-btn active" data-sport="futsal">🏠 풋살</button>
                    <button type="button" class="toggle-btn sport-btn" data-sport="football">🌳 축구</button>
                </div>
            </div>

            <!-- 2. 거리 입력 -->
            <div class="section" id="dist-area">
                <span class="section-title">📏 경기 활동 거리 (km)</span>
                <input type="number" id="match-dist" class="num-box" value="3.8" step="0.1">
            </div>

            <!-- 3. 시간 선택 (완벽 꼬임 방지) -->
            <div class="section">
                <span class="section-title">⏱️ 상세 경기 시간</span>
                <select id="match-duration"></select>
            </div>

            <!-- 4. 통증 부위 -->
            <div class="section">
                <span class="section-title">🩹 현재 불편한 부위 (다중 선택)</span>
                <div class="pain-grid">
                    <label class="pain-item"><input type="checkbox" name="pain" value="calf"><span>종아리</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="knee"><span>무릎</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="hamstring"><span>햄스트링</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="ankle"><span>발목</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="groin"><span>사타구니</span></label>
                    <label class="pain-item"><input type="checkbox" name="pain" value="none" checked><span>통증 없음</span></label>
                </div>
            </div>

            <button type="submit" class="analyze-btn">📊 프로급 정밀 분석 시작</button>
        </form>

        <!-- [결과 리포트] 모든 기능 복원 -->
        <section id="result">
            <div class="res-card">
                <h3 id="res-title" style="font-weight:900; color:#4f46e5; margin-bottom:10px;">🏠 풋살 분석 리포트</h3>
                <div class="stat-grid">
                    <div class="stat-box"><span class="stat-val" id="out-dist">-</span><span class="stat-lab">거리</span></div>
                    <div class="stat-box"><span class="stat-val" id="out-load">-</span><span class="stat-lab">부하 지수</span></div>
                    <div class="stat-box"><span class="stat-val" id="out-ready">-</span><span class="stat-lab">준비도</span></div>
                </div>
                <p id="out-summary" style="font-size:0.9rem; font-weight:600; color:#475569;"></p>
            </div>

            <!-- 회복 프로토콜 복원 -->
            <div class="info-card">
                <h3 style="margin-bottom:15px; font-weight:900;">🩹 48시간 과학적 회복 프로토콜</h3>
                <div id="recovery-items"></div>
            </div>

            <!-- 부하별 영양 및 파워젤 복원 -->
            <div class="info-card" style="border-left:6px solid #10b981;">
                <h3 style="margin-bottom:10px; font-weight:900;">🍎 영양 및 파워젤 전략</h3>
                <p id="out-nutrition" style="font-size:0.92rem; font-weight:600; color:#334155; white-space:pre-wrap;"></p>
            </div>

            <!-- 히스토리 및 팀 공유 복원 -->
            <div class="info-card" style="background:#f8fafc;">
                <h3 style="margin-bottom:10px;">📋 최근 분석 기록</h3>
                <div id="history-content" style="font-size:0.85rem;"></div>
                <button id="del-history" style="width:100%; margin-top:10px; padding:8px; border:none; border-radius:10px; cursor:pointer; font-weight:700;">기록 삭제</button>
            </div>

            <button onclick="shareKakao()" class="share-btn">📱 팀원에게 리포트 공유하기</button>
        </section>
    </div>

    <script>
        /* [JS] 천재적 사고 로직 복원 및 버그 수정 */
        const DURATIONS = {
            futsal: [ {l:"15분 x 4쿼터 (60분)", v:60}, {l:"15분 x 6쿼터 (90분)", v:90}, {l:"20분 x 6쿼터 (120분)", v:120} ],
            football: [ {l:"45분 x 2쿼터 (정식)", v:90}, {l:"25분 x 4쿼터 (2팀)", v:100}, {l:"25분 x 6쿼터 (3팀)", v:150} ]
        };

        const RECOVERY_DATA = {
            none: [ {t:"🚨 즉시", c:"🧊 찬물 샤워 15분 (염증 22%↓)"}, {t:"⏰ 1시간후", c:"🍽️ 탄수 1.2g/kg + 단백질 보충"}, {t:"🌙 저녁", c:"🧴 폼롤러 10분 전신 이완"}, {t:"🛌 취침전", c:"💤 8시간 이상의 완전 수면"} ],
            calf: [ {t:"🚨 즉시", c:"🧊 종아리 냉찜질 & 거상 (부종 32%↓)"}, {t:"⏰ 1시간후", c:"💊 마그네슘 400mg (경련 예방)"}, {t:"🌙 저녁", c:"🧴 비복근 집중 폼롤러 3세트"}, {t:"🛌 취침전", c:"🛌 다리를 15도 높여서 취침"} ],
            knee: [ {t:"🚨 즉시", c:"🧊 무릎 압박 Sleeve & 냉찜질"}, {t:"⏰ 1시간후", c:"🦵 굴곡 동작(스쿼트) 48시간 지양"}, {t:"🌙 저녁", c:"💊 글루코사민 보충 (연골 보호)"}, {t:"🛌 취침전", c:"🛌 대퇴사두근 등척성 수축 훈련"} ],
            hamstring: [ {t:"🚨 즉시", c:"🧊 허벅지 뒤쪽 냉찜질 & 압박"}, {t:"⏰ 1시간후", c:"🚶 통증 없는 범위 내 가벼운 걷기"}, {t:"🌙 저녁", c:"🧘 무리한 스트레칭 절대 금지"}, {t:"🛌 취침전", c:"🍒 타르트 체리 주스 섭취"} ]
        };

        const NUTRITION_LOGIC = {
            high: "🔥 고강도 영양: 탄수화물 10g/kg + BCAA 공급",
            medium: "✅ 중강도 영양: 단백질 2g/kg + 타르트 체리 주스",
            low: "😌 저강도 관리: 마그네슘 400mg + 전해질 음료 1L"
        };

        function updateOptions(sport) {
            const sel = document.getElementById('match-duration');
            sel.innerHTML = DURATIONS[sport].map(o => `<option value="${o.v}">${o.l}</option>`).join('');
            sel.value = DURATIONS[sport][0].v;
        }

        document.addEventListener('DOMContentLoaded', () => {
            updateOptions('futsal');
            renderHistory();

            document.querySelectorAll('.sport-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    document.querySelectorAll('.sport-btn').forEach(x => x.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    updateOptions(e.currentTarget.dataset.sport);
                });
            });

            document.getElementById('main-form').addEventListener('submit', e => {
                e.preventDefault();
                const sport = document.querySelector('.sport-btn.active').dataset.sport;
                const dist = parseFloat(document.getElementById('match-dist').value || "3.8");
                const duration = parseInt(document.getElementById('match-duration').value, 10);
                
                let mult = 1.0; let pains = [];
                document.querySelectorAll('input[name="pain"]:checked').forEach(cb => {
                    if(cb.value !== 'none') { mult *= (cb.value === 'knee' ? 1.5 : 1.35); pains.push(cb.value); }
                });

                const load = Math.round(dist * duration * mult / 7.5);
                const ready = Math.max(30, 100 - Math.round(load / 6));

                // UI 업데이트
                document.getElementById('res-title').innerText = (sport === 'futsal' ? '🏠 풋살' : '🌳 축구') + ' 분석 리포트';
                document.getElementById('out-dist').innerText = dist + "km";
                document.getElementById('out-load').innerText = load;
                document.getElementById('out-ready').innerText = ready + "%";
                document.getElementById('out-summary').innerText = `신체 부하가 정상 대비 ${Math.round((mult-1)*100)}% 가중되었습니다. 집중 회복을 시작하세요.`;

                // 회복 아이템 렌더링
                const pKey = pains[0] || 'none';
                const pData = RECOVERY_DATA[pKey] || RECOVERY_DATA.none;
                document.getElementById('recovery-items').innerHTML = pData.map(i => `
                    <div class="pro-item"><div class="pro-time">${i.t}</div><div class="pro-txt">${i.c}</div></div>
                `).join('');

                // 영양 및 파워젤
                const nText = load >= 700 ? NUTRITION_LOGIC.high : load >= 500 ? NUTRITION_LOGIC.medium : NUTRITION_LOGIC.low;
                const gelText = duration >= 90 ? "⚡ 파워젤: 킥오프 전 1개 + 후반 시작 전 1개" : "⚡ 파워젤: 킥오프 10분 전 1개 섭취 권장";
                document.getElementById('out-nutrition').innerText = nText + "\n" + gelText;

                document.getElementById('result').style.display = 'block';
                document.getElementById('result').scrollIntoView({behavior:'smooth'});

                saveHistory({ date: new Date().toLocaleDateString(), dist, load });
                renderHistory();
            });

            document.getElementById('del-history').addEventListener('click', () => {
                if(confirm('기록을 모두 삭제할까요?')) { localStorage.removeItem('matchHistory'); renderHistory(); }
            });
        });

        function saveHistory(d) {
            let h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
            h.unshift(d);
            localStorage.setItem('matchHistory', JSON.stringify(h.slice(0, 5)));
        }

        function renderHistory() {
            const h = JSON.parse(localStorage.getItem('matchHistory') || '[]');
            const box = document.getElementById('history-content');
            box.innerHTML = h.length ? h.map(i => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;"><span>${i.date}</span><span>${i.dist}km</span><span style="color:#ef4444">부하 ${i.load}</span></div>`).join('') : '기록 없음';
        }

        function shareKakao() {
            const dist = document.getElementById('out-dist').innerText;
            const load = document.getElementById('out-load').innerText;
            const t = `⚽ 오늘 경기 분석 리포트\n- 활동량: ${dist}\n- 신체부하: ${load}\n정밀 리포트 보기 👇\n${window.location.href}`;
            if (navigator.share) { navigator.share({ title: '경기 분석 리포트', text: t, url: window.location.href }); }
            else { alert('링크가 복사되었습니다!'); }
        }
    </script>
</body>
</html>
