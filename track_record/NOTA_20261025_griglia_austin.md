# Nota pubblica — 26 ottobre 2026

## Austin: il freeze ufficiale è nato su una griglia sbagliata

Il freeze ufficiale del Gran Premio degli Stati Uniti, quello congelato dopo la qualifica (25 ottobre, 05:54 ora
italiana), è stato calcolato su una griglia di partenza diversa da quella vera in 20 caselle su 22. La pole era giusta
(Antonelli). Lo diciamo qui, lo lasciamo com'è e lo valutiamo com'è.

### Cosa è andato storto

Tre errori nostri, tutti nel modo in cui ricavavamo la griglia dai giri della qualifica.

- **L'ordine.** Mettevamo i piloti in ordine col loro giro più veloce di tutta la qualifica. La classifica ufficiale
  invece va per turni: dal primo al decimo posto contano solo i tempi dell'ultimo turno. Leclerc aveva fatto il suo giro
  migliore nel secondo turno: per noi era secondo, in griglia era quarto.
- **I giri cancellati.** Due giri cancellati dalla direzione gara per i limiti della pista, di Norris e di Bearman, erano
  rimasti nel conto.
- **Le penalità.** Tre penalità in griglia (Lindblad, Colapinto, Bortoleto) non erano entrate.

La griglia vera, quella provvisoria della FIA con le penalità, era: Antonelli, Verstappen, Hadjar, Leclerc, Hamilton,
Russell, Piastri, Norris, Lawson, Gasly, Hülkenberg, Alonso, Bearman, Lindblad, Ocon, Stroll, Sainz, Albon, Pérez,
Bottas, Colapinto, Bortoleto.

### Quanto ha pesato

La previsione aggiornata la mattina della gara, pubblicata sul sito alle 16:02 (ora italiana), prima del via, usava già
la griglia della FIA, con lo stesso meteo del freeze. La differenza fra le due viene quindi quasi tutta dalla griglia.

| Pilota | Vittoria nel freeze ufficiale | Vittoria nella previsione della mattina |
|---|---|---|
| Antonelli | 39,6% | 50,1% |
| Leclerc | 29,6% | 10,1% |
| Verstappen | 21,0% | 25,7% |

Ha vinto Antonelli, davanti a Leclerc e Verstappen.

### Come lo valutiamo

Il punteggio che conta è quello del freeze ufficiale, così com'è. Accanto mettiamo quello della previsione della
mattina, solo come diagnosi: dice quanto è costato l'errore, non sostituisce niente.

| | Freeze ufficiale | Diagnosi (griglia della FIA) |
|---|---|---|
| Probabilità di vittoria data al vincitore | 39,6% | 50,1% |
| Log-loss del vincitore | 0,927 | 0,692 |
| Brier vittoria | 0,0226 | 0,0149 |
| Brier podio | 0,0177 | 0,0245 |
| Brier top 10 | 0,0606 | 0,0486 |

Per log-loss e Brier, più basso vuol dire meglio. La griglia giusta avrebbe migliorato vittoria e top 10 e peggiorato il
podio: Leclerc, partito quarto, è arrivato secondo. In tutte e due le versioni i tre più probabili sul podio erano
quelli che ci sono saliti.

### Cosa abbiamo cambiato

Dal Gran Premio di Città del Messico la griglia del freeze dopo la qualifica viene dalla classifica ufficiale della
sessione, i giri cancellati dalla direzione gara non contano più e la griglia provvisoria della FIA entra anche nel
freeze, quando è già pubblicata. Se la classifica ufficiale tarda, la pipeline la aspetta fino a tre ore.

Vale anche una regola nuova, scritta prima del weekend del Messico. Se prima del via si scopre che un freeze ha usato
un dato diverso da quello di una fonte ufficiale già pubblicata, che chiunque può controllare, accanto all'originale
nasce un freeze di correzione con il motivo scritto. Per il track record conta la correzione; l'originale resta
pubblico, con la sua impronta, e lo valutiamo lo stesso. Le notizie arrivate dopo il freeze non sono errori: la regola
non serve a migliorare una previsione, ma a correggere un dato sbagliato.

La regola non vale all'indietro: il freeze di Austin resta quello del 25 ottobre.

*PoleLap, 26 ottobre 2026.*
