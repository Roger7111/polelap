// -- Clic e cambi senza JavaScript nell'HTML (CSP senza 'unsafe-inline', 29/09/2026) --
// Gli elementi portano data-clic o data-cambio col nome della funzione (e data-arg se serve).
// Un solo ascoltatore per la pagina, e si possono chiamare solo le funzioni di questa lista. Sta in cima al file
// (revisione 29/09): se un pannello si rompe all'avvio, i bottoni funzionano lo stesso.
const AZIONI = { submitAccesso, shareX, copyLink, openWaitlist, closeWaitlist, submitModal, closeStickyForever,
                 openCMP, closeCMP, updateCMP, openPF, closePF, setEseScenario, runTyreSimu, cambiaGaraPasso };
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-clic]');
  if (el && AZIONI[el.dataset.clic]) AZIONI[el.dataset.clic](el.dataset.arg);
});
document.addEventListener('change', function (e) {
  var el = e.target.closest('[data-cambio]');
  if (el && AZIONI[el.dataset.cambio]) AZIONI[el.dataset.cambio]();
});

// Ponte di rinomina (GridLab -> PoleLap, 29/07/2026). previsione.js e index.html
// si deployano insieme, ma la CDN di GitHub Pages puo' servirli sfasati per
// qualche minuto: senza questo fallback la pagina resterebbe vuota nel mezzo.
// Rimuovibile dopo il primo weekend andato a buon fine.
const D = window.POLELAP_DATA || window.GRIDLAB_DATA || {};
const TC = {'Mercedes':'#00D7B6','Ferrari':'#E8002D','McLaren':'#FF8000','Red Bull Racing':'#3671C6','Aston Martin':'#229971','Alpine':'#0093CC','Audi':'#9B1B30','Racing Bulls':'#6C8FF0','Williams':'#1868DB','Haas F1 Team':'#9aa0a6','Cadillac':'#C8A95B'}; // MASTER team colors — unica fonte di verita'
const NM = {ANT:'Antonelli',RUS:'Russell',LEC:'Leclerc',HAM:'Hamilton',NOR:'Norris',PIA:'Piastri',VER:'Verstappen',HAD:'Hadjar',HUL:'Hülkenberg',COL:'Colapinto',GAS:'Gasly',BOR:'Bortoleto',LIN:'Lindblad',OCO:'Ocon',BEA:'Bearman',SAI:'Sainz',LAW:'Lawson',ALB:'Albon',ALO:'Alonso',PER:'Pérez',BOT:'Bottas',STR:'Stroll',TSU:'Tsunoda'};
const CIRC = {'power':'Power ⚡','aero':'Aerodinamico 🔽','balanced':'Bilanciato ⚖️','street':'Cittadino 🏙️','monaco':'Monaco 🎲'};
function nm(c){return NM[c]||c;}
function pct(x){return (x*100).toFixed(x>=0.099?0:1)+'%';}
function tc(t){return TC[t]||'#888';}
function pb(v,mx,cls){cls=cls||'';var w=Math.max(2,Math.round(v/mx*100));return '<div class="track"><div class="fill '+cls+'" style="width:'+w+'%"></div></div>';}
function pc(p){return p<=3?'p'+p:'';}
function drvCell(d,team){var col=tc(team);return '<td><div class="drv"><div class="bar" style="background:'+col+'"></div><div><div class="dname">'+nm(d)+' <span class="dcode">'+d+'</span></div><div class="team-sm">'+team+'</div></div></div></td>';}


// E SE
var ESE_SCENARIOS = D.scenarios || {};
var eseActive = 'asciutto';

function renderEseCards(){
  var html = '';
  Object.keys(ESE_SCENARIOS).forEach(function(k){
    var s = ESE_SCENARIOS[k];
    html += '<div class="sc-card'+(k===eseActive?' active':'')+'" data-clic="setEseScenario" data-arg="'+k+'">' +
      '<div class="sc-ic">'+s.icon+'</div>' +
      '<div class="sc-name">'+s.label+'</div>' +
      '</div>';
  });
  var el = document.getElementById('scCards');
  if(el) el.innerHTML = html;
}

function setEseScenario(key){
  eseActive = key;
  renderEseCards();
  var s = ESE_SCENARIOS[key];
  var descEl = document.getElementById('scDesc');
  if(descEl) descEl.textContent = s ? s.desc : '';
  renderEseGrid();
}

function renderEseGrid(){
  var s = ESE_SCENARIOS[eseActive];
  if(!s) return;
  var pred = s.prediction;
  document.getElementById('eseGrid').innerHTML = pred.map(function(r,i){
    var dw = r.delta_win || 0;
    var dp = r.delta_podio || 0;
    var dwCls = dw > 0.005 ? 'delta-pos' : dw < -0.005 ? 'delta-neg' : 'delta-neu';
    var dpCls = dp > 0.005 ? 'delta-pos' : dp < -0.005 ? 'delta-neg' : 'delta-neu';
    var dwStr = dw === 0 ? '—' : (dw > 0 ? '+' : '') + (dw*100).toFixed(1)+'%';
    var dpStr = dp === 0 ? '—' : (dp > 0 ? '+' : '') + (dp*100).toFixed(1)+'%';
    return '<tr><td class="pos '+(i<3?'p'+(i+1):'')+'">'+(i+1)+'</td>'+drvCell(r.driver,r.team)+
      '<td><div class="pbar">'+pb(r.p_win, pred[0].p_win)+'<span class="pct">'+pct(r.p_win)+'</span></div></td>'+
      '<td class="'+dwCls+'" style="font-size:13px;font-variant-numeric:tabular-nums">'+dwStr+'</td>'+
      '<td><div class="pbar">'+pb(r.p_podio,1)+'<span class="pct">'+pct(r.p_podio)+'</span></div></td>'+
      '<td class="'+dpCls+' hide-sm" style="font-size:13px;font-variant-numeric:tabular-nums">'+dpStr+'</td>'+
      '<td class="hide-sm" style="font-weight:600;font-variant-numeric:tabular-nums">'+r.exp_pts.toFixed(1)+'</td></tr>';
  }).join('');
}






// DRIVER COMPARE
function openCMP(drvA, drvB){
  var ds = D.driver_standings || [];
  var drivers = ds.map(function(r){return r.driver;});
  var selA = document.getElementById('cmpA');
  var selB = document.getElementById('cmpB');
  selA.innerHTML = drivers.map(function(d){return '<option value="'+d+'">'+nm(d)+' — '+d+'</option>';}).join('');
  selB.innerHTML = selA.innerHTML;
  if(drvA && drivers.indexOf(drvA)>=0) selA.value = drvA;
  if(drvB && drivers.indexOf(drvB)>=0) selB.value = drvB;
  else if(drivers.length>1) selB.value = drivers[1];
  updateCMP();
  document.getElementById('cmpModal').classList.add('open');
}
function closeCMP(){document.getElementById('cmpModal').classList.remove('open');}
document.getElementById('cmpModal').addEventListener('click',function(e){if(e.target===this)closeCMP();});

function updateCMP(){
  var dA = document.getElementById('cmpA').value;
  var dB = document.getElementById('cmpB').value;
  if(!dA || !dB || dA===dB){
    document.getElementById('cmpContent').innerHTML='<p style="color:var(--mut);text-align:center">Seleziona due piloti diversi</p>';
    return;
  }
  var ds = D.driver_standings || [];
  var rp = D.race_prediction || [];
  var ph = D.points_history || {};
  var h2h = D.h2h || {};

  var sA = ds.find(function(r){return r.driver===dA;})||{};
  var sB = ds.find(function(r){return r.driver===dB;})||{};
  var pA = rp.find(function(r){return r.driver===dA;})||{};
  var pB = rp.find(function(r){return r.driver===dB;})||{};
  var hA = ph[dA]||[];
  var hB = ph[dB]||[];

  var colA = TC[sA.team]||'#888';
  var colB = TC[sB.team]||'#888';

  // H2H diretto
  var mat = h2h.matrix||[];
  var rowA = mat.find(function(r){return r.driver===dA;});
  var h2hVal = rowA && rowA.vs && rowA.vs[dB] !== undefined ? rowA.vs[dB] : null;

  function cmpRow(lbl, vA, vB, fmt, higherBetter){
    higherBetter = higherBetter !== false;
    var fA = fmt ? fmt(vA) : vA;
    var fB = fmt ? fmt(vB) : vB;
    var betA = higherBetter ? (vA > vB) : (vA < vB);
    var betB = higherBetter ? (vB > vA) : (vB < vA);
    return '<div class="cmp-row">'+
      '<div class="cmp-val '+(betA?'better':'')+'">'+fA+'</div>'+
      '<div class="cmp-lbl">'+lbl+'</div>'+
      '<div class="cmp-val '+(betB?'better':'')+'">'+fB+'</div>'+
    '</div>';
  }

  // Trend sparkline
  var maxR = Math.max(hA.length, hB.length);
  var sparkA = '', sparkB = '';
  if(maxR){
    var maxPts = Math.max.apply(null, hA.concat(hB).map(function(r){return r.pts;})) || 1;
    for(var i=0;i<maxR;i++){
      var rA = hA[i]; var rB = hB[i];
      var hAb = rA ? Math.max(3,Math.round(rA.pts/maxPts*40)) : 0;
      var hBb = rB ? Math.max(3,Math.round(rB.pts/maxPts*40)) : 0;
      sparkA += '<div style="flex:1;height:'+hAb+'px;background:'+(rA&&rA.dnf?'#ef6060':colA)+';border-radius:2px 2px 0 0;align-self:flex-end" title="R'+(i+1)+': '+(rA?rA.pts:0)+'pt"></div>';
      sparkB += '<div style="flex:1;height:'+hBb+'px;background:'+(rB&&rB.dnf?'#ef6060':colB)+';border-radius:2px 2px 0 0;align-self:flex-end" title="R'+(i+1)+': '+(rB?rB.pts:0)+'pt"></div>';
    }
  }

  var html = '<div class="cmp-heads">'+
    '<div class="cmp-head"><div class="dn">'+nm(dA)+'</div><div class="dt">'+dA+'</div><div class="dc" style="background:'+colA+'"></div></div>'+
    '<div class="cmp-vs-badge">VS</div>'+
    '<div class="cmp-head"><div class="dn">'+nm(dB)+'</div><div class="dt">'+dB+'</div><div class="dc" style="background:'+colB+'"></div></div>'+
  '</div>';

  // Metriche stagione
  html += '<div style="margin-bottom:16px">'+
    cmpRow('Punti', sA.points||0, sB.points||0)+
    cmpRow('Posizione', sA.pos||99, sB.pos||99, function(v){return v+'°';}, false)+
    cmpRow('Vittorie', sA.wins||0, sB.wins||0)+
    cmpRow('Podi', sA.podiums||0, sB.podiums||0)+
    cmpRow('DNF', sA.dnfs||0, sB.dnfs||0, null, false)+
  '</div>';

  // Prossima gara
  if(pA.p_win !== undefined && pB.p_win !== undefined){
    html += '<div style="font-size:12px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Prossima gara — '+(D.gp||'')+'</div>'+
    '<div style="margin-bottom:16px">'+
      cmpRow('P(Vittoria)', pA.p_win, pB.p_win, pct)+
      cmpRow('P(Podio)', pA.p_podio, pB.p_podio, pct)+
      cmpRow('Punti attesi', pA.exp_pts||0, pB.exp_pts||0, function(v){return v.toFixed(1);})+
    '</div>';
  }

  // H2H diretto
  if(h2hVal !== null){
    var pctA = (h2hVal*100).toFixed(1);
    var pctB = (100-parseFloat(pctA)).toFixed(1);
    html += '<div style="font-size:12px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">H2H diretto (simulazioni)</div>'+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">'+
      '<span style="font-weight:700;color:'+colA+'">'+pctA+'%</span>'+
      '<div style="flex:1;height:10px;background:var(--panel2);border-radius:5px;overflow:hidden">'+
        '<div style="width:'+pctA+'%;height:100%;background:'+colA+';border-radius:5px"></div></div>'+
      '<span style="font-weight:700;color:'+colB+'">'+pctB+'%</span>'+
    '</div>';
  }

  // Trend punti
  if(maxR){
    html += '<div style="font-size:12px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Punti per gara</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px">'+
      '<div style="display:flex;align-items:flex-end;gap:2px;height:44px">'+sparkA+'</div>'+
      '<div style="display:flex;align-items:flex-end;gap:2px;height:44px">'+sparkB+'</div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
      '<div style="font-size:11px;color:'+colA+';font-weight:700">'+nm(dA)+'</div>'+
      '<div style="font-size:11px;color:'+colB+';font-weight:700">'+nm(dB)+'</div>'+
    '</div>';
  }

  document.getElementById('cmpContent').innerHTML = html;
}

// SHARE
function shareX(){
  var g = D.griglia || [];
  var top3 = g.slice(0,3).map(function(r,i){return (i+1)+'. '+nm(r.driver)+' ('+pct(r.p_pole)+')';}).join(' · ');
  var text = '🏎️ PoleLap prevede per il '+( D.gp||'prossimo GP')+':\n'+top3+'\n\nPrevisione completa 👇';
  var url = 'https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(location.origin + location.pathname);
  window.open(url,'_blank');
}
function copyLink(){
  navigator.clipboard.writeText(location.origin + location.pathname).then(function(){
    var btn = document.querySelector('.btn-copy');
    btn.textContent = '✓ Copiato!';
    setTimeout(function(){btn.innerHTML='🔗 Copia link';},2000);
  });
}

// PILOTA FOCUS
var PH = D.points_history || {};
function openPF(drv){
  var ds = D.driver_standings || [];
  var info = ds.find(function(r){return r.driver===drv;}) || {};
  var rp = (D.race_prediction||[]).find(function(r){return r.driver===drv;}) || {};
  var h2h_data = D.h2h || {};
  var col = tc(info.team);
  document.getElementById('pfTeamBar').style.background = col;
  document.getElementById('pfName').textContent = nm(drv)+' · '+drv;
  document.getElementById('pfTeam').textContent = info.team||'—';
  document.getElementById('pfPoints').textContent = info.points||0;
  document.getElementById('pfPos').textContent = info.pos||'—';
  // Stats
  document.getElementById('pfStats').innerHTML =
    pfStat(info.wins||0,'Vittorie','var(--gold)')+
    pfStat(info.podiums||0,'Podi','var(--acc2)')+
    pfStat(info.sprint_wins||0,'Sprint wins','#8fef8f')+
    pfStat(info.dnfs||0,'DNF','#ef6060');
  // Trend
  var history = PH[drv] || [];
  var maxPts = Math.max.apply(null, history.map(function(r){return r.pts;})) || 1;
  document.getElementById('pfTrend').innerHTML = history.map(function(r){
    var h = Math.max(4, Math.round(r.pts/maxPts*52));
    var cls = r.dnf ? 'dnf' : r.pts===0 ? 'zero' : '';
    return '<div class="pf-bar-wrap"><div class="pf-tbar '+cls+'" style="height:'+h+'px" title="R'+r.round+': '+r.pts+'pt (P'+r.pos+')"></div><div class="pf-rlbl">'+r.round+'</div></div>';
  }).join('') || '<span style="color:var(--mut);font-size:12px">Nessun dato disponibile</span>';
  // Prossima gara
  if(rp.p_win !== undefined){
    document.getElementById('pfNextGP').textContent = D.gp||'—';
    document.getElementById('pfNext').innerHTML =
      '<div style="display:flex;gap:16px;flex-wrap:wrap">'+
      '<div><div style="font-size:11px;color:var(--mut)">P(Vittoria)</div><div style="font-size:20px;font-weight:700;color:var(--acc2)">'+pct(rp.p_win)+'</div></div>'+
      '<div><div style="font-size:11px;color:var(--mut)">P(Podio)</div><div style="font-size:20px;font-weight:700">'+pct(rp.p_podio)+'</div></div>'+
      '<div><div style="font-size:11px;color:var(--mut)">Punti attesi</div><div style="font-size:20px;font-weight:700;color:var(--gold)">'+rp.exp_pts.toFixed(1)+'</div></div>'+
      '</div>';
    document.getElementById('pfNextSection').style.display='block';
  } else {
    document.getElementById('pfNextSection').style.display='none';
  }
  // H2H vs compagno
  var teammates = (D.driver_standings||[]).filter(function(r){return r.team===info.team && r.driver!==drv;});
  var h2hHtml = '';
  teammates.forEach(function(tm){
    var mat = h2h_data.matrix||[];
    var row = mat.find(function(r){return r.driver===drv;});
    var v = row && row.vs ? row.vs[tm.driver] : null;
    if(v!==null && v!==undefined){
      var pctVal = (v*100).toFixed(1);
      var color = v>=0.55?'var(--acc2)':v<=0.45?'#ef6060':'var(--txt)';
      h2hHtml += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0">'+
        '<span style="font-weight:600">'+nm(drv)+'</span>'+
        '<div style="flex:1;height:6px;background:var(--panel2);border-radius:3px;overflow:hidden">'+
          '<div style="width:'+parseFloat(pctVal)+'%;height:100%;background:'+color+';border-radius:3px"></div></div>'+
        '<span style="font-size:13px;font-weight:700;color:'+color+'">'+pctVal+'%</span>'+
        '<span style="color:var(--mut);font-size:13px">vs '+nm(tm.driver)+'</span></div>';
    }
  });
  document.getElementById('pfH2H').innerHTML = h2hHtml || '<span style="color:var(--mut);font-size:12px">Nessun dato H2H</span>';
  document.getElementById('pfH2HSection').style.display = h2hHtml ? 'block' : 'none';
  document.getElementById('pfModal').classList.add('open');
}
function closePF(){document.getElementById('pfModal').classList.remove('open');}
document.getElementById('pfModal').addEventListener('click',function(e){if(e.target===this)closePF();});
function pfStat(n,l,col){return '<div class="pf-stat"><div class="n" style="color:'+col+'">'+n+'</div><div class="l">'+l+'</div></div>';}


// CALENDARIO
var CAL = D.calendar || {};
var CAL_RACES = CAL.races || [];
var NEXT_SESSION = CAL.next_session || null;

var CIRC_BADGE = {
  'power':'<span class="badge badge-power">Power</span>',
  'aero':'<span class="badge badge-aero">Aero</span>',
  'balanced':'<span class="badge badge-balanced">Bilanciato</span>',
  'street':'<span class="badge badge-street">Cittadino</span>',
  'monaco':'<span class="badge badge-monaco">Monaco</span>',
};

function renderCalendario(){
  // Lista gare
  document.getElementById('calList').innerHTML = CAL_RACES.map(function(r){
    var cls = r.status;
    var badges = (CIRC_BADGE[r.circuit]||'') + (r.sprint ? ' <span class="badge badge-sprint">Sprint</span>' : '');
    var d = new Date(r.date+'T15:00');
    var dateStr = d.toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'});
    return '<div class="cal-row '+cls+'">'+
      '<div class="cal-round">R'+r.round+'</div>'+
      '<div class="cal-name">'+r.name+'</div>'+
      '<div class="cal-badges">'+badges+'</div>'+
      '<div class="cal-date">'+dateStr+'</div>'+
    '</div>';
  }).join('');

  // Countdown
  if(!NEXT_SESSION) return;
  document.getElementById('cdName').textContent = NEXT_SESSION.name;
  document.getElementById('cdGP').textContent = NEXT_SESSION.gp + ' · ora locale circuito';

  function tick(){
    var now = new Date();
    var target = new Date(NEXT_SESSION.dt);
    // Aggiusta per timezone offset (approssimativo — Open-Meteo usa timezone locale)
    var diff = target - now;
    if(diff <= 0){ document.getElementById('calCountdown').style.display='none'; return; }
    var d = Math.floor(diff/86400000);
    var h = Math.floor((diff%86400000)/3600000);
    var m = Math.floor((diff%3600000)/60000);
    var s = Math.floor((diff%60000)/1000);
    document.getElementById('cdD').textContent = String(d).padStart(2,'0');
    document.getElementById('cdH').textContent = String(h).padStart(2,'0');
    document.getElementById('cdM').textContent = String(m).padStart(2,'0');
    document.getElementById('cdS').textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
}

// DELTA QUALI→GARA
var PRED_DELTA = D.prediction_delta || [];

function renderDelta(){
  if(!PRED_DELTA.length){
    document.getElementById('deltaContent').innerHTML='<p style="color:var(--mut);font-size:13px;padding:8px 0">Nessun dato delta disponibile — sarà popolato man mano che le gare vengono disputate.</p>';
    return;
  }
  var html = '';
  PRED_DELTA.forEach(function(rd){
    var mx = Math.max.apply(null, rd.rows.map(function(r){return Math.max(r.p_pre,r.p_post);}));
    html += '<div class="card" style="margin-bottom:14px">'+
      '<div class="delta-race-title">'+rd.race+'</div>'+
      '<table><thead><tr>'+
        '<th>Pilota</th><th>Pre-quali</th><th>Post-quali</th><th>Δ P(vince)</th>'+
      '</tr></thead><tbody>'+
      rd.rows.slice(0,10).map(function(r){
        var cls = r.delta > 0.01 ? 'delta-big-pos' : r.delta < -0.01 ? 'delta-big-neg' : 'delta-neu';
        var dsign = r.delta >= 0 ? '+' : '';
        return '<tr>'+drvCell(r.driver,r.team)+
          '<td><div class="pbar">'+pb(r.p_pre,mx)+'<span class="pct">'+pct(r.p_pre)+'</span></div></td>'+
          '<td><div class="pbar">'+pb(r.p_post,mx)+'<span class="pct">'+pct(r.p_post)+'</span></div></td>'+
          '<td class="'+cls+'" style="font-variant-numeric:tabular-nums;font-size:13px">'+dsign+(r.delta*100).toFixed(1)+'%</td>'+
        '</tr>';
      }).join('')+
      '</tbody></table></div>';
  });
  document.getElementById('deltaContent').innerHTML = html;
}


// METEO
var WI = D.weather_info || {};
var WD = D.weather || null;   // pre-fetched daily forecast

var WCODE_EMOJI = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
  45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
  80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'
};
var WCODE_DESC = {
  0:'Sereno',1:'Prev. sereno',2:'Parz. nuvoloso',3:'Coperto',
  51:'Pioggerella',53:'Pioggerella',55:'Pioggerella',
  61:'Pioggia',63:'Pioggia',65:'Pioggia',
  80:'Rovesci',81:'Rovesci',82:'Rovesci violenti',95:'Temporale',96:'Temporale'
};

function renderWeatherBanner() {
  if (!WD || !WD.sunday) return;
  var banner = document.getElementById('weather-banner');
  if (!banner) return;

  var days = [
    {label:'Ven', d: WD.friday},
    {label:'Sab', d: WD.saturday},
    {label:'Dom 🏁', d: WD.sunday},
  ];

  var riskColor = WD.rain_risk === 'alto' ? '#ef6060' : WD.rain_risk === 'medio' ? '#f1c544' : '#00D7B6';
  var html = days.map(function(item) {
    var d = item.d;
    if (!d) return '';
    var emoji = WCODE_EMOJI[d.weather_code] || '🌡️';
    var desc  = WCODE_DESC[d.weather_code] || d.weather_desc || '';
    var rain  = d.rain_prob != null ? d.rain_prob : '?';
    var tmax  = d.tmax != null ? Math.round(d.tmax) : '?';
    var rainC = rain >= 50 ? '#ef6060' : rain >= 25 ? '#f1c544' : '#8b97ad';
    return '<div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);'
      +'border-radius:10px;padding:8px 14px;text-align:center;min-width:80px">'
      +'<div style="font-size:10px;color:#8b97ad;margin-bottom:3px">'+item.label+'</div>'
      +'<div style="font-size:20px">'+emoji+'</div>'
      +'<div style="font-size:13px;font-weight:700">'+tmax+'°C</div>'
      +'<div style="font-size:11px;color:'+rainC+'">💧 '+rain+'%</div>'
      +'</div>';
  }).join('');

  // Rain risk badge
  html += '<div style="display:flex;align-items:center;padding:0 6px">'
    +'<span style="background:'+riskColor+'22;color:'+riskColor+';padding:4px 12px;'
    +'border-radius:12px;font-size:12px;font-weight:700">Rischio pioggia: '+WD.rain_risk+'</span>'
    +'</div>';

  banner.innerHTML = html;
  banner.style.display = 'flex';
}
var WCODE = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
  45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
  66:'🌨️',67:'🌨️',71:'❄️',73:'❄️',75:'❄️',77:'🌨️',
  80:'🌦️',81:'🌧️',82:'⛈️',
  85:'❄️',86:'❄️',95:'⛈️',96:'⛈️',99:'⛈️'
};

async function loadMeteo(){
  var wi = WI;
  if(!wi.lat){
    document.getElementById('meteoLoading').textContent='⚠️ Coordinate circuito non disponibili.';
    return;
  }
  document.getElementById('meteoGP').textContent = D.gp || '—';
  var url = 'https://api.open-meteo.com/v1/forecast?latitude='+wi.lat+'&longitude='+wi.lon+
    '&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m'+
    '&timezone='+encodeURIComponent(wi.tz||'UTC')+'&forecast_days=16';
  try {
    var r = await fetch(url);
    var data = await r.json();
    var times = data.hourly.time;
    var temps = data.hourly.temperature_2m;
    var pprob = data.hourly.precipitation_probability;
    var wcodes = data.hourly.weathercode;
    var winds  = data.hourly.windspeed_10m;

    function findIdx(dt){
      // trova ora più vicina alla sessione
      var target = dt.replace('T',' ');
      var best = 0, bestDiff = Infinity;
      times.forEach(function(t,i){
        var diff = Math.abs(new Date(t) - new Date(dt));
        if(diff < bestDiff){bestDiff=diff; best=i;}
      });
      return best;
    }

    var sessions = wi.sessions || [];
    var cards = '';
    var maxRain = 0;
    sessions.forEach(function(s){
      var idx = findIdx(s.dt);
      var rain = pprob[idx] || 0;
      var temp = temps[idx] != null ? temps[idx].toFixed(0) : '?';
      var wind = winds[idx] != null ? winds[idx].toFixed(0) : '?';
      var wc   = wcodes[idx] || 0;
      var ic   = WCODE[wc] || '🌡️';
      var rainColor = rain >= 60 ? '#ef6060' : rain >= 30 ? 'var(--gold)' : 'var(--acc2)';
      var cardCls = rain >= 60 ? 'rain' : rain >= 30 ? 'cloud' : '';
      if(rain > maxRain) maxRain = rain;
      // data locale leggibile
      var dt = new Date(s.dt);
      var dayStr = dt.toLocaleDateString('it-IT',{weekday:'short',day:'numeric',month:'short'});
      var timeStr = s.dt.split('T')[1];
      cards += '<div class="meteo-card '+cardCls+'">'+
        '<div class="session">'+s.name+'</div>'+
        '<div class="wic">'+ic+'</div>'+
        '<div class="temp">'+temp+'°C</div>'+
        '<div class="rain-prob" style="color:'+rainColor+'">💧 '+rain+'%</div>'+
        '<div class="wind">💨 '+wind+' km/h</div>'+
        '<div class="dt">'+dayStr+' '+timeStr+'</div>'+
      '</div>';
    });

    document.getElementById('meteoGrid').innerHTML = cards;

    // Impact box
    var impEl = document.getElementById('impactBox');
    var raceRain = 0;
    var raceS = sessions.find(function(s){return s.name==='Gara';});
    if(raceS){ var ri = findIdx(raceS.dt); raceRain = pprob[ri]||0; }
    if(raceRain >= 50){
      impEl.className = 'impact-box impact-wet';
      impEl.innerHTML = '⛈️ <div><b>Pioggia in gara probabile ('+raceRain+'%)</b> — Le probabilità potrebbero variare significativamente rispetto alla baseline. Attiva lo scenario <b>Pioggia</b> nel tab What If?</div>';
    } else if(raceRain >= 25){
      impEl.className = 'impact-box impact-variable';
      impEl.innerHTML = '🌦️ <div><b>Condizioni variabili ('+raceRain+'%)</b> — Possibili brevi piogge. Tieni d&#39;occhio le previsioni nelle 24h precedenti alla gara.</div>';
    } else {
      impEl.className = 'impact-box impact-dry';
      impEl.innerHTML = '☀️ <div><b>Gara in asciutto prevista ('+raceRain+'% pioggia)</b> — Le previsioni baseline sono valide. Scenario nominale confermato.</div>';
    }

    document.getElementById('meteoUpd').textContent = new Date().toLocaleString('it-IT');
    document.getElementById('meteoLoading').style.display='none';
    document.getElementById('meteoContent').style.display='block';
  } catch(e) {
    document.getElementById('meteoLoading').style.display='none';
    document.getElementById('meteoError').style.display='block';
  }
}

// Carica meteo quando si apre il tab
document.querySelector('[data-s="meteo"]').addEventListener('click', function(){
  if(document.getElementById('meteoContent').style.display==='none' &&
     document.getElementById('meteoError').style.display==='none'){
    loadMeteo();
    renderWeatherBanner();
  }
});


// WAITLIST
function openWaitlist(){document.getElementById('waitlistModal').classList.add('open');}
function closeWaitlist(){document.getElementById('waitlistModal').classList.remove('open');}
document.getElementById('waitlistModal').addEventListener('click',function(e){if(e.target===this)closeWaitlist();});

async function netlifySubmit(nome,email,interesse,successEl,successHtml,report){
  if(!email||!email.includes('@')){alert('Inserisci un email valida');return;}
  // Formspree — crea account su formspree.io e sostituisci FORMSPREE_ID
  var FORMSPREE_ID = 'mrevderv';
  var payload = {nome:nome, email:email, interesse:interesse, report_pdf: report?'si':'no'};
  try{
    var r = await fetch('https://formspree.io/f/'+FORMSPREE_ID,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload)
    });
    var data = await r.json();
    if(data.ok || r.ok){
      successEl.innerHTML=successHtml;
    } else {
      // Fallback: apri mailto
      window.location.href='mailto:andrea.bonavita117@gmail.com?subject=Iscrizione+PoleLap&body=Nome:+'+encodeURIComponent(nome)+'%0AEmail:+'+encodeURIComponent(email)+'%0AInteresse:+'+encodeURIComponent(interesse);
      successEl.innerHTML=successHtml;
    }
  } catch(e){
    // Fallback silenzioso — mostra successo comunque
    successEl.innerHTML=successHtml;
  }
}

var SUCCESS_HTML='<div class="form-success"><div class="ic">✅</div><h3>Sei in lista!</h3><p>Ti avviseremo via email prima del lancio. Grazie per il supporto!</p></div>';

function submitModal(){
  netlifySubmit(
    document.getElementById('m-nome').value,
    document.getElementById('m-email').value,
    document.getElementById('m-interesse').value,
    document.getElementById('modalContent'),SUCCESS_HTML);
}
function submitAccesso(){
  var report = document.getElementById('a-report') && document.getElementById('a-report').checked;
  netlifySubmit(
    document.getElementById('a-nome').value,
    document.getElementById('a-email').value,
    document.getElementById('a-interesse').value,
    document.getElementById('accessoContent'),SUCCESS_HTML,report);
}

// STICKY CTA — appare dopo 10s, non torna se chiuso
function closeStickyForever(){
  document.getElementById('stickyCta').style.display='none';
  sessionStorage.setItem('cta_dismissed','1');
}
if(!sessionStorage.getItem('cta_dismissed')){
  setTimeout(function(){document.getElementById('stickyCta').style.display='flex';},10000);
}

// NAV
function setSection(id){
  document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
  var sec=document.getElementById('s-'+id);
  if(sec)sec.classList.add('active');
  var tab=document.querySelector('[data-s="'+id+'"]');
  if(tab)tab.classList.add('active');
}
document.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){(typeof switchSectionExtended==='function'?switchSectionExtended:setSection)(t.dataset.s);});});

// DEV MODE — ?dev=1 bypassa i lock premium
if(new URLSearchParams(location.search).get('dev')==='1'){
  document.querySelectorAll('.premium-lock').forEach(function(el){el.style.display='none';});
  document.querySelectorAll('.tab .star').forEach(function(el){el.textContent='';});
}

// HERO
function renderHero(){
  document.getElementById('upd').textContent=D.aggiornato||'—';
  document.getElementById('nsim').textContent=(D.n_sim||0).toLocaleString('it');
  document.getElementById('heroTitle').textContent=D.gp||'—';
  document.getElementById('heroSub').textContent=(D.circuito||'—')+' · '+(CIRC[D.tipo]||D.tipo||'—')+' · '+(D.sessione||'—');
  var lead=(D.standings_top3||[])[0];var g=(D.griglia||[])[0];var done=D.gare_disputate||{};
  var h='';
  if(lead)h+='<div class="chip"><div class="lbl">Leader campionato</div><div class="val">'+nm(lead.driver)+' · '+lead.punti+' pt</div></div>';
  if(g)h+='<div class="chip"><div class="lbl">Pole favorito</div><div class="val">'+nm(g.driver)+' · '+pct(g.p_pole)+'</div></div>';
  if(D.formato==='sprint'){var sq=(D.sq_griglia||[])[0];h+='<div class="chip"><div class="lbl">Formato</div><div class="val" style="color:#6ecf7f">Weekend Sprint'+(sq?(' · SQ: '+nm(sq.driver)):'')+'</div></div>';}
  h+='<div class="chip"><div class="lbl">Gare disputate</div><div class="val">'+(done.gp||0)+' GP · '+(done.sprint||0)+' Sprint</div></div>';
  h+='<div class="chip"><div class="lbl">Simulazioni MC</div><div class="val">'+((D.n_sim||0).toLocaleString('it'))+'</div></div>';
  document.getElementById('heroChips').innerHTML=h;
}

// QUALIFICA
function renderQuali(){
  var title=document.getElementById('qualiTitle');
  var lead=document.getElementById('qualiLead');
  var head=document.getElementById('qualiHead');
  var real=D.quali_reale && D.griglia_reale && D.griglia_reale.length;
  if(real){
    // mappa pilota -> posizione prevista dal modello (per il confronto)
    var proj={}; (D.griglia||[]).forEach(function(r){proj[r.driver]=r.pos;});
    var projPole=(D.griglia&&D.griglia[0])?D.griglia[0].driver:'—';
    // GRIGLIA DI PARTENZA: la quali NON e' la griglia. Le penalita' arrivano ore
    // dopo (Ungheria 26/07: quali NOR-HAM-LEC-ANT, si partiva NOR-LEC-PIA-VER-HAM).
    var part={}, nPen=0;
    (D.griglia_partenza||[]).forEach(function(r){part[r.driver]=r.pos;});
    D.griglia_reale.forEach(function(r){ if(part[r.driver]!=null && part[r.driver]!==r.pos) nPen++; });
    if(title) title.innerHTML='Qualifica — Risultato reale <span style="color:#39d98a">✓</span>';
    if(lead)  lead.innerHTML='Classifica reale della qualifica (best giro valido). Previsione pre-quali: pole <b>'+projPole+'</b>.'
      + (nPen ? ' <b style="color:#ffb454">La griglia di partenza è diversa</b>: '+nPen+' piloti spostati dalle penalità — colonna <b>Parte</b>.'
              : '');
    if(head)  head.innerHTML='<th>Pos</th><th>Pilota</th>'+(nPen?'<th>Parte</th>':'')+'<th class="hide-sm">Gap pole</th><th>Previsto</th><th class="hide-sm">Δ</th>';
    document.getElementById('qualiGrid').innerHTML=D.griglia_reale.map(function(r){
      var gap=(r.gap&&r.gap>0)?('+'+Number(r.gap).toFixed(3)):'<b>POLE</b>';
      var pp=proj[r.driver];
      var delta=(pp!=null)?(pp-r.pos):null;            // >0 = meglio del previsto
      var dtxt=(delta==null)?'—':(delta>0?('▲'+delta):(delta<0?('▼'+(-delta)):'='));
      var dcol=(delta==null||delta===0)?'var(--mut)':(delta>0?'#39d98a':'#ff6b6b');
      var sp=part[r.driver], mosso=(sp!=null && sp!==r.pos);
      var spTd=nPen?('<td style="font-weight:600;color:'+(mosso?'#ffb454':'var(--mut)')+'">'
        +(sp!=null?('P'+sp):'—')+'</td>'):'';
      return '<tr style="cursor:pointer" data-clic="openPF" data-arg="'+r.driver+'">'+
        '<td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+drvCell(r.driver,r.team)+spTd+
        '<td class="fascia hide-sm">'+gap+'</td>'+
        '<td style="color:var(--mut)">'+(pp!=null?('P'+pp):'—')+'</td>'+
        '<td class="hide-sm" style="color:'+dcol+';font-weight:600">'+dtxt+'</td></tr>';
    }).join('');
    return;
  }
  // reset header (proiezione pre-quali)
  if(title) title.textContent=(D.formato==='sprint')?'Griglia prevista — Qualifica GP (sabato)':'Griglia prevista — Qualifica';
  if(lead)  lead.innerHTML=(D.formato==='sprint')
    ?'Previsione per la <b>qualifica del GP</b> (sabato pomeriggio), che decide la griglia della gara di domenica. La <b>fascia 80%</b> mostra l\'incertezza reale.'
    :'Previsione probabilistica pre-weekend. La <b>fascia 80%</b> mostra l\'incertezza reale.';
  if(head)  head.innerHTML='<th>Pos</th><th>Pilota</th><th class="hide-sm">Fascia 80%</th><th>P(Pole)</th><th class="hide-sm">P(Top 3)</th><th>P(Q3)</th>';
  var g=D.griglia||[];
  document.getElementById('qualiGrid').innerHTML=g.map(function(r){
    return '<tr style="cursor:pointer" data-clic="openPF" data-arg="'+r.driver+'">' + '<td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+drvCell(r.driver,r.team)+
      '<td class="fascia hide-sm">'+r.fascia+'</td>'+
      '<td><div class="pbar">'+pb(r.p_pole,0.4)+'<span class="pct">'+pct(r.p_pole)+'</span></div></td>'+
      '<td class="hide-sm"><div class="pbar">'+pb(r.p_top3,1)+'<span class="pct">'+pct(r.p_top3)+'</span></div></td>'+
      '<td><div class="pbar">'+pb(r.p_q3,1)+'<span class="pct">'+pct(r.p_q3)+'</span></div></td></tr>';
  }).join('');
}

// SPRINT QUALIFYING (solo weekend Sprint)
function renderSprint(){
  var blk=document.getElementById('sprintBlock');
  if(!blk) return;
  if(D.formato!=='sprint'||!(D.sq_griglia||[]).length){blk.style.display='none';return;}
  blk.style.display='block';
  var title=document.getElementById('sprintTitle');
  var lead=document.getElementById('sprintLead');
  var head=document.getElementById('sprintHead');
  var real=D.sq_reale && D.sq_griglia_reale && D.sq_griglia_reale.length;
  if(real){
    var proj={}; (D.sq_griglia||[]).forEach(function(r){proj[r.driver]=r.pos;});
    var projPole=(D.sq_griglia&&D.sq_griglia[0])?D.sq_griglia[0].driver:'—';
    if(title) title.innerHTML='Sprint Qualifying — Risultato reale <span style="color:#39d98a">✓</span> <span class="badge badge-sprint">Sprint</span>';
    if(lead)  lead.innerHTML='Griglia reale della Sprint del sabato (best giro valido). Previsione pre-SQ: pole <b>'+projPole+'</b>.';
    if(head)  head.innerHTML='<th>Pos</th><th>Pilota</th><th class="hide-sm">Gap pole</th><th>Previsto</th><th class="hide-sm">Δ</th>';
    document.getElementById('sprintGrid').innerHTML=D.sq_griglia_reale.map(function(r){
      var gap=(r.gap&&r.gap>0)?('+'+Number(r.gap).toFixed(3)):'<b>POLE</b>';
      var pp=proj[r.driver];
      var delta=(pp!=null)?(pp-r.pos):null;            // >0 = meglio del previsto
      var dtxt=(delta==null)?'—':(delta>0?('▲'+delta):(delta<0?('▼'+(-delta)):'='));
      var dcol=(delta==null||delta===0)?'var(--mut)':(delta>0?'#39d98a':'#ff6b6b');
      return '<tr style="cursor:pointer" data-clic="openPF" data-arg="'+r.driver+'">'+
        '<td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+drvCell(r.driver,r.team)+
        '<td class="fascia hide-sm">'+gap+'</td>'+
        '<td style="color:var(--mut)">'+(pp!=null?('P'+pp):'—')+'</td>'+
        '<td class="hide-sm" style="color:'+dcol+';font-weight:600">'+dtxt+'</td></tr>';
    }).join('');
    return;
  }
  if(title) title.innerHTML='Sprint Qualifying — Previsione <span class="badge badge-sprint">Sprint</span>';
  if(lead)  lead.innerHTML='Weekend Sprint: la SQ del venerdì decide la griglia della <b>Sprint del sabato</b>. Qualifica GP e gara lunga più sotto.';
  if(head)  head.innerHTML='<th>Pos</th><th>Pilota</th><th class="hide-sm">Fascia 80%</th><th>P(Pole)</th><th class="hide-sm">P(Top 3)</th><th>P(SQ3)</th>';
  document.getElementById('sprintGrid').innerHTML=(D.sq_griglia||[]).map(function(r){
    return '<tr style="cursor:pointer" data-clic="openPF" data-arg="'+r.driver+'">' + '<td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+drvCell(r.driver,r.team)+
      '<td class="fascia hide-sm">'+r.fascia+'</td>'+
      '<td><div class="pbar">'+pb(r.p_pole,0.4)+'<span class="pct">'+pct(r.p_pole)+'</span></div></td>'+
      '<td class="hide-sm"><div class="pbar">'+pb(r.p_top3,1)+'<span class="pct">'+pct(r.p_top3)+'</span></div></td>'+
      '<td><div class="pbar">'+pb(r.p_q3,1)+'<span class="pct">'+pct(r.p_q3)+'</span></div></td></tr>';
  }).join('');
}

// SPRINT RACE (previsione sprint del sabato, da griglia SQ reale)
function renderSprintRace(){
  var blk=document.getElementById('sprintRaceBlock');
  if(!blk) return;
  var sp=D.sprint_prediction||[];
  if(D.formato!=='sprint'||!sp.length){blk.style.display='none';return;}
  blk.style.display='block';
  var mx=sp.length?sp[0].p_win:0.4;
  document.getElementById('sprintRaceGrid').innerHTML=sp.map(function(r){
    return '<tr style="cursor:pointer" data-clic="openPF" data-arg="'+r.driver+'">'+
      '<td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+drvCell(r.driver,r.team)+
      '<td class="fascia hide-sm">'+(r.fascia||'—')+'</td>'+
      '<td><div class="pbar">'+pb(r.p_win,mx)+'<span class="pct">'+pct(r.p_win)+'</span></div></td>'+
      '<td class="hide-sm"><div class="pbar">'+pb(r.p_podio,1)+'<span class="pct">'+pct(r.p_podio)+'</span></div></td>'+
      '<td class="hide-sm" style="color:'+((r.p_dnf!=null&&r.p_dnf>0.05)?'#ef6060':'var(--mut)')+'">'+(r.p_dnf!=null?pct(r.p_dnf):'—')+'</td>'+
      '<td style="font-weight:600">'+r.exp_pts.toFixed(1)+'</td></tr>';
  }).join('');
}

// GARA
function renderGara(){
  var rp=D.race_prediction||[];var mx=rp.length?Math.max(rp[0].p_win*1.5,0.5):0.5;
  var df=D.driver_form||{};
  var gtitle=document.getElementById('garaTitle');
  var glead=document.getElementById('garaLead');
  var ghead=document.getElementById('garaHead');
  if(D.gara_reale && D.arrivo_reale && D.arrivo_reale.length){
    var pred={}; rp.forEach(function(r,i){pred[r.driver]=i+1;});
    if(gtitle) gtitle.innerHTML='Gara — Risultato reale <span style="color:#39d98a">✓</span>';
    if(glead)  glead.innerHTML='Ordine d\'arrivo reale. Δ = confronto con la previsione pre-gara.';
    if(ghead)  ghead.innerHTML='<th>Pos</th><th>Pilota</th><th class="hide-sm">Stato</th><th>Previsto</th><th class="hide-sm">Δ</th>';
    document.getElementById('raceGrid').innerHTML=D.arrivo_reale.map(function(r){
      var pp=pred[r.driver];
      var delta=(pp!=null&&!r.dnf)?(pp-r.pos):null;       // >0 = meglio del previsto
      var dtxt=r.dnf?'DNF':(delta==null?'—':(delta>0?('▲'+delta):(delta<0?('▼'+(-delta)):'=')));
      var dcol=r.dnf?'#ef6060':((delta==null||delta===0)?'var(--mut)':(delta>0?'#39d98a':'#ff6b6b'));
      return '<tr style="cursor:pointer" data-clic="openPF" data-arg="'+r.driver+'">'+
        '<td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+drvCell(r.driver,r.team)+
        '<td class="hide-sm" style="color:'+(r.dnf?'#ef6060':'var(--mut)')+'">'+(r.dnf?'DNF':'arrivato')+'</td>'+
        '<td style="color:var(--mut)">'+(pp!=null?('P'+pp):'—')+'</td>'+
        '<td class="hide-sm" style="color:'+dcol+';font-weight:600">'+dtxt+'</td></tr>';
    }).join('');
    document.getElementById('lockGara').style.display='none';
    return;
  }
  // reset header (previsione gara pre-arrivo)
  if(gtitle) gtitle.textContent='Previsione Gara';
  if(glead){
    var _ld=rp[0]||{}, _p=(_ld.p_win||0);
    var _close=rp.filter(function(r){return (_p-(r.p_win||0))<=0.05;}).length;
    var _rel=!(D.quali_reale && D.quali_reale.length);
    var _s='Ordinata per <b>posizione attesa</b>. Sono <b>probabilità</b> stimate (Monte Carlo), non un pronostico secco: pesa anche P(podio), la fascia P10–P90 e la <b>calibrazione</b> (sezione Accuratezza).';
    if(_p>0 && _p<0.25) _s='<b>Gara aperta</b>: il favorito <b>'+nm(_ld.driver)+'</b> è a sole <b>'+pct(_p)+'</b> di P(vittoria)'+(_close>1?(', con '+_close+' piloti entro ~5 punti percentuali'):'')+'. '+_s;
    if(_rel) _s+=' <span style="color:var(--mut)">Forma relativa (griglia proiettata): si affina dopo le qualifiche reali di sabato.</span>';
    glead.innerHTML=_s;
  }
  if(ghead)  ghead.innerHTML='<th>Pos</th><th>Pilota</th><th>Modello</th><th class="hide-sm">P(Podio)</th><th class="hide-sm">P(DNF)</th><th class="hide-sm">Punti att.</th>';
  document.getElementById('raceGrid').innerHTML=rp.map(function(r,i){
    // form dots ultimi 3 GP
    var form=df[r.driver]||{};
    var dots='';
    if(form.positions&&form.positions.length){
      dots='<span style="font-size:9px;margin-left:5px;letter-spacing:2px">'+form.positions.map(function(p){
        if(p===null)return '<span style="color:#ef6060">✕</span>';
        if(p===1)return '<span style="color:var(--gold)">●</span>';
        if(p<=3)return '<span style="color:#a78bfa">●</span>';
        if(p<=10)return '<span style="color:var(--acc)">●</span>';
        return '<span style="color:var(--mut)">●</span>';
      }).join('')+'</span>';
    }
    // colonna modello: p_win + range P10-P90
    var rangeStr='';
    if(r.pos_p10&&r.pos_p90){rangeStr='<br><span style="font-size:10px;color:var(--mut)">fascia 80%: P'+r.pos_p10+'–P'+r.pos_p90+'</span>';}
    // colonna mercato (Quote Polymarket): DISATTIVATA — area scommesse chiusa
    // in attesa di validazione legale (D.L. 87/2018). Riattivare header + mktCell insieme.
    return '<tr><td class="pos '+pc(i+1)+'">'+(i+1)+'</td>'+
      '<td><div class="drv"><div class="bar" style="background:'+tc(r.team)+'"></div>'+
      '<div><div class="dname">'+nm(r.driver)+' <span class="dcode">'+r.driver+'</span>'+dots+'</div>'+
      '<div class="team-sm">'+r.team+'</div></div></div></td>'+
      '<td><div class="pbar">'+pb(r.p_win,mx)+'<span class="pct">'+pct(r.p_win)+'</span></div>'+rangeStr+'</td>'+
      '<td class="hide-sm"><div class="pbar">'+pb(r.p_podio,1)+'<span class="pct">'+pct(r.p_podio)+'</span></div></td>'+
      '<td class="hide-sm" style="color:'+((r.p_dnf!=null&&r.p_dnf>0.15)?'#ef6060':'var(--mut)')+'">'+(r.p_dnf!=null?pct(r.p_dnf):'—')+'</td>'+
      '<td class="hide-sm" style="font-variant-numeric:tabular-nums;font-weight:600">'+r.exp_pts.toFixed(1)+'</td></tr>';
  }).join('');
  document.getElementById('lockGara').style.display=rp.length?'none':'flex';
}

// CLASSIFICA
function renderClassifica(){
  var ds=D.driver_standings||[];var mx=ds.length?ds[0].points:1;
  document.getElementById('driverStandings').innerHTML=ds.map(function(r){
    return '<tr><td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+drvCell(r.driver,r.team)+
      '<td><div class="pbar">'+pb(r.points,mx,'fill-gold')+'<span class="pct" style="min-width:32px;color:var(--txt);font-weight:700">'+r.points+'</span></div></td>'+
      '<td class="hide-sm" style="text-align:center;font-weight:'+(r.wins?700:400)+';color:'+(r.wins?'var(--gold)':'var(--mut)')+'">'+r.wins+'</td>'+
      '<td class="hide-sm" style="text-align:center;color:'+(r.podiums?'var(--txt)':'var(--mut)')+'">'+r.podiums+'</td>'+
      '<td class="hide-sm" style="text-align:center;color:var(--mut)">'+r.sprint_wins+'</td>'+
      '<td class="hide-sm" style="text-align:center;color:'+(r.dnfs?'#ef6060':'var(--mut)')+'">'+r.dnfs+'</td></tr>';
  }).join('');
  var cs=D.constructor_standings||[];var mc=cs.length?cs[0].points:1;
  document.getElementById('constructorStandings').innerHTML=cs.map(function(r){
    return '<tr><td class="pos '+pc(r.pos)+'">'+r.pos+'</td>'+
      '<td><div class="drv"><div class="bar" style="background:'+tc(r.team)+'"></div><div class="dname">'+r.team+'</div></div></td>'+
      '<td><div class="pbar">'+pb(r.points,mc,'fill-gold')+'<span class="pct" style="min-width:32px;color:var(--txt);font-weight:700">'+r.points+'</span></div></td>'+
      '<td class="hide-sm" style="text-align:center;font-weight:'+(r.wins?700:400)+';color:'+(r.wins?'var(--gold)':'var(--mut)')+'">'+r.wins+'</td></tr>';
  }).join('');
}

// TITOLO
function renderTitolo(){
  var c=D.championship||{};
  document.getElementById('gareRim').textContent=(c.gare_rimanenti||0)+' GP + '+(c.sprint_rimanenti||0)+' Sprint';
  function champRows(list,nameKey){
    if(!list||!list.length)return '<div style="padding:16px;color:var(--mut);font-size:13px">Nessun dato</div>';
    var mx=list[0].p_title;
    return list.filter(function(r){return r.p_title>0;}).map(function(r,i){
      return '<div class="champ-row"><span class="champ-name '+pc(i+1)+'">'+(nameKey==='driver'?nm(r.driver):r.team)+'</span>'+
        '<div class="pbar" style="flex:1">'+pb(r.p_title,mx,'fill-gold')+'</div>'+
        '<span class="champ-pct" style="color:'+(r.p_title>50?'var(--gold)':r.p_title>10?'var(--txt)':'var(--mut)')+'">'+r.p_title+'%</span></div>';
    }).join('');
  }
  document.getElementById('champPiloti').innerHTML=champRows(c.piloti,'driver');
  document.getElementById('champCostruttori').innerHTML=champRows(c.costruttori,'team');
  document.getElementById('lockTitolo').style.display=(c.piloti&&c.piloti.length)?'none':'flex';
}

// H2H
function renderH2H(){
  var h=D.h2h||{};var drvs=h.drivers||[];var mat=h.matrix||[];
  if(!drvs.length){document.getElementById('h2hTable').innerHTML='<tr><td style="padding:20px;color:var(--mut)">Nessun dato</td></tr>';return;}
  var head='<tr><th></th>'+drvs.map(function(d){return '<th>'+d+'</th>';}).join('')+'</tr>';
  var body=mat.map(function(row){
    return '<tr><td class="h2h-drv">'+nm(row.driver)+'</td>'+
      drvs.map(function(opp){
        if(opp===row.driver)return '<td class="h2h-self">—</td>';
        var v=row.vs[opp];if(v===undefined)return '<td>?</td>';
        var cls=v>=0.55?'h2h-green':v<=0.45?'h2h-red':'';
        return '<td class="'+cls+'">'+(v*100).toFixed(0)+'%</td>';
      }).join('')+'</tr>';
  }).join('');
  document.getElementById('h2hTable').innerHTML=head+body;
  document.getElementById('lockH2H').style.display=drvs.length?'none':'flex';
}

// FANTAF1
function renderFanta(){
  var f=D.fantaf1||[];
  document.getElementById('fantaGrid').innerHTML=f.map(function(r,i){
    return '<tr><td class="pos '+pc(i+1)+'">'+(i+1)+'</td>'+drvCell(r.driver,r.team)+
      '<td style="font-weight:700;color:var(--gold)">'+r.exp_pts.toFixed(1)+'</td>'+
      '<td class="hide-sm"><div class="pbar">'+pb(r.p_win,f[0].p_win)+'<span class="pct">'+pct(r.p_win)+'</span></div></td>'+
      '<td class="hide-sm"><div class="pbar">'+pb(r.p_podio,1)+'<span class="pct">'+pct(r.p_podio)+'</span></div></td>'+
      '<td class="hide-sm"><div class="pbar">'+pb(r.p_points,1)+'<span class="pct">'+pct(r.p_points)+'</span></div></td></tr>';
  }).join('');
  document.getElementById('lockFanta').style.display=f.length?'none':'flex';
}

// PASSO
function renderPasso(rp){
  rp=rp||D.race_pace||{};var drvs=rp.drivers||[];
  document.getElementById('passoRace').textContent=rp.race||'ultima gara';
  if(!drvs.length){document.getElementById('passoGrid').innerHTML='<tr><td colspan="7" style="padding:20px;color:var(--mut)">Nessun dato</td></tr>';return;}
  document.getElementById('passoGrid').innerHTML=drvs.map(function(r,i){
    var gap=r.gap!=null?r.gap:null;var te=r.traffic_effect!=null?r.traffic_effect:null;
    return (r.pochi_giri?'<tr style="opacity:.55"><td class="pos">—</td>':'<tr><td class="pos '+pc(i+1)+'">'+(i+1)+'</td>')+drvCell(r.driver,r.team)+
      '<td style="font-variant-numeric:tabular-nums;color:var(--mut)">'+r.pace.toFixed(3)+'s</td>'+
      '<td style="font-variant-numeric:tabular-nums;font-weight:600">'+(r.pace_best!=null?r.pace_best.toFixed(3)+'s':'—')+'</td>'+
      '<td style="font-variant-numeric:tabular-nums;color:'+(gap!=null&&gap<0.5?'var(--acc2)':gap!=null&&gap>2?'#ef6060':'var(--txt)')+'">'+(gap!=null?(gap===0?'REF':'+'+gap.toFixed(3)+'s'):'—')+'</td>'+
      '<td class="pace-effect hide-sm">'+(te!=null?'+'+te.toFixed(3)+'s':'—')+'</td>'+
      '<td class="hide-sm" style="color:var(--mut);font-size:12px">'+r.laps+'</td></tr>';
  }).join('');
  var nEl=document.getElementById('passoNote');
  // 30/09: chi ha meno di rp.min_giri giri puliti sta in fondo e senza posizione (Miami: HUL terzo col passo di 2 giri)
  var pochi=drvs.some(function(r){return r.pochi_giri;});
  var testo=(rp.note?'Nota (pace review): '+rp.note+' ':'')+(pochi?'In fondo e senza posizione chi ha meno di '+
    rp.min_giri+' giri puliti (ritiro, gara spezzata): il suo passo non è confrontabile.':'');
  nEl.textContent=testo;nEl.style.display=testo?'block':'none';
  document.getElementById('lockPasso').style.display=drvs.length?'none':'flex';
}

// 30/09: il passo di ogni gara del 2026 dal menu (race_pace_gare, dalla piu' recente); vale anche per le gomme.
// Con i dati di prima del 5/10 l'elenco non c'e': il menu resta nascosto e si vede l'ultima gara, come prima.
function menuGarePasso(){
  var gare=D.race_pace_gare||[], s=document.getElementById('passoGara');
  if(gare.length<2) return;
  gare.forEach(function(g,i){ s.add(new Option(g.race,i)); });
  var i=gare.map(function(g){return g.race;}).indexOf((D.race_pace||{}).race);
  if(i>=0) s.value=String(i);
  s.style.display='block';
}
function cambiaGaraPasso(){
  var g=(D.race_pace_gare||[])[+document.getElementById('passoGara').value];
  if(g){ renderPasso(g); renderTyre(g); }
}


// LONG RUN DEL VENERDI' (29/09): ordine e gruppi dai long run puliti delle libere, mai distacchi (PIANO_PRODOTTO 2.5)
function renderLongRun(){
  var lr = D.long_run;
  document.getElementById('lrBox').style.display = lr ? '' : 'none';   // dati di prima del 5/10: niente riquadro
  if(!lr) return;
  var libere = lr.sessione === 'FP1' ? 'Libere 1' : 'Libere 2';
  document.getElementById('lrSess').textContent = (lr.gara || '') + ' · ' + libere +
    (lr.sessione === 'FP1' ? ' (weekend sprint: sessione unica, meno rappresentativa)' : '');
  var righe = lr.piloti || [], msg = document.getElementById('lrMsg');
  document.getElementById('lrTab').style.display = righe.length ? '' : 'none';
  if(!righe.length){
    msg.textContent = lr.motivo === 'attesa' ? 'Compare dopo le ' + libere + ' del venerdì.'
      : 'Niente classifica: ' + (lr.motivo || 'dati non disponibili') +
        (/^solo /.test(lr.motivo || '') ? '. Con meno di 5 piloti l\'ordine non si distingue dal caso.' : '.');
    return;
  }
  var prima = 0;
  document.getElementById('lrGrid').innerHTML = righe.map(function(r){
    var bordo = r.gruppo !== prima && prima ? ' style="border-top:2px solid var(--line)"' : '';
    prima = r.gruppo;
    return '<tr' + bordo + '><td class="pos">' + r.gruppo + '</td>' + drvCell(r.driver, r.team) +
      '<td>' + r.mescole + '</td><td class="hide-sm" style="color:var(--mut)">' + r.giri + '</td></tr>';
  }).join('');
  msg.textContent = righe.length + ' piloti con un long run pulito. Stesso gruppo: differenza entro 0,3 s al giro, cioè ' +
    'dentro il rumore. Occhio alle mescole: con la S si gira più forte che con la M o la H.';
}

// TYRE STRATEGY
function renderTyre(rp){
  rp = rp || D.race_pace || {};
  var drvs = rp.drivers || [];
  var ci = rp.cliff_info || {};
  if(!drvs.length) return;
  document.getElementById('tyreRace').textContent = rp.race || 'ultima gara';
  var cpd = ci.compound || '?';
  var temp = ci.track_temp || '?';
  // 29/09: degrado MISURATO per mescola sugli stint lunghi di tutta la gara (corretto per il carburante)
  // sotto i 20 ms/giro il degrado non si distingue dall'errore della correzione per il carburante (revisione 29/09)
  var quasi = false;
  var deg = Object.keys(ci.compounds || {}).map(function(c){ var x = ci.compounds[c];
    if (x.slope_ms < 20) quasi = true;
    return c+' '+(x.slope_ms < 20 ? '≈0' : '+'+Math.round(x.slope_ms))+' ms/giro ('+x.n_stints+' stint)'; }).join(' · ');
  document.getElementById('tyreMeta').textContent = 'Mescola dominante: '+cpd+(deg?' · degrado misurato: '+deg:'')+
    ' · asfalto '+(ci.track_temp_stima?'stimato ~':'')+temp+'°C'+
    (quasi ? ' · ≈0: dentro l\'incertezza della correzione per il carburante' : '');
  var teamCliff = ci.teams || {};
  document.getElementById('tyreGrid').innerHTML = drvs.map(function(r){
    var stints = r.stints || [];
    if(!stints.length) return '';
    var cliffInfo = teamCliff[r.team] || {};
    var stintHtml = stints.map(function(s){
      return '<span class="tyre-pill '+s.compound+'">'+(s.compound==='UNKNOWN'?'?':s.compound.charAt(0))+' ×'+s.laps+'</span>';
    }).join('');
    var cliffHtml = cliffInfo.cliff_lap ?
      '<div class="tyre-cliff">Cliff @giro <span>~'+cliffInfo.cliff_lap+'</span> · fattore '+cliffInfo.factor+'</div>' : '';
    return '<div class="tyre-card">'+
      '<div class="tyre-card-drv"><div class="bar" style="background:'+tc(r.team)+';width:3px;height:14px;border-radius:2px"></div>'+nm(r.driver)+'</div>'+
      '<div class="tyre-stints">'+stintHtml+'</div>'+
      cliffHtml+
    '</div>';
  }).filter(Boolean).join('');
}

// STORICO
function renderStorico(){
  var h=(D.race_history||[]).slice().reverse();
  document.getElementById('raceHistory').innerHTML=h.map(function(r){
    var isSprint=r.type==='sprint';
    var wTeam='';
    (D.driver_standings||[]).forEach(function(d){if(d.driver===r.winner)wTeam=d.team;});
    var dnfStr='';
    if(r.dnf_mech&&r.dnf_mech.length)dnfStr+='⚙️ '+r.dnf_mech.map(nm).join(', ');
    if(r.dnf_incident&&r.dnf_incident.length)dnfStr+=(dnfStr?' · ':'')+'💥 '+r.dnf_incident.map(nm).join(', ');
    return '<div class="race-card">'+
      '<div class="rc-head"><div><div class="rc-name">'+r.race+'</div><div class="rc-date">'+r.date+'</div></div>'+
      '<div style="display:flex;gap:4px">'+(isSprint?'<span class="badge badge-sprint">Sprint</span>':'<span class="badge badge-race">GP</span>')+
      ' <span class="badge badge-'+(r.circuit||'balanced')+'">'+r.circuit_label+'</span></div></div>'+
      '<div class="rc-winner"><span>'+(isSprint?'🥇':'🏆')+'</span><div class="bar" style="background:'+tc(wTeam)+';height:20px"></div>'+
        '<span style="font-weight:700;font-size:15px">'+nm(r.winner)+'</span>'+
        (r.winner_laptime_s?'<span style="color:var(--mut);font-size:11px;margin-left:4px">'+r.winner_laptime_s.toFixed(3)+'s/giro</span>':'')+
      '</div>'+
      '<div class="rc-top3">'+r.top3.map(function(d,i){return '<span>'+(i===0?'🥇':i===1?'🥈':'🥉')+' '+nm(d)+'</span>';}).join('')+'</div>'+
      (dnfStr?'<div class="rc-dnf">'+dnfStr+'</div>':'')+
    '</div>';
  }).join('');
}


function renderAccCards(){
  var ma = D.model_accuracy || {};
  var races = (ma.race||{}).races || [];
  if(!races.length){document.getElementById('raceAccCards').innerHTML='<p style="color:var(--mut)">Nessun dato disponibile.</p>';return;}
  document.getElementById('raceAccCards').innerHTML = races.map(function(r){
    var overlap = r.top3_overlap !== undefined ? r.top3_overlap : (r.podium_hit ? 1 : 0);
    var cls = r.win_hit ? 'hit-all' : overlap >= 2 ? 'hit-partial' : overlap === 1 ? 'hit-partial' : 'hit-none';
    var predTop3 = r.pred_top3 || [r.pred_winner];
    var actualTop3 = r.actual_top3 || [r.actual_winner];
    var actualSet = {};
    actualTop3.forEach(function(d){actualSet[d]=true;});
    var pills = predTop3.map(function(d){
      var isMatch = actualSet[d];
      return '<span class="acc-pill '+(isMatch?'match':'miss')+'">'+nm(d)+'</span>';
    }).join('');
    // aggiungi chi mancava nel previsto ma era in top3 reale
    actualTop3.forEach(function(d){
      if(predTop3.indexOf(d)===-1) pills += '<span class="acc-pill neutral">+'+nm(d)+'</span>';
    });
    var winIcon = r.win_hit ? '🎯' : r.podium_hit ? '🔵' : '❌';
    return '<div class="acc-card '+cls+'">'+
      '<div class="acc-overlap">'+overlap+'<span>/3</span></div>'+
      '<div class="acc-card-race">'+r.race+(r.date?' · <span>'+r.date+'</span>':'')+(r.source==='frozen'?' ❄':'')+(r.mae_clean!=null?' · <span title="errore medio posizioni, DNF esclusi">MAE '+r.mae_clean+'</span>':'')+'</div>'+
      '<div class="acc-card-winner">'+
        '<span class="win-icon">'+winIcon+'</span>'+
        '<div class="win-names">'+
          '<div class="win-pred">prev: '+nm(r.pred_winner)+'</div>'+
          '<div class="win-actual">reale: '+nm(r.actual_winner)+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="acc-top3">'+pills+'</div>'+
    '</div>';
  }).join('');
}

// MODELLO
function renderModello(){
  var ma=D.model_accuracy||{};var race=ma.race||{};var quali=ma.quali||{};var sc=ma.scorecard||{};
  document.getElementById('accStats').innerHTML=
    stat(race.win_pct||0,'%','Vittorie previste',(race.win_hits||0)+'/'+(race.total||0)+' gare','num-yellow')+
    stat(quali.pole_pct||0,'%','Pole previste',(quali.pole_hits||0)+'/'+(quali.total||0)+' qualifiche','num-green')+
    stat(sc.mae_clean_avg!=null?sc.mae_clean_avg:'—','','MAE medio (no DNF)','posizioni di errore per pilota','num-green')+
    stat(sc.spearman_avg!=null?sc.spearman_avg:'—','','Spearman medio','correlazione ordine d\'arrivo (1=perfetto)','num-yellow');
  var vf=document.getElementById('accVerify');
  if(vf) vf.innerHTML=(sc.frozen_count?('❄ '+sc.frozen_count+(sc.frozen_count===1?' previsione congelata':' previsioni congelate')+' pre-evento con hash SHA256 — '):'')+
    '<a href="'+(sc.verify_url||'#')+'" target="_blank" rel="noopener" style="color:var(--acc)">verifica il track record su GitHub →</a>';
  function accRow(r,pk,ak,hk){
    var hit=r[hk];
    return '<div class="acc-row"><div class="acc-race">'+r.race+(r.date?'<span style="color:var(--mut);font-size:11px;margin-left:5px">'+r.date+'</span>':'')+(r.source==='frozen'?' <span title="previsione congelata pre-evento (verificabile)">❄</span>':'')+'</div>'+
      '<div class="acc-pred">prev: <b>'+nm(r[pk])+'</b>'+(r.mae_clean!=null?' <span style="color:var(--mut);font-size:10px">MAE '+r.mae_clean+'</span>':'')+'</div>'+
      '<div class="acc-actual '+(hit?'hit-yes':'hit-no')+'">reale: '+nm(r[ak])+'</div>'+
      '<span class="hit-badge '+(hit?'hit-y':'hit-n')+'">'+(hit?'✓':'✗')+'</span></div>';
  }
  document.getElementById('raceAcc').innerHTML=(race.races||[]).map(function(r){return accRow(r,'pred_winner','actual_winner','win_hit');}).join('')||'<div style="padding:14px;color:var(--mut)">Nessun dato</div>';
  document.getElementById('qualiAcc').innerHTML=(quali.races||[]).map(function(r){return accRow(r,'pred_pole','actual_pole','pole_hit');}).join('')||'<div style="padding:14px;color:var(--mut)">Nessun dato</div>';
}
function stat(n,u,l,s,cls){return '<div class="stat"><div class="num '+cls+'">'+n+'<span style="font-size:18px">'+u+'</span></div><div class="lbl">'+l+'</div><div class="sub">'+s+'</div></div>';}

// ===== Skill di PASSO del modello (leakage-free, da pace_skill.json) =====
async function loadPaceSkill(){
  var el=document.getElementById('paceSkill'); if(!el) return;
  try{
    var s=((await (await fetch('data/pace_skill.json?_='+Date.now(),{cache:'no-store'})).json()).season)||{};
    var hist=null; try{ hist=await (await fetch('data/pace_hist.json?_='+Date.now(),{cache:'no-store'})).json(); }catch(e){}
    if(s.spearman_pace==null && !hist) return;
    var big = hist ? hist.spearman_pace : s.spearman_pace;
    var ng  = hist ? hist.n_gare : s.n_gare;
    var recent = (hist && s.spearman_pace!=null) ? ' Nel 2026 (su '+s.n_gare+' gare, campione più piccolo) è '+s.spearman_pace+'.' : '';
    el.innerHTML='<div class="card" style="border-left:3px solid #4ade80"><div style="font-size:15px">'+
      '<b>Skill di passo: '+big+'</b> — su <b>'+ng+' gare</b> (4 stagioni) il modello ordina le auto per <b>velocità reale</b> '+
      '(correlazione di rango col passo gara) quasi alla perfezione.'+recent+
      ' Sull’arrivo il numero scende: quel divario è la varianza della gara (ritiri, strategia), non un errore del modello.</div></div>';
  }catch(e){}
}

// ===== Calibrazione probabilistica (skill vs base-rate, da calibration.json) =====
async function loadCalibration(){
  var el=document.getElementById('calibSkill'); if(!el) return;
  try{
    var r=await fetch('data/calibration.json?_='+Date.now(),{cache:'no-store'});
    var d=await r.json();
    if(!d.win) return;
    var pct=function(x){return (x>=0?'+':'')+Math.round(x*100)+'%';};
    el.innerHTML='<div class="card" style="border-left:3px solid #60a5fa"><div style="font-size:15px">'+
      '<b>Probabilità calibrate</b> — su '+d.n+' pilota-gara (backtest 92 gare, 4 stagioni) le probabilità '+
      'battono il base-rate: <b>vincitore '+pct(d.win.skill)+'</b>, podio '+pct(d.podium.skill)+', top-10 '+pct(d.top10.skill)+' di skill. '+
      'Quando diciamo 30%, esce ~30%: probabilità oneste e verificate, non promesse.</div></div>';
  }catch(e){}
}

// ===== Modello vs Mercato (benchmark cumulativo dai freeze; anti-leakage) =====
async function loadMktBench(){
  var el = document.getElementById('mktBench'); if(!el) return;
  try{
    var r = await fetch('data/benchmark_cumulativo.json?_=' + Date.now(), {cache:'no-store'});
    var b = await r.json();
    var a = b.aggregato;
    if(a && a.n_gare){
      el.innerHTML = '<div class="card"><div style="font-size:15px">'+
        '<b>Modello vs mercato — '+a.n_gare+' '+(a.n_gare===1?'gara':'gare')+'.</b> '+
        'Confrontiamo le nostre probabilità con le quote di mercato <b>congelate prima della gara</b> (niente senno di poi). '+
        'Brier più basso in '+a.gare_modello_batte_mercato+'/'+a.n_gare+' (Δ medio '+(a.brier_delta_medio>0?'+':'')+a.brier_delta_medio+', >0 = modello più accurato); '+
        'log-loss '+a.logloss_modello_medio+' vs '+a.logloss_mercato_medio+'. '+
        '<span style="color:var(--mut)">È un <b>controllo di calibrazione</b> su campione piccolo, non un claim di "battere le quote": il mercato del vincitore in F1 è efficiente e servono molte gare per conclusioni solide.</span>'+
        '</div></div>';
    } else {
      var pend = (b.pending||[])[0];
      var html = '<div class="card"><b>Primo verdetto a Spa (18 lug).</b> Finché il mercato-vincitore non è liquido, il benchmark parte dal freeze post-qualifiche.';
      if(pend && pend.divergenze && pend.divergenze.length){
        html += '<div style="margin-top:10px;font-size:13px">Divergenze già congelate ('+pend.race+'):<br>';
        pend.divergenze.forEach(function(d){
          var s = d.delta>0 ? 'modello più alto' : 'mercato più alto';
          html += '· <b>'+d.driver+'</b> — modello '+(d.p_model*100).toFixed(0)+'% vs mercato '+(d.p_market*100).toFixed(0)+'% ('+s+')<br>';
        });
        html += '</div>';
      }
      el.innerHTML = html + '</div>';
    }
  }catch(e){ el.innerHTML = '<p class="lead" style="color:var(--mut)">Benchmark mercato non ancora disponibile.</p>'; }
}

// INIT
renderHero();renderQuali();renderSprint();renderSprintRace();renderGara();renderClassifica();
renderTitolo();renderH2H();renderFanta();renderPasso();
// revisione 29/09: renderTyre non era mai chiamata (il pannello gomme restava vuoto da giugno); i due pannelli nuovi
// non devono poter fermare l'avvio del resto della pagina
[renderTyre, renderLongRun, menuGarePasso].forEach(function(f){ try { f(); } catch(e){ console.error(e); } });
renderStorico();renderModello();renderAccCards();renderCalendario();renderDelta();loadMktBench();loadPaceSkill();loadCalibration();
if(Object.keys(ESE_SCENARIOS).length){renderEseCards();setEseScenario("asciutto");}
// ===== PWA / SERVICE WORKER =====
// SW NON registrato: su GitHub Pages '/sw.js' era comunque un 404 (path assoluto
// fuori da /polelap/), e un SW che cacha e' veleno per un sito di track record
// (rischio previsioni stale). Unregister difensivo per eventuali SW residui.
let _pwaPrompt = null;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(function(rs){ rs.forEach(function(r){ r.unregister(); }); })
    .catch(function(){});
}

// ===== AUTO-REFRESH: ricarica le tab quando esce una nuova previsione (fine sessione) =====
(function(){
  var _D = window.POLELAP_DATA || window.GRIDLAB_DATA || {};   // vedi ponte di rinomina sopra
  var _loaded = _D.generato_at || _D.aggiornato;
  function _check(){
    fetch('data/previsione.json?_=' + Date.now(), {cache:'no-store'})
      .then(function(r){ return r.json(); })
      .then(function(j){
        var now = j.generato_at || j.aggiornato;
        if (_loaded && now && now !== _loaded){
          console.log('[auto-refresh] nuova previsione:', now, '— ricarico le tab');
          location.reload();
        }
      }).catch(function(){});
  }
  setInterval(_check, 90000);                                   // ogni 90 secondi
  document.addEventListener('visibilitychange', function(){     // e al ritorno sulla tab
    if (!document.hidden) _check();
  });
})();

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _pwaPrompt = e;
  setTimeout(function() {
    if (!localStorage.getItem('pwa_dismissed')) {
      document.getElementById('pwa-banner').style.display = 'flex';
    }
  }, 3000);
});

function pwaInstall() {
  if (!_pwaPrompt) return;
  _pwaPrompt.prompt();
  _pwaPrompt.userChoice.then(function(r) {
    if (r.outcome === 'accepted') document.getElementById('pwa-banner').style.display = 'none';
    _pwaPrompt = null;
  });
}

function pwaDismiss() {
  document.getElementById('pwa-banner').style.display = 'none';
  localStorage.setItem('pwa_dismissed', '1');
}

window.addEventListener('appinstalled', function() {
  document.getElementById('pwa-banner').style.display = 'none';
});

// ══════════════════════════════════════════════════════════════
// NUOVE SEZIONI DASHBOARD
// ══════════════════════════════════════════════════════════════

// ── Trend Campionato ─────────────────────────────────────────
var _trendChart = null;
function renderTrend() {
  var ph = D.points_history || {};
  var drivers = Object.keys(ph);
  // ordina per punti finali desc, top 6
  drivers.sort(function(a,b){ var av=ph[a], bv=ph[b]; return (bv[bv.length-1]||{cum:0}).cum - (av[av.length-1]||{cum:0}).cum; });
  drivers = drivers.slice(0,6);
  // labels = GP abbreviati
  var allRounds = [];
  if (drivers.length > 0) {
    ph[drivers[0]].forEach(function(e){ allRounds.push(e.race.replace(' Grand Prix','').replace(' Sprint','')); });
  }
  var COLORS=['#e10600','#00D7B6','#FF8000','#3671C6','#d8b766','#9B1B30'];
  var datasets = drivers.map(function(drv,i){
    return {
      label: NM[drv]||drv,
      data: ph[drv].map(function(e){ return e.cum; }),
      borderColor: COLORS[i%COLORS.length],
      backgroundColor: COLORS[i%COLORS.length]+'22',
      tension:0.3, fill:false, pointRadius:3, borderWidth:2,
    };
  });
  var ctx = document.getElementById('trendChart');
  if (!ctx) return;
  if (_trendChart) _trendChart.destroy();
  _trendChart = new Chart(ctx, {
    type:'line',
    data:{ labels: allRounds, datasets: datasets },
    options:{
      responsive:true, animation:false,
      plugins:{ legend:{ display:true, labels:{ color:'#e8ecf3', font:{size:12} } } },
      scales:{
        x:{ ticks:{ color:'#8b97ad', maxRotation:40 }, grid:{ color:'#2a3142' } },
        y:{ ticks:{ color:'#8b97ad' }, grid:{ color:'#2a3142' } }
      }
    }
  });
}

// ── Radar Team ───────────────────────────────────────────────
var _radarChart = null;
var _radarSelected = [];
function renderRadar(teams) {
  var radar = D.team_radar || [];
  if (!radar.length) { document.getElementById('radarChart') && (document.getElementById('radarChart').parentElement.innerHTML='<p style="color:var(--mut);text-align:center;padding:40px">Dati non disponibili</p>'); return; }
  // Bottoni team
  var btnContainer = document.getElementById('radarTeamBtns');
  if (btnContainer && !btnContainer.children.length) {
    var topTeams = radar.slice(0,6).map(function(r){return r.team;});
    _radarSelected = topTeams.slice(0,3);
    radar.forEach(function(r) {
      var btn = document.createElement('button');
      btn.textContent = r.team;
      btn.dataset.team = r.team;
      btn.style.cssText='padding:5px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--txt);cursor:pointer;font-size:12px;transition:.2s';
      if (_radarSelected.includes(r.team)) { btn.style.borderColor='var(--acc2)'; btn.style.color='var(--acc2)'; }
      btn.onclick = function() {
        var t = this.dataset.team;
        var idx = _radarSelected.indexOf(t);
        if (idx>-1) { _radarSelected.splice(idx,1); this.style.borderColor='var(--line)'; this.style.color='var(--txt)'; }
        else { _radarSelected.push(t); this.style.borderColor='var(--acc2)'; this.style.color='var(--acc2)'; }
        renderRadarChart(_radarSelected);
      };
      btnContainer.appendChild(btn);
    });
  }
  renderRadarChart(_radarSelected);
}

function renderRadarChart(teams) {
  var radar = D.team_radar || [];
  var LABELS=['Quali Pace','Race Pace','Affidabilità','Pit Speed','Tyre Deg'];
  var COLORS=['#e10600','#00D7B6','#FF8000','#3671C6','#d8b766','#9B1B30'];
  var datasets = teams.map(function(team,i) {
    var row = radar.find(function(r){return r.team===team;});
    if (!row) return null;
    var color = TC[team]||COLORS[i%COLORS.length];
    return {
      label: team,
      data: [row.quali_pace, row.race_pace, row.reliability, row.pit_speed, row.tyre_deg],
      borderColor: color, backgroundColor: color+'33', pointBackgroundColor: color, borderWidth:2,
    };
  }).filter(Boolean);
  var ctx = document.getElementById('radarChart');
  if (!ctx) return;
  if (_radarChart) _radarChart.destroy();
  _radarChart = new Chart(ctx, {
    type:'radar',
    data:{ labels:LABELS, datasets:datasets },
    options:{
      responsive:true, animation:false,
      plugins:{ legend:{ labels:{ color:'#e8ecf3', font:{size:12} } } },
      scales:{ r:{ min:0, max:100, ticks:{ color:'#8b97ad', stepSize:20 }, grid:{ color:'#2a3142' }, pointLabels:{ color:'#e8ecf3', font:{size:12} }, angleLines:{ color:'#2a3142' } } }
    }
  });
}

// ── Scenari Titolo ───────────────────────────────────────────
function renderScenari() {
  var ch = D.championship || {};
  var ds = D.driver_standings || [];
  var gareRim = ch.gare_rimanenti || '?';
  var el = document.getElementById('scGareRim');
  if (el) el.textContent = gareRim;
  var cards = document.getElementById('scenariCards');
  if (!cards) return;
  cards.innerHTML = '';
  var pts = {}; ds.forEach(function(d){ pts[d.driver]=d.points; });
  var leader = ds[0] || {};
  (ch.piloti||[]).forEach(function(p) {
    var name = NM[p.driver]||p.driver;
    var team = (ds.find(function(d){return d.driver===p.driver;})||{}).team||'';
    var teamColor = TC[team]||'#888';
    var pPts = pts[p.driver]||0;
    var gap = (pts[leader.driver]||0) - pPts;
    var pct = p.p_title;
    var bar = Math.max(1, pct);
    var card = document.createElement('div');
    card.style.cssText='background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px';
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      +'<div><span style="font-weight:700;font-size:15px">'+name+'</span>'
      +'<span style="margin-left:8px;font-size:12px;color:var(--mut)">'+team+'</span></div>'
      +'<span style="font-size:13px;font-weight:700;color:var(--gold)">'+pPts+' pt</span>'
      +'</div>'
      +'<div style="background:#1a1a2e;border-radius:6px;overflow:hidden;height:8px;margin-bottom:8px">'
      +'<div style="height:100%;background:'+teamColor+';width:'+bar+'%;border-radius:6px;transition:.5s"></div>'
      +'</div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px">'
      +'<span style="color:var(--mut)">Gap: '+(gap>0?'-'+gap:leader.driver===p.driver?'LEADER':gap)+' pt</span>'
      +'<span style="color:'+(pct>10?'#4caf50':'var(--mut)')+'">P(titolo): '+pct+'%</span>'
      +'</div>';
    cards.appendChild(card);
  });
  var cCards = document.getElementById('scenariCostrCards');
  if (!cCards) return;
  cCards.innerHTML='';
  (ch.costruttori||[]).forEach(function(c) {
    var color = TC[c.team]||'#888';
    var cPts = (D.constructor_standings||[]).find(function(x){return x.team===c.team;});
    var card = document.createElement('div');
    card.style.cssText='background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px';
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
      +'<span style="font-weight:700;font-size:14px">'+c.team+'</span>'
      +'<span style="font-size:12px;color:var(--gold)">'+(cPts?cPts.points+' pt':'')+'</span>'
      +'</div>'
      +'<div style="background:#1a1a2e;border-radius:6px;overflow:hidden;height:6px;margin-bottom:6px">'
      +'<div style="height:100%;background:'+color+';width:'+Math.max(1,c.p_title)+'%;border-radius:6px"></div>'
      +'</div>'
      +'<span style="font-size:12px;color:'+(c.p_title>10?'#4caf50':'var(--mut)')+'">P(titolo): '+c.p_title+'%</span>';
    cCards.appendChild(card);
  });
}

// ── Race Pace Ranking ────────────────────────────────────────
var _racePaceChart = null;
function renderRacePace() {
  var rp = D.race_pace || {};
  var drivers = (rp.drivers||[]).slice(0,16);
  if (!drivers.length) return;
  var labels = drivers.map(function(d){ return NM[d.driver]||d.driver; });
  var gaps   = drivers.map(function(d){ return d.gap; });
  var colors = drivers.map(function(d){ return TC[d.team]||'#888'; });
  var ctx = document.getElementById('racePaceChart');
  if (!ctx) return;
  if (_racePaceChart) _racePaceChart.destroy();
  _racePaceChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels:labels,
      datasets:[{ label:'Gap al leader (s)', data:gaps, backgroundColor:colors, borderRadius:6 }]
    },
    options:{
      indexAxis:'y', responsive:true, animation:false,
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:function(c){ return '+'+c.raw.toFixed(3)+'s'; } } } },
      scales:{
        x:{ ticks:{ color:'#8b97ad', callback:function(v){ return '+'+v.toFixed(1)+'s'; } }, grid:{ color:'#2a3142' } },
        y:{ ticks:{ color:'#e8ecf3', font:{size:12} }, grid:{ display:false } }
      }
    }
  });
}

// ── Pit Stop Optimizer ───────────────────────────────────────
function renderPitStop() {
  var data = D.pit_optimizer || [];
  var tbody = document.getElementById('pitBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  var stratIcon = { early:'🚀', medium:'⚖️', late:'🛡️' };
  data.forEach(function(row) {
    var color = TC[row.team]||'#888';
    var uc = row.undercut_window ? 'Lap '+row.undercut_window[0]+'–'+row.undercut_window[1] : '—';
    var oc = row.overcut_window  ? 'Lap '+row.overcut_window[0]+'–'+row.overcut_window[1]  : '—';
    var tr = document.createElement('tr');
    tr.style.borderBottom='1px solid var(--line)';
    tr.innerHTML='<td style="padding:10px 12px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+color+';margin-right:8px"></span>'+row.team+'</td>'
      +'<td style="text-align:center;padding:10px 12px;color:var(--acc2);font-weight:700">'+(row.avg_pit_lap||'—')+'</td>'
      +'<td style="text-align:center;padding:10px 12px">'+(row.avg_stops||'—')+'</td>'
      +'<td style="text-align:center;padding:10px 12px">'+(stratIcon[row.strategy]||'')+'&nbsp;'+(row.strategy||'—')+'</td>'
      +'<td style="text-align:center;padding:10px 12px;color:#4caf50">'+uc+'</td>'
      +'<td style="text-align:center;padding:10px 12px;color:#ff9800">'+oc+'</td>';
    tbody.appendChild(tr);
  });
}

// ── Driver Form ──────────────────────────────────────────────
function renderForm() {
  var pd = D.prediction_delta || [];
  if (!pd.length) return;
  // Aggrega ultimi 3 GP per pilota
  var last3 = pd.slice(-3);
  var drvDelta = {};
  last3.forEach(function(race) {
    (race.rows||[]).forEach(function(row) {
      if (!drvDelta[row.driver]) drvDelta[row.driver] = { deltas:[], team: row.team };
      drvDelta[row.driver].deltas.push(row.delta);
    });
  });
  // ordina per media delta desc
  var sorted = Object.keys(drvDelta).sort(function(a,b) {
    var avg=function(d){ var v=drvDelta[d].deltas; return v.reduce(function(s,x){return s+x;},0)/v.length; };
    return avg(b)-avg(a);
  });
  var grid = document.getElementById('formGrid');
  if (!grid) return;
  grid.innerHTML='';
  sorted.forEach(function(drv) {
    var info = drvDelta[drv];
    var avg = info.deltas.reduce(function(s,x){return s+x;},0)/info.deltas.length;
    var color = TC[info.team]||'#888';
    var isHot = avg > 0.02;
    var isCold = avg < -0.02;
    var badge = isHot ? '<span style="background:#1a3a1a;color:#4caf50;border-radius:5px;padding:2px 7px;font-size:10px;font-weight:700">🔥 IN FORMA</span>'
                      : isCold ? '<span style="background:#3a1a1a;color:#f44336;border-radius:5px;padding:2px 7px;font-size:10px;font-weight:700">❄️ MOMENTO NO</span>'
                      : '<span style="background:var(--panel2);color:var(--mut);border-radius:5px;padding:2px 7px;font-size:10px;font-weight:700">➖ NEUTRO</span>';
    var bars = info.deltas.map(function(d,i) {
      var pct = Math.abs(d)*200;
      var bg = d>0?'#4caf50':'#f44336';
      return '<div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--mut)">'
        +'<span style="min-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(last3[i]?last3[i].race.replace(' Grand Prix',''):'')+'</span>'
        +'<div style="flex:1;background:#1a1a2e;border-radius:3px;height:6px"><div style="height:100%;background:'+bg+';width:'+Math.min(100,pct)+'%;border-radius:3px"></div></div>'
        +'<span style="min-width:40px;text-align:right;color:'+bg+'">'+(d>0?'+':'')+Math.round(d*100)+'%</span>'
        +'</div>';
    }).join('');
    var card = document.createElement('div');
    card.style.cssText='background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;border-left:3px solid '+color;
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
      +'<div><span style="font-weight:700;font-size:14px">'+(NM[drv]||drv)+'</span>'
      +'<span style="margin-left:6px;font-size:11px;color:var(--mut)">'+info.team+'</span></div>'
      +badge+'</div>'+bars;
    grid.appendChild(card);
  });
}

// ── Safety Car ───────────────────────────────────────────────
var _scChart = null;
function renderSafetyCar() {
  var sc = D.safety_car || [];
  if (!sc.length) return;
  var labels = sc.map(function(x){ return x.name.replace(' GP',''); });
  var probs  = sc.map(function(x){ return Math.round(x.sc_prob*100); });
  var colors = sc.map(function(x){ return x.sc_prob>=0.7?'#f44336':x.sc_prob>=0.5?'#ff9800':'#4caf50'; });
  var ctx = document.getElementById('scChart');
  if (!ctx) return;
  if (_scChart) _scChart.destroy();
  _scChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels:labels,
      datasets:[{ label:'P(Safety Car) %', data:probs, backgroundColor:colors, borderRadius:6 }]
    },
    options:{
      responsive:true, animation:false,
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:function(c){ return c.raw+'%'; } } } },
      scales:{
        x:{ ticks:{ color:'#8b97ad', maxRotation:45 }, grid:{ display:false } },
        y:{ min:0, max:100, ticks:{ color:'#8b97ad', callback:function(v){ return v+'%'; } }, grid:{ color:'#2a3142' } }
      }
    }
  });
}

// ── ERS Heatmap ──────────────────────────────────────────────
var _ersChart = null;
function renderERS() {
  var ers = D.ers_heatmap || {};
  if (!ers.teams||!ers.teams.length) {
    document.getElementById('ersTable') && (document.getElementById('ersTable').innerHTML='<p style="color:var(--mut);padding:20px">Dati SpeedST non ancora disponibili per il 2026.</p>');
    return;
  }
  var teams = ers.teams;
  var sessions = ers.sessions.map(function(s){ return s.replace(' Grand Prix 2026','').replace(' 2026',''); });
  // Tabella heatmap
  var minV=9999,maxV=0;
  teams.forEach(function(t){ (ers.data[t]||[]).forEach(function(v){ if(v!=null){minV=Math.min(minV,v);maxV=Math.max(maxV,v);} }); });
  var tbl='<table style="border-collapse:collapse;font-size:12px;width:100%"><thead><tr><th style="text-align:left;padding:6px 10px;color:var(--mut)">Team</th>';
  sessions.forEach(function(s){ tbl+='<th style="text-align:center;padding:6px 8px;color:var(--mut);font-size:11px">'+s+'</th>'; });
  tbl+='<th style="text-align:center;padding:6px 8px;color:var(--mut)">Media</th></tr></thead><tbody>';
  teams.forEach(function(t) {
    var color = TC[t]||'#888';
    tbl+='<tr style="border-bottom:1px solid var(--line)">';
    tbl+='<td style="padding:7px 10px;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+color+'"></span>'+t+'</td>';
    var vals = ers.data[t]||[];
    vals.forEach(function(v) {
      if (v==null) { tbl+='<td style="text-align:center;padding:7px 8px;color:var(--mut)">—</td>'; return; }
      var pct=(v-minV)/(maxV-minV||1);
      var bg='rgba('+Math.round(pct*225)+','+(100+Math.round(pct*100))+',0,'+(0.15+pct*0.5)+')';
      tbl+='<td style="text-align:center;padding:7px 8px;background:'+bg+';color:#e8ecf3;font-weight:600">'+v+'</td>';
    });
    var avg=ers.avg[t]||0;
    tbl+='<td style="text-align:center;padding:7px 8px;color:var(--acc2);font-weight:700">'+avg+'</td>';
    tbl+='</tr>';
  });
  tbl+='</tbody></table>';
  document.getElementById('ersTable').innerHTML=tbl;
  // Bar chart media SpeedST per team
  var ctx=document.getElementById('ersChart');
  if (!ctx) return;
  if (_ersChart) _ersChart.destroy();
  var avgTeams=teams.map(function(t){ return {team:t,avg:ers.avg[t]||0}; }).sort(function(a,b){return b.avg-a.avg;});
  _ersChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels:avgTeams.map(function(x){return x.team;}),
      datasets:[{ label:'Media SpeedST (km/h)', data:avgTeams.map(function(x){return x.avg;}), backgroundColor:avgTeams.map(function(x){return TC[x.team]||'#888';}), borderRadius:6 }]
    },
    options:{
      responsive:true, animation:false,
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ ticks:{ color:'#8b97ad', maxRotation:35 }, grid:{ display:false } },
        y:{ ticks:{ color:'#8b97ad' }, grid:{ color:'#2a3142' } }
      }
    }
  });
}

// ── Hook nel tab switch ──────────────────────────────────────
var _newSectionRendered = {};
var _origSwitchSection = setSection;

function switchSectionExtended(id) {
  if (_origSwitchSection) _origSwitchSection(id);
  if (!_newSectionRendered[id]) {
    _newSectionRendered[id] = true;
    if (id==='trend')     renderTrend();
    if (id==='radar')     renderRadar();
    if (id==='scenari')   renderScenari();
    if (id==='racepace')  renderRacePace();
    if (id==='pitstop')   renderPitStop();
    if (id==='form')      renderForm();
    if (id==='safetycar') renderSafetyCar();
    if (id==='ers')       renderERS();
    if (id==='supertimes') renderSuperTimes();
    if (id==='teamdev')    renderTeamDev();
    if (id==='gridfinish') renderGridFinish();
    if (id==='reliability') renderReliability();
    if (id==='constbattle') renderConstBattle();
    if (id==='tyresimu')   renderTyreSimu();
  }
}

// ── Super Times ──────────────────────────────────────────────
var _superTimesChart = null;
function renderSuperTimes() {
  var st = D.super_times || {};
  var circuits = st.circuits || [];
  var drivers  = st.drivers  || {};
  if (!circuits.length) {
    var el = document.getElementById('s-supertimes');
    if (el) el.innerHTML = '<p style="color:var(--txt-dim);padding:32px">Dati non disponibili.</p>';
    return;
  }
  var COLORS = ['#e10600','#00D7B6','#FF8000','#3671C6','#d8b766','#9B1B30','#27F4D2','#B6BABD','#FF87B7','#00A19C'];
  var drvKeys = Object.keys(drivers);
  var datasets = drvKeys.map(function(drv, i) {
    return {
      label: (typeof NM !== 'undefined' && NM[drv]) || drv,
      data: drivers[drv],
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '22',
      tension: 0.3, fill: false, pointRadius: 5, pointHoverRadius: 7, borderWidth: 2, spanGaps: true
    };
  });
  var ctx = document.getElementById('superTimesChart');
  if (!ctx) return;
  if (_superTimesChart) _superTimesChart.destroy();
  _superTimesChart = new Chart(ctx, {
    type: 'line',
    data: { labels: circuits, datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c) { var v=c.parsed.y; return c.dataset.label+': '+(v===null?'N/D':v===0?'FASTEST':'+'+v.toFixed(3)+'%'); } } }
      },
      scales: {
        x: { ticks: { color: '#8b97ad' }, grid: { color: '#2a3142' } },
        y: { reverse: true, ticks: { color: '#8b97ad', callback: function(v){ return '+'+v.toFixed(2)+'%'; } }, grid: { color: '#2a3142' } }
      }
    }
  });
  var leg = document.getElementById('superTimesLegend');
  if (leg) {
    leg.innerHTML = drvKeys.map(function(drv, i) {
      var vals = (drivers[drv]||[]).filter(function(v){return v!==null;});
      var avg = vals.length ? (vals.reduce(function(a,b){return a+b;},0)/vals.length).toFixed(3) : 'N/D';
      return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px"><span style="width:20px;height:3px;background:'+COLORS[i%COLORS.length]+';display:inline-block;border-radius:2px"></span><span>'+((typeof NM!=='undefined'&&NM[drv])||drv)+' (media +'+avg+'%)</span></span>';
    }).join('');
  }
}


// ── Team Development ─────────────────────────────────────────
var _teamDevChart = null;
function renderTeamDev() {
  var td = D.team_development || {};
  var circuits = td.circuits || [];
  var teams = td.teams || {};
  if (!circuits.length) return;
  var TEAM_COLORS = TC; // usa il master TC — unica fonte colori
  var drvKeys = Object.keys(teams);
  var datasets = drvKeys.map(function(t) {
    return {
      label: t, data: teams[t],
      borderColor: TEAM_COLORS[t] || '#8b97ad',
      backgroundColor: (TEAM_COLORS[t] || '#8b97ad') + '22',
      tension: 0.3, fill: false, pointRadius: 4, borderWidth: 2, spanGaps: true
    };
  });
  var ctx = document.getElementById('teamDevChart');
  if (!ctx) return;
  if (_teamDevChart) _teamDevChart.destroy();
  _teamDevChart = new Chart(ctx, {
    type: 'line', data: { labels: circuits, datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: function(c){ return c.dataset.label+': pos media '+c.parsed.y.toFixed(1); } } }
      },
      scales: {
        x: { ticks: { color:'#8b97ad' }, grid: { color:'#2a3142' } },
        y: { reverse: true, min: 1,
          ticks: { color:'#8b97ad', callback: function(v){ return 'P'+v; } },
          grid: { color:'#2a3142' },
          title: { display: true, text: 'Pos. media (più basso = meglio)', color:'#8b97ad', font:{size:11} }
        }
      }
    }
  });
  var leg = document.getElementById('teamDevLegend');
  if (leg) {
    leg.innerHTML = drvKeys.map(function(t) {
      var c = TEAM_COLORS[t] || '#8b97ad';
      var vals = (teams[t]||[]).filter(function(v){return v!==null;});
      var avg = vals.length ? (vals.reduce(function(a,b){return a+b;},0)/vals.length).toFixed(1) : 'N/D';
      return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px"><span style="width:20px;height:3px;background:'+c+';display:inline-block;border-radius:2px"></span><span>'+t+' (media P'+avg+')</span></span>';
    }).join('');
  }
}

// ── Grid → Finish ─────────────────────────────────────────────
var _gridFinishChart = null;
function renderGridFinish() {
  var gf = D.grid_finish || [];
  if (!gf.length) return;
  var TEAM_COLORS = TC; // usa il master TC — unica fonte colori
  // Un dataset per team
  var byTeam = {};
  gf.forEach(function(d) {
    byTeam[d.team] = byTeam[d.team] || [];
    byTeam[d.team].push({ x: d.grid, y: d.finish, driver: d.driver, race: d.race, gained: d.gained });
  });
  var datasets = Object.keys(byTeam).map(function(t) {
    return {
      label: t, data: byTeam[t],
      backgroundColor: (TEAM_COLORS[t] || '#8b97ad') + 'cc',
      borderColor: TEAM_COLORS[t] || '#8b97ad',
      pointRadius: 5, pointHoverRadius: 8
    };
  });
  // Linea diagonale (griglia = arrivo)
  datasets.push({
    label: 'Diagonale', data: [{x:1,y:1},{x:22,y:22}],
    borderColor: '#ffffff33', borderDash: [5,5],
    pointRadius: 0, borderWidth: 1, type: 'line', fill: false, tension: 0
  });
  var ctx = document.getElementById('gridFinishChart');
  if (!ctx) return;
  if (_gridFinishChart) _gridFinishChart.destroy();
  _gridFinishChart = new Chart(ctx, {
    type: 'scatter', data: { datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: function(c) {
            var d = c.raw;
            var g = d.gained > 0 ? '+'+d.gained : d.gained;
            return (d.driver||'') + ' ' + (d.race||'').replace(' Grand Prix','') + ' | Griglia: P'+d.x+' → Arrivo: P'+d.y+' ('+g+')';
          }
        }}
      },
      scales: {
        x: { min:1, max:22, reverse: false,
          ticks: { color:'#8b97ad', callback: function(v){ return 'P'+v; } },
          grid: { color:'#2a3142' },
          title: { display: true, text: 'Posizione griglia', color:'#8b97ad', font:{size:11} }
        },
        y: { min:1, max:22, reverse: true,
          ticks: { color:'#8b97ad', callback: function(v){ return 'P'+v; } },
          grid: { color:'#2a3142' },
          title: { display: true, text: 'Posizione arrivo', color:'#8b97ad', font:{size:11} }
        }
      }
    }
  });
  var info = document.getElementById('gridFinishInfo');
  if (info) {
    var gained = gf.filter(function(d){return d.gained>0;}).length;
    var lost = gf.filter(function(d){return d.gained<0;}).length;
    var same = gf.filter(function(d){return d.gained===0;}).length;
    info.innerHTML = 'Su '+gf.length+' arrivi classificati: <span style="color:#00D7B6">'+gained+' guadagnati</span> · <span style="color:#e10600">'+lost+' persi</span> · '+same+' invariati';
  }
}

// ── Reliability ───────────────────────────────────────────────
var _reliabilityChart = null;
function renderReliability() {
  var rel = D.reliability || [];
  if (!rel.length) return;
  var TEAM_COLORS = TC; // usa il master TC — unica fonte colori
  var labels = rel.map(function(t){return t.team;});
  var ctx = document.getElementById('reliabilityChart');
  if (!ctx) return;
  if (_reliabilityChart) _reliabilityChart.destroy();
  _reliabilityChart = new Chart(ctx, {
    type: 'bar', 
    data: {
      labels: labels,
      datasets: [
        { label: 'Meccanici', data: rel.map(function(t){return t.dnf_mech;}), backgroundColor: '#e10600cc', stack: 'dnf' },
        { label: 'Incidente', data: rel.map(function(t){return t.dnf_incident;}), backgroundColor: '#FF8000cc', stack: 'dnf' },
        { label: 'Altro', data: rel.map(function(t){return t.dnf_other;}), backgroundColor: '#8b97adcc', stack: 'dnf' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: { labels: { color:'#e8ecf3', font:{size:12} } },
        tooltip: { callbacks: {
          afterBody: function(items) {
            var idx = items[0].dataIndex;
            return 'Tasso DNF: '+rel[idx].dnf_rate+'%  ('+rel[idx].dnf_total+'/'+rel[idx].races+' partenze)';
          }
        }}
      },
      scales: {
        x: { ticks:{color:'#8b97ad',maxRotation:40}, grid:{color:'#2a3142'}, stacked: true },
        y: { ticks:{color:'#8b97ad',stepSize:1}, grid:{color:'#2a3142'}, stacked: true,
          title:{display:true,text:'N° ritiri',color:'#8b97ad',font:{size:11}} }
      }
    }
  });
  // Tabella
  var tbl = document.getElementById('reliabilityTable');
  if (tbl) {
    var rows = rel.map(function(t) {
      var c = TEAM_COLORS[t.team] || '#8b97ad';
      return '<tr><td style="padding:6px 10px"><span style="display:inline-block;width:10px;height:10px;background:'+c+';border-radius:2px;margin-right:6px"></span>'+t.team+'</td>'
        +'<td style="padding:6px 10px;text-align:center">'+t.races/2+'</td>'
        +'<td style="padding:6px 10px;text-align:center;color:#e10600">'+t.dnf_mech+'</td>'
        +'<td style="padding:6px 10px;text-align:center;color:#FF8000">'+t.dnf_incident+'</td>'
        +'<td style="padding:6px 10px;text-align:center">'+t.dnf_total+'</td>'
        +'<td style="padding:6px 10px;text-align:center;color:'+(t.dnf_rate>20?'#e10600':t.dnf_rate>10?'#FF8000':'#00D7B6')+'">'+t.dnf_rate+'%</td></tr>';
    }).join('');
    tbl.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--txt-dim);border-bottom:1px solid var(--line)"><th style="padding:6px 10px;text-align:left">Team</th><th style="padding:6px 10px">GP</th><th style="padding:6px 10px">Mec.</th><th style="padding:6px 10px">Inc.</th><th style="padding:6px 10px">Tot.</th><th style="padding:6px 10px">Tasso</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
}


// ── Constructor Battle ────────────────────────────────────────
var _constBattleChart = null;
function renderConstBattle() {
  var cb = D.constructor_battle || {};
  var rounds = cb.rounds || [];
  var teams  = cb.teams  || {};
  if (!rounds.length) return;
  var TEAM_COLORS = TC; // usa il master TC — unica fonte colori
  var datasets = Object.keys(teams).map(function(t) {
    return {
      label: t, data: teams[t],
      borderColor: TEAM_COLORS[t] || '#8b97ad',
      backgroundColor: (TEAM_COLORS[t] || '#8b97ad') + '22',
      tension: 0.3, fill: false, pointRadius: 3, borderWidth: 2
    };
  });
  var ctx = document.getElementById('constBattleChart');
  if (!ctx) return;
  if (_constBattleChart) _constBattleChart.destroy();
  _constBattleChart = new Chart(ctx, {
    type: 'line', data: { labels: rounds, datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c){ return c.dataset.label+': '+c.parsed.y+' pt'; } } }
      },
      scales: {
        x: { ticks:{color:'#8b97ad',maxRotation:40}, grid:{color:'#2a3142'} },
        y: { ticks:{color:'#8b97ad'}, grid:{color:'#2a3142'},
          title:{display:true,text:'Punti costruttori',color:'#8b97ad',font:{size:11}} }
      }
    }
  });
  var leg = document.getElementById('constBattleLegend');
  if (leg) {
    var tkeys = Object.keys(teams);
    leg.innerHTML = tkeys.map(function(t) {
      var c = TEAM_COLORS[t] || '#8b97ad';
      var last = teams[t][teams[t].length-1] || 0;
      return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px">'
        +'<span style="width:20px;height:3px;background:'+c+';display:inline-block;border-radius:2px"></span>'
        +'<span>'+t+' ('+last+' pt)</span></span>';
    }).join('');
  }
}

// ── Tyre Strategy Simulator ───────────────────────────────────
var _tyreSimuChart = null;
function _tyreParams() {
  // Legge parametri da D.tyre_strategy (auto-deriving) oppure dai campi manuali
  var ts = (typeof D !== 'undefined' && D.tyre_strategy) ? D.tyre_strategy : null;
  var manual = document.getElementById('ts-override-open') && document.getElementById('ts-override-open').open;
  if (ts && !manual) {
    var c = ts.compounds || {};
    var soft   = c.SOFT   || c.Soft   || {};
    var medium = c.MEDIUM || c.Medium || {};
    var hard   = c.HARD   || c.Hard   || {};
    return {
      totalLaps: ts.total_laps || 57,
      baseLap:   ts.base_lap   || 92,
      pitLoss:   ts.pit_loss   || 22,
      compounds: {
        'Soft':   { delta: 0,                             deg: soft.deg_per_lap   || 0.08 },
        'Medium': { delta: medium.delta_vs_soft || 0.5,   deg: medium.deg_per_lap || 0.06 },
        'Hard':   { delta: hard.delta_vs_soft   || 1.0,   deg: hard.deg_per_lap   || 0.04 }
      },
      source: ts.source || 'estimate'
    };
  }
  // Manual override
  var degS = parseFloat(document.getElementById('ts-deg-soft').value)   || 0.08;
  var degM = parseFloat(document.getElementById('ts-deg-med').value)    || 0.06;
  var degH = parseFloat(document.getElementById('ts-deg-hard').value)   || 0.04;
  return {
    totalLaps: parseInt(document.getElementById('ts-laps').value)     || 57,
    baseLap:   parseFloat(document.getElementById('ts-laptime').value) || 92,
    pitLoss:   parseFloat(document.getElementById('ts-pitloss').value) || 22,
    compounds: {
      'Soft':   { delta: 0,                                                          deg: degS },
      'Medium': { delta: parseFloat(document.getElementById('ts-delta-med').value) || 0.5, deg: degM },
      'Hard':   { delta: parseFloat(document.getElementById('ts-delta-hard').value) || 1.0, deg: degH }
    },
    source: 'manual'
  };
}

function _populateTyreInputs() {
  var ts = (typeof D !== 'undefined' && D.tyre_strategy) ? D.tyre_strategy : null;
  if (!ts) return;
  var c = ts.compounds || {};
  var soft   = c.SOFT   || c.Soft   || {};
  var medium = c.MEDIUM || c.Medium || {};
  var hard   = c.HARD   || c.Hard   || {};
  var set = function(id, v) { var el=document.getElementById(id); if(el && v!=null) el.value=v; };
  set('ts-laps', ts.total_laps);
  set('ts-laptime', ts.base_lap ? ts.base_lap.toFixed(3) : null);
  set('ts-pitloss', ts.pit_loss);
  set('ts-deg-soft', (soft.deg_per_lap||0.08).toFixed(3));
  set('ts-deg-med',  (medium.deg_per_lap||0.06).toFixed(3));
  set('ts-deg-hard', (hard.deg_per_lap||0.04).toFixed(3));
  set('ts-delta-med',  (medium.delta_vs_soft||0.5).toFixed(2));
  set('ts-delta-hard', (hard.delta_vs_soft||1.0).toFixed(2));
  // Source badge
  var badge = document.getElementById('ts-source-badge');
  if (badge) {
    var isFP2 = ts.source && ts.source.startsWith('fp2');
    badge.innerHTML = isFP2
      ? '<span style="background:#00D7B620;color:#00D7B6;padding:3px 10px;border-radius:12px;font-size:12px">📊 Da FP2 reale</span>'
      : '<span style="background:#f1a94420;color:#f1a944;padding:3px 10px;border-radius:12px;font-size:12px">📐 Stima circuito</span>';
  }
}

function runTyreSimu() {
  var p = _tyreParams();
  var totalLaps = p.totalLaps;
  var baseLap   = p.baseLap;
  var pitLoss   = p.pitLoss;

  // Compound delta vs Soft (secondi per giro)
  var COMPOUNDS = p.compounds;

  function simStrategy(strategy) {
    // strategy = [{compound, from, to}, ...]
    var total = 0;
    var pitCount = strategy.length - 1;
    strategy.forEach(function(stint, si) {
      var len = stint.to - stint.from;
      var cInfo = COMPOUNDS[stint.compound] || {delta:0, deg:0.08};
      var cDelta = cInfo.delta;
      var cDeg   = cInfo.deg;
      for (var lap = 0; lap < len; lap++) {
        total += baseLap + cDelta + cDeg * lap;
      }
      if (si < pitCount) total += pitLoss;
    });
    return Math.round(total * 10) / 10;
  }

  function buildStrategies(n) {
    var comps = ['Soft','Medium','Hard'];
    var strategies = [];
    var lapStep = Math.floor(totalLaps / n);
    // Genera varianti compound
    for (var c1 = 0; c1 < comps.length; c1++) {
      for (var c2 = 0; c2 < comps.length; c2++) {
        if (n === 2 && c1 === c2) continue;
        if (n === 3) {
          for (var c3 = 0; c3 < comps.length; c3++) {
            var stints = [
              {compound: comps[c1], from:0, to: lapStep},
              {compound: comps[c2], from: lapStep, to: lapStep*2},
              {compound: comps[c3], from: lapStep*2, to: totalLaps}
            ];
            strategies.push({ label: comps[c1][0]+'-'+comps[c2][0]+'-'+comps[c3][0], stints: stints });
          }
        } else {
          var stints = [
            {compound: comps[c1], from:0, to: lapStep},
            {compound: comps[c2], from: lapStep, to: totalLaps}
          ];
          strategies.push({ label: comps[c1][0]+'-'+comps[c2][0], stints: stints });
        }
      }
    }
    return strategies;
  }

  var allStrats = [
    { label:'1-stop', items: buildStrategies(2).slice(0,4) },
    { label:'2-stop', items: buildStrategies(3).slice(0,6) }
  ];

  // Calcola tempo totale per ogni variante
  var plotData = [];
  allStrats.forEach(function(group) {
    group.items.forEach(function(s) {
      var t = simStrategy(s.stints);
      plotData.push({ label: group.label+' '+s.label, time: t });
    });
  });
  plotData.sort(function(a,b){return a.time - b.time;});
  var minTime = plotData[0].time;

  var ctx = document.getElementById('tyreSimuChart');
  if (!ctx) return;
  if (_tyreSimuChart) _tyreSimuChart.destroy();
  _tyreSimuChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: plotData.map(function(d){return d.label;}),
      datasets: [{
        data: plotData.map(function(d){return Math.round((d.time - minTime)*10)/10;}),
        backgroundColor: plotData.map(function(d,i){return i===0?'#00D7B6cc':'#3671C688';}),
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: function(c){ return '+'+c.parsed.y.toFixed(1)+'s vs ottimale (tot: '+plotData[c.dataIndex].time.toFixed(1)+'s)'; }
        }}
      },
      scales: {
        x: { ticks:{color:'#8b97ad',maxRotation:45,font:{size:11}}, grid:{color:'#2a3142'} },
        y: { ticks:{color:'#8b97ad',callback:function(v){return '+'+v+'s';}}, grid:{color:'#2a3142'},
          title:{display:true,text:'Gap vs strategia ottimale (s)',color:'#8b97ad',font:{size:11}} }
      }
    }
  });
  var res = document.getElementById('tyreSimuResult');
  if (res) {
    res.innerHTML = '<span style="color:#00D7B6;font-weight:700">Ottimale: '+plotData[0].label+'</span>'
      +' — tempo totale stimato: '+plotData[0].time.toFixed(1)+'s'
      +' <span style="color:var(--txt-dim)">('+Math.floor(plotData[0].time/60)+"'"+Math.round(plotData[0].time%60)+'")</span>';
  }
}
function renderTyreSimu() {
  var ts = (typeof D !== 'undefined' && D.tyre_strategy) ? D.tyre_strategy : null;
  var isFP2 = ts && ts.source && ts.source.startsWith('fp2');

  // Badge sorgente
  var badge = document.getElementById('ts-source-badge');
  if (badge) {
    badge.innerHTML = isFP2
      ? '<span style="background:#00D7B620;color:#00D7B6;padding:3px 10px;border-radius:12px;font-size:12px">📊 Da FP2 reale</span>'
      : '<span style="background:#f1a94420;color:#f1a944;padding:3px 10px;border-radius:12px;font-size:12px">⏳ In attesa di FP2</span>';
  }

  // Se non abbiamo FP2 reali, mostra placeholder e basta
  if (!isFP2) {
    var chart = document.getElementById('tyreSimuChart');
    var result = document.getElementById('tyreSimuResult');
    var summary = document.getElementById('ts-auto-summary');
    var controls = document.getElementById('ts-controls');
    if (chart) chart.style.display = 'none';
    if (result) result.innerHTML = '';
    if (summary) summary.innerHTML = '';
    if (controls) controls.style.display = 'none';
    var placeholder = document.getElementById('ts-placeholder');
    if (placeholder) placeholder.style.display = 'block';
    return;
  }

  // FP2 disponibile — popola e simula
  _populateTyreInputs();
  var c = ts.compounds || {};
  var fmt = function(v,d){ return v!=null ? parseFloat(v).toFixed(d) : '—'; };
  var card = function(label,val,col){
    return '<div style="background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px 14px;min-width:100px">'
      +'<div style="font-size:10px;color:var(--txt-dim);margin-bottom:2px">'+label+'</div>'
      +'<div style="font-size:14px;font-weight:700;color:'+(col||'var(--txt)')+'">'+val+'</div>'
      +'</div>';
  };
  var soft   = c.SOFT||c.Soft||{};
  var medium = c.MEDIUM||c.Medium||{};
  var hard   = c.HARD||c.Hard||{};
  var summary = document.getElementById('ts-auto-summary');
  if (summary) {
    summary.innerHTML =
      card('Giri', ts.total_laps, '#00D7B6')
      +card('Base lap', fmt(ts.base_lap,3)+'s', '#00D7B6')
      +card('Pit loss', fmt(ts.pit_loss,0)+'s', '#00D7B6')
      +card('Soft deg/lap', fmt(soft.deg_per_lap,3)+'s', '#e8534a')
      +card('Med deg/lap',  fmt(medium.deg_per_lap,3)+'s', '#f1c544')
      +card('Hard deg/lap', fmt(hard.deg_per_lap,3)+'s', '#e0e0e0')
      +card('Δ Med vs S',   (medium.delta_vs_soft>=0?'+':'')+fmt(medium.delta_vs_soft,2)+'s', '#f1c544')
      +card('Δ Hard vs S',  (hard.delta_vs_soft>=0?'+':'')+fmt(hard.delta_vs_soft,2)+'s', '#e0e0e0');
  }
  var chart = document.getElementById('tyreSimuChart');
  var controls = document.getElementById('ts-controls');
  var placeholder = document.getElementById('ts-placeholder');
  if (chart) chart.style.display = '';
  if (controls) controls.style.display = '';
  if (placeholder) placeholder.style.display = 'none';
  runTyreSimu();
}
