// 🔒 안전장치 포함 완전 버전
function init() {
    const clearBtn = document.getElementById('clear-history');
    const historyList = document.getElementById('history-list');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            localStorage.removeItem('matchHistory');
            if (historyList) {
                historyList.innerHTML = '📭 기록이 삭제되었습니다';
                clearBtn.style.display = 'none';
            }
        });
    }
    
    if (historyList) {
        showHistory();
    }
}

function analyzeTeam() {
    const matchCount = parseInt(document.getElementById('matchCount').value);
    const attendance = parseInt(document.getElementById('attendance').value);
    const rpeAvg = parseFloat(document.getElementById('rpeAvg').value);
    const injured = parseInt(document.getElementById('injured').value);
    
    const performance = Math.round(50 + (matchCount * 8) + (attendance / 2) - (rpeAvg * 3) - (injured * 5));
    const recovery = Math.round(60 + (100-attendance) + (10-rpeAvg) * 5 - injured * 8);
    const readiness = Math.round((performance * 0.5) + (recovery * 0.5));
    
    updateScore('performance-score', performance, ['저', '보통', '좋음', '최고']);
    updateScore('recovery-score', recovery, ['주의', '보통', '좋음', '완벽']);
    document.getElementById('readiness-score').textContent = readiness + '%';
    
    document.getElementById('performance-tips').innerHTML = getTips('performance', performance);
    document.getElementById('recovery-tips').innerHTML = getTips('recovery', recovery);
    document.getElementById('nutrition-guide').innerHTML = getNutritionGuide(rpeAvg, injured);
    document.getElementById('readiness-tips').innerHTML = getReadinessTips(readiness);
    
    document.getElementById('form-section').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    saveHistory(matchCount, attendance, rpeAvg, injured, readiness);
    document.getElementById('clear-history').style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateScore(elementId, score, labels) {
    const el = document.getElementById(elementId);
    el.textContent = score + ' (' + labels[Math.floor(score/25)] + ')';
    el.className = 'score-badge score-' + (score > 75 ? 'high' : score > 50 ? 'mid' : 'low');
}

function getTips(type, score) {
    const tips = {
        performance: {
            0: '⚠️ 훈련 강도↓ 출석↑ 필요',
            50: '⚡ 고강도 세션 2회 추가',
            75: '✅ 현재 페이스 유지',
            100: '🏆 경기 대비 완벽'
        },
        recovery: {
            0: '🛑 48시간 완전 휴식',
            50: '💤 수면 9시간 + 스트레칭',
            75: '✅ 가벼운 조깅 + 폼롤러',
            100: '💪 풀가동 가능'
        }
    };
    return tips[type][Math.floor(score/25)] || '';
}

function getNutritionGuide(rpe, injured) {
    return `
        <div>• 단백질: ${rpe > 7 ? '2.2g/kg' : '1.8g/kg'}</div>
        <div>• 탄수화물: ${injured > 1 ? '6g/kg' : '5g/kg'}</div>
        <div>• 수분: 1L + 0.5L/시간</div>
    `;
}

function getReadinessTips(score) {
    if (score >= 80) return '✅ 풀 라인업 출전 OK';
    if (score >= 60) return '⚠️ 2명 로테이션 운영';
    return '🛑 경기 연기 검토';
}

function saveHistory(match, att, rpe, inj, ready) {
    const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    history.unshift({
        date: new Date().toLocaleDateString('ko-KR'),
        match, att, rpe: rpe.toFixed(1), inj, ready,
        trend: history[0]?.ready ? ((ready - history[0].ready)/history[0].ready*100).toFixed(1) + '%' : '–'
    });
    localStorage.setItem('matchHistory', JSON.stringify(history.slice(0,10)));
    showHistory();
}

function showHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const history = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    if (history.length === 0) {
        historyList.innerHTML = '📭 분석 기록이 없습니다';
        return;
    }
    
    historyList.innerHTML = history.map(h => `
        <div class="history-item">
            <span>${h.date} | 준비도 ${h.ready}%</span>
            <span>${h.trend}</span>
        </div>
    `).join('');
}

function shareResult() {
    const readiness = document.getElementById('readiness-score').textContent;
    const text = `팀 준비도 ${readiness}! ${location.href}`;
    navigator.clipboard.writeText(text);
    alert('📋 팀원 공유 텍스트 복사됨!');
}

// 초기화
window.addEventListener('load', init);
