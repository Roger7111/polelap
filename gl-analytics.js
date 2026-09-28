// gl-analytics.js — conteggio visite, un posto solo.
//
// PERCHE' GoatCounter e non altro:
//   - il piano gratuito ospitato e' riservato all'uso NON COMMERCIALE, che e'
//     esattamente l'assetto dichiarato il 29/07. La stessa decisione che ha
//     chiuso la porta commerciale apre questa;
//   - niente cookie, niente identificatori persistenti, niente fingerprinting:
//     l'IP e' hashato lato server con un sale che ruota ogni 8 ore e non e'
//     piu' reversibile. Quindi NIENTE banner di consenso da gestire, che a
//     una persona sola costa piu' del valore del dato;
//   - open source: se un giorno serve, si self-hosta senza riscrivere nulla.
//
// COSA MISURA: pagina, referrer, user agent, dimensione schermo. Basta questo
// per rispondere alle due domande aperte in PIANO_DISTRIBUZIONE §9 — quante
// persone arrivano e DA DOVE — cioe' per trasformare le stime del funnel (§2)
// da assunzioni in misure.
//
// ── ATTIVAZIONE ────────────────────────────────────────────────────────────
// 1. registrarsi su https://www.goatcounter.com (nome del sito = CODICE)
// 2. scrivere quel codice qui sotto
// 3. ridistribuire con _pubdeploy.bat
// Finche' CODICE resta vuoto questo file NON fa una sola richiesta di rete:
// e' inerte, non rotto.
const GC_CODE = "";

(function () {
  if (!GC_CODE) return;                       // non configurato: silenzio

  // Non contare le prove in locale (file://, localhost, IP di rete privata):
  // sporcherebbero la sola misura che abbiamo con il traffico di chi la guarda.
  var h = location.hostname;
  if (location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return;

  // Auto-esclusione dell'owner. Da attivare UNA VOLTA dalla console del browser:
  //   localStorage.setItem('gl-nocount', '1')
  // Senza questo, con 20 visitatori attesi, le nostre visite sarebbero la
  // maggioranza del campione e ogni conclusione sarebbe su noi stessi.
  try { if (localStorage.getItem('gl-nocount')) return; } catch (e) {}

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + GC_CODE + '.goatcounter.com/count');
  document.head.appendChild(s);
})();
