# Nota pubblica — 15 ottobre 2026

## Due cambi del modello, detti prima: i ritiri da Austin, la griglia incerta da Città del Messico

A stagione in corso un cambio del modello entra solo se passa una prova scritta prima di guardare i
risultati. Si annuncia qui prima del weekend in cui entra, e si spegne con un commit. Questi sono i due
cambi decisi in ottobre.

### Da Austin: il rischio di ritiro in gara si stima solo dalle gare

Ogni pilota ha una probabilità di ritirarsi, stimata soprattutto dai ritiri della stagione, della sua
squadra e di tutto lo schieramento. Fino a Singapore nel conto entravano anche le sei sprint, che sono
corte e hanno pochi ritiri: il rischio della gara usciva più basso del vero.

La prova è stata scritta il 12 ottobre, prima di qualunque calcolo. Abbiamo rifatto le 17 gare del 2026
una per una, ciascuna con i soli dati di prima della gara: 370 partenze in tutto. Con le sprint nel conto
il modello prevedeva 43 ritiri, senza ne prevede 58,5, e quelli veri sono stati 68. Scende anche
l'errore sulle singole partenze (Brier), da 0,1544 a 0,1503.

Per Austin il rischio medio di ritiro passa dal 17,4% al 19,2%. Il modello resta un po' ottimista sui
ritiri: lo riprenderemo a dicembre, con tutta la stagione.

Cambiano tutte le previsioni della gara, compreso il freeze ufficiale dopo la qualifica. Il primo freeze
con questo cambio è il pre-weekend di Austin, lunedì 19 ottobre.

### Da Città del Messico: prima della qualifica, la gara si simula su griglie incerte

Dopo le libere la griglia di partenza non si conosce ancora. Finora la gara si simulava sulla griglia
prevista come se fosse certa. Dal GP di Città del Messico, nelle previsioni dopo le libere (venerdì 30 e
sabato 31 ottobre), il modello estrae 25 griglie possibili dalla simulazione della qualifica, simula la
gara su ognuna e fa la media delle probabilità.

Anche questa prova è stata scritta prima, il 6 ottobre. È stata fatta su 91 gare del 2022-2025, che non
erano servite a costruire l'idea. L'errore scende del 7% circa sulla vittoria, dell'11% sul podio e del
2% sulla top 10, con tre serie diverse di numeri casuali. Sul 2026 migliorano podio e top 10 ma non la
vittoria (la differenza resta dentro il rumore): quest'anno il primo della griglia prevista ha vinto 10
gare su 16, e la griglia incerta gli toglie probabilità.

Un limite, scritto prima della prova: sugli anni passati la qualifica prevista usa i valori dei piloti
di oggi. La griglia prevista è quindi un po' peggiore di quella che si sarebbe avuta allora, e questo
favorisce la griglia incerta.

Non cambiano la previsione pre-weekend e quella dopo la qualifica, che è il freeze ufficiale del track
record.

### Cosa non cambia

I freeze già pubblicati restano com'erano: sono stati fatti con il modello di allora, e con quello vanno
giudicati. Le previsioni delle qualifiche non cambiano.

Dal 2027 la qualifica sprint avrà più incertezza da metà griglia in giù (prova del 13 ottobre su 24
qualifiche sprint 2023-2026). Nel 2026 non ci sono più sprint, quindi per ora non tocca niente.

### Come lo controlliamo

Il cambio sui ritiri è stato deciso guardando i ritiri, non il podio e la top 10. Lunedì 26 ottobre,
dopo Austin, misuriamo anche quelli su tutte le gare 2026, con una regola scritta il 14 ottobre. Se il
podio o la top 10 peggiorano in modo netto, il cambio si spegne e lo scriviamo qui.

*PoleLap, 15 ottobre 2026.*
