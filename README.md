# PoleLap — Previsioni con track record verificabile

Sito: **https://roger7111.github.io/polelap/**

> **📌 Aggiornamento 28/07/2026 — il confronto col mercato è sospeso.**
> I nuovi freeze non includono più le quote di mercato. **I freeze già pubblicati
> non sono stati toccati**: i loro file e i relativi SHA256 restano validi e
> verificabili. Motivo, conseguenze e cosa resta:
> **[track_record/NOTA_20260728_benchmark.md](track_record/NOTA_20260728_benchmark.md)**

Questo repository contiene la vetrina pubblica e, in `track_record/`, le
**previsioni congelate prima di ogni evento**. Non chiediamo fiducia: ogni
numero è verificabile da terzi. E il posizionamento è onesto: pubblichiamo
**probabilità calibrate e verificate** — non promettiamo di battere i bookmaker.

## Come verificare un freeze in 10 minuti

Ogni cartella `track_record/<gara>/<timestamp>_<stage>/` è una fotografia
scattata PRIMA dell'evento (lo stage `post-quali` è quello ufficiale: griglia
reale). Contiene la previsione e un `MANIFEST.json`. I freeze **fino al
28/07/2026** contengono anche le quote di mercato del momento; quelli successivi
no — vedi la nota in cima. Il metodo di verifica qui sotto vale per entrambi.

**1. Il timestamp non è nostro, è di GitHub.** Guarda la history del commit che
ha creato la cartella: la data del commit è la prova terza che la previsione
esisteva prima della gara. Un timestamp nel file si può falsificare; la history
di un repo pubblico no.

**2. I file non sono stati toccati dopo.** `MANIFEST.json` elenca lo SHA256 di
ogni file congelato. Ricalcolalo tu:

```powershell
Get-FileHash -Algorithm SHA256 .\<file>            # PowerShell
```
```bash
sha256sum <file>                                    # Linux/macOS
```
Se un hash non combacia col manifest, il record è compromesso: dillo pubblicamente.

**3. Nessun leakage dal futuro.** Il manifest registra anche l'hash del database
risultati (`results_db_sha256`) e il numero di gare presenti al momento del
freeze: la previsione non può aver visto l'esito.

**4. Il benchmark usa solo dati congelati.** `benchmark.json` (post-gara)
confronta modello e mercato usando ESCLUSIVAMENTE le quote (`polymarket_*.csv`)
e la previsione presenti nel freeze — mai i file live. Brier score e log-loss,
metriche standard, ricalcolabili a mano dai CSV congelati.

> ⚠️ **Sospeso dal 28/07/2026.** I nuovi freeze non includono più le quote di
> mercato e la scorecard non pubblica più il confronto modello-vs-mercato.
> Motivo e conseguenze:
> **[track_record/NOTA_20260728_benchmark.md](track_record/NOTA_20260728_benchmark.md)**.
> I **freeze già pubblicati non sono stati toccati**: i loro CSV e i relativi
> SHA256 nel manifest restano validi e verificabili come descritto al punto 2.
> Il cambiamento vale solo in avanti, e ha una data.

**5. Le regole vengono prima dei numeri.** Ogni cambio del modello deve passare una prova scritta prima di
guardare i risultati. `track_record/PROTOCOLLI.json` registra l'impronta SHA-256 di ogni protocollo nel
momento in cui entra nel nostro repo di lavoro, con la data: quando un protocollo viene pubblicato, chiunque può
rifarne l'impronta e controllare che non sia cambiato dopo. Il file spiega come si calcola.

## Cosa mostriamo (e cosa no)

La scorecard sul sito riporta MAE, Spearman e calibrazione del modello, gare
buone e gare cattive, senza selezione. Sono metriche **nostre**: si calcolano sul
modello e sui risultati ufficiali, non dipendono da fonti terze.

Il confronto col mercato è **sospeso dal 28/07/2026** (vedi la nota sopra). Finché
era attivo valeva la stessa regola di sempre, e continuerà a valere se e quando
tornerà: si accumula gara per gara, con poche gare è un aneddoto e lo trattiamo
come tale, e nessun claim comparativo finché il campione non ha potenza
statistica. Non eravamo vicini a quella soglia quando abbiamo sospeso — e il
primo confronto reale, a Spa, lo aveva vinto il mercato. Lo scriviamo perché una
sospensione dopo una serie favorevole avrebbe un altro significato.

## Versione del modello (onestà su un track record giovane)

Il modello evolve. Dal 21/7/2026 ogni freeze registra nel suo `MANIFEST.json` il
**commit git** che l'ha prodotto (`git_commit`): così è verificabile ESATTAMENTE
quale versione del codice ha generato ogni previsione, e i numeri di versioni
diverse non vengono spacciati come omogenei.

Nota di trasparenza sul primo numero: il **Belgian GP (freeze 18/7)** è stato
prodotto *prima* di un fix importante alla dispersione delle probabilità (20/7):
riflette quindi una versione del modello che sottostimava i favoriti, e il suo
confronto col mercato va letto in quella luce. Dal GP successivo il modello è
quello validato in `VALIDATION.md`. Non riscriviamo i freeze passati (sarebbe
barare col track record): li teniamo, li datiamo e li versioniamo. Il confronto
col mercato diventerà un claim solo con ≥8 gare della stessa versione e un
intervallo di confidenza che esclude lo zero.

## Stack

Modello Monte Carlo (30k simulazioni) su dati FastF1, ancoraggio alla griglia,
modello DNF team×circuito, calibrazione isotonica. Il codice sorgente del
modello è in un repo privato; ciò che serve per la verifica — previsioni
congelate, quote, manifest, benchmark — è tutto qui.
