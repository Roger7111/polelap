// Dati della previsione sempre freschi: la CDN di GitHub Pages tiene i file fino a 10 minuti.
// index.html - era inline nella pagina; file a parte dal 29/09/2026 (CSP senza 'unsafe-inline').
document.write('<script src="data/previsione.js?_=' + Date.now() + '"><\/script>');
