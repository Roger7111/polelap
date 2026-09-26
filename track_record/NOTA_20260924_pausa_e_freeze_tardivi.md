# Nota pubblica — 24 settembre 2026

## La pausa di agosto-settembre, e due freeze nati fuori tempo

Tra il Gran Premio d'Ungheria (26 luglio) e quello dell'Azerbaigian (26 settembre)
PoleLap non ha pubblicato **nessuna previsione valida**. Questa nota dice cosa è
successo, cosa abbiamo tolto e perché, e cosa **non** faremo.

---

### Cosa è successo

La pipeline che congela le previsioni girava su un computer di casa, con attività
pianificate a orari fissi. Nei weekend di Zandvoort, Monza e Madrid quel computer
era spento. Quando si è riacceso, le attività arretrate sono partite tutte
insieme, a gare già finite.

Baku l'abbiamo saltato di proposito: i dati delle tre gare precedenti non erano
ancora acquisiti e da Zandvoort la line-up era cambiata (Lawson in Red Bull,
Tsunoda in Racing Bulls, Hadjar fuori). Una previsione su quella base non sarebbe
stata onesta.

### I due freeze che non sono previsioni

Un freeze vale solo se **precede** l'evento che prevede: è l'unica garanzia che
chiediamo di verificare. Controllando tutti i freeze con questa regola, due non
la rispettano.

| Freeze | Creato (UTC) | Via della gara (UTC) | Ritardo |
|---|---|---|---|
| Zandvoort, `post-quali` | 23/08/2026 17:13 | 23/08/2026 13:00 | 4 h 13' dopo il via |
| Barcellona, `post-quali` | 14/06/2026 15:17 | 14/06/2026 13:00 | 2 h 17' dopo il via |

Nessuno dei due è mai comparso in questo repository: la cartella `track_record/`
contiene solo Belgio e Ungheria. Erano però finiti nel database che alimenta la
pagina `live.html`, insieme ad altre tre righe che non sono previsioni della gara
indicata:

- due "freeze" di Barcellona etichettati `post-race`, cioè fotografie scattate a
  gara finita;
- un freeze `pre-weekend` dell'11 giugno registrato come "Spanish Grand Prix":
  a giugno era il nome che usavamo per Barcellona, ma dal 2026 lo "Spanish Grand
  Prix" è Madrid, e la pagina l'avrebbe mostrato come previsione di Madrid.

**Abbiamo rimosso tutte queste righe dal database** e la pagina ora mostra solo
freeze anteriori alla gara a cui si riferiscono.

Le cartelle restano nel repository sorgente, intatte: non si riscrive la storia,
si dichiara.

### Cosa cambia da oggi

- **Il controllo è nel codice.** Ogni freeze viene confrontato con l'orario
  ufficiale della sessione che prevede (`engine/scadenze.py`): se l'evento è già
  iniziato, il freeze non viene creato né pubblicato. Vale anche per i lanci
  manuali.
- **La pipeline non dipende più da un computer acceso.** Da ottobre gira su un
  servizio cloud con orologio e rete reali.

### Il modello cambia dal prossimo weekend, e lo diciamo prima

Durante la pausa abbiamo trovato il difetto che a Budapest aveva dato a Verstappen,
quarto in griglia e poi secondo al traguardo, il 5% di probabilità di podio. Era
una penalità per l'aria sporca che, per come era scritta, spingeva chi era appena
più veloce della macchina davanti *sotto* le macchine che partivano dietro di lui.
Dal GP del Bahrain, che quest'anno si corre a Sepang (4 ottobre), quella penalità è
spenta, e la probabilità di podio non passa più da una curva di calibrazione che
schiacciava il favorito. Torna anche a pesare la probabilità di pioggia prevista: per un
errore era rimasta esclusa dalle previsioni dal GP d'Ungheria in poi.

Su 106 gare di prova (2022-2026, valutate fuori campione, cioè su gare che il
modello non aveva visto) l'errore sulle probabilità di podio scende di circa il 5%.
Il poleman riceve in media il 76% di podio, contro l'80% che si osserva davvero.

I freeze già pubblicati restano quelli che sono: sono stati fatti con il modello di
allora, e con quello vanno giudicati.

### Cosa NON faremo

**Non ricostruiremo a posteriori le previsioni mancanti.** Sarebbe esattamente
ciò che il track record esiste per impedire. Zandvoort, Monza, Madrid e Baku
restano quattro buchi, dichiarati qui. I loro risultati entrano nei dati del
modello, ma nessuna previsione su quelle gare comparirà mai come se fosse stata
fatta prima.

*Ripartenza: primo weekend con la nuova pipeline, ottobre 2026.*
