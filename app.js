*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);padding:1rem;min-height:100vh;line-height:1.4}

.container{max-width:600px;margin:0 auto;background:#fff;border-radius:24px;box-shadow:0 25px 50px rgba(0,0,0,.12);overflow:hidden}

.header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;padding:2rem 1.5rem}
.header h1{font-size:clamp(1.5rem,4vw,1.75rem);margin-bottom:.5rem;font-weight:800}
.header p{opacity:.95;font-size:clamp(.9rem,3vw,1rem)}

#match-form{padding-bottom:1rem}
.input-group{padding:1.25rem 1.5rem 1rem;border-bottom:1px solid #f3f4f6}
.input-group label{display:block;font-weight:600;margin-bottom:.75rem;color:#374151;font-size:.95rem}
.hint{display:block;margin-top:.4rem;font-size:.85rem;color:#6b7280}

.watch-buttons,.sport-buttons{display:flex;gap:.75rem;flex-wrap:wrap}
.watch-btn,.sport-btn{flex:1;padding:.9rem .75rem;border:2px solid #e5e7eb;border-radius:14px;background:#fff;font-weight:600;font-size:.95rem;cursor:pointer;transition:all .2s;flex-basis:48%}
.watch-btn.active,.sport-btn.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-color:#667eea;box-shadow:0 4px 15px rgba(102,126,234,.3)}

.large-row{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}
.large-row input{flex:1;padding:1.1rem;font-size:1.6rem;border:2px solid #e5e7eb;border-radius:14px;text-align:center;font-weight:700;min-width:120px}
.large-row span{font-weight:700;color:#4b5563;min-width:30px;flex-shrink:0}

.rpe-row{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}
#rpe{flex:1;flex-basis:200px}
#rpe-value{min-width:2.2rem;text-align:center;font-weight:700;flex-shrink:0}

select{width:100%;padding:1rem;font-size:1rem;border:2px solid #e5e7eb;border-radius:12px;background:#fff;font-weight:600}

.pain-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem}
.pain-grid label{display:flex;align-items:center;gap:.5rem;padding:.8rem;border:2px solid #f3f4f6;border-radius:12px;cursor:pointer;font-size:.92rem;transition:all .2s}
.pain-grid input[type="checkbox"]{display:none}
.pain-grid input:checked + span{font-weight:600;color:#667eea}
.pain-grid label:hover{border-color:#e0e7ff}

.submit-btn-top{width:100%;padding:1.3rem;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:16px;font-size:1.15rem;font-weight:700;cursor:pointer;margin:1rem 1.5rem 1rem;box-shadow:0 8px 25px rgba(16,185,129,.3);transition:all .2s}
.submit-btn-top:hover{transform:translateY(-2px);box-shadow:0 12px 35px rgba(16,185,129,.4)}

#result{display:none;animation:fadeInUp .45s ease-out;padding-bottom:3rem}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.sport-info{padding:1.5rem;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
.sport-badge{padding:.5rem 1rem;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:20px;font-weight:600;font-size:.9rem;flex-shrink:0}
.distance-highlight{font-size:1.15rem;font-weight:700;color:#1f2937;flex:1;text-align:right}

.performance-card{padding:1.5rem 1.5rem 2rem;margin:1rem 0;background:#fff;border-radius:20px;box-shadow:0 8px 25px rgba(0,0,0,.08)}
.performance-card h2{margin-bottom:1.5rem;color:#1f2937;font-size:1.25rem;text-align:center}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:1rem;justify-items:center}
.stat{text-align:center;flex:1}
.stat-num{font-size:clamp(1.3rem,5vw,1.7rem);font-weight:800;margin-bottom:.25rem;line-height:1}
.stat-label{font-size:.85rem;color:#6b7280;font-weight:500}
.benchmark{margin-top:1rem;padding:1rem;background:#fef3c7;border-radius:12px;font-size:.9rem;color:#92400e;border-left:4px solid #f59e0b}

.recovery-card{padding:1.5rem 1.5rem 2rem;margin:1rem 0;background:#f8fafc;border-radius:20px;border-left:4px solid #10b981}
.recovery-card h2{margin-bottom:1.5rem;color:#1f2937;font-size:1.2rem}
.timeline-item{display:flex;gap:1rem;padding:1rem 0;border-bottom:1px solid #e5e7eb;align-items:flex-start}
.time{min-width:70px;font-weight:600;font-size:.95rem;color:#6b7280;flex-shrink:0;padding-top:.2rem}
.action{flex:1;font-size:.96rem;line-height:1.4}

.nutrition-card,.readiness-card,.history-card,.share-card{margin:1rem 1.5rem 1rem;padding:1.5rem;background:#f8fafc;border-radius:16px;border-left:4px solid #10b981}
.nutrition-card h3,.readiness-card h3,.history-card h3,.share-card h3{margin-bottom:1rem;color:#1f2937;font-size:1.1rem}
#readiness-score{background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:.3rem .8rem;border-radius:20px;font-size:1.1rem;font-weight:700;display:inline-block;margin-left:.5rem}
#history-list{max-height:150px;overflow-y:auto;font-size:.9rem}
.history-item{padding:.75rem 0;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:.9rem}
#clear-history{background:#ef4444;color:#fff;border:none;padding:.6rem 1.2rem;border-radius:8px;cursor:pointer;margin-top:.75rem;font-size:.9rem;width:100%}
.share-btn{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;border:none;padding:1rem;border-radius:12px;font-weight:600;cursor:pointer;width:100%;margin-bottom:1rem}

.green{color:#10b981}
.orange{color:#f59e0b}
.red{color:#ef4444}

@media (max-width:640px){
  body{padding:.5rem}
  .container{border-radius:16px;margin:0}
  .input-group{padding:1rem}
  .sport-info{padding:1.25rem}
  .stats-grid{grid-template-columns:repeat(3,1fr);gap:.75rem}
  .timeline-item{flex-direction:column;gap:.5rem}
  .time{min-width:auto;font-size:.9rem}
  .pain-grid{grid-template-columns:repeat(2,1fr)}
}
