# Données Aéronautiques pour Typescript / Javascript

## Importer de nouvelles données aéronautiques

Commander les fichiers [sur le site du SIA](https://www.sia.aviation-civile.gouv.fr/produits-numeriques-en-libre-disposition/les-bases-de-donnees-sia.html) 

Copier-coller les .zip dans `raw-data` et lancer:

```
yarn generate-json
```

Ensuite, publier la lib avec `yarn publish`.


> 🚧🚧🚧 WIP

> Cette librairie est en cours de développement. N'hésitez pas à me contacter si vous êtes intéressés par son utilisation ou pour aider au développement.

Cette librairie contient les données aéronautiques françaises (extraites principalement du SIA - Service d'Information Aéronautique).

L'idée est de rendre ces données utilisables facilement en javascript / typescript. (🚧 Rajouter un exemple d'utilisation ici)

Notamment, de façon non exhaustive:

- les terrains aéronautiques français (non militaires) et les données associées:
  - points de report VFR
  - pistes: orientation, longueur, revêtement
  - fréquences GND, TWR, APP, ATIS
  - altitude terrain, etc
- espaces aériens
- des données de coupe verticale
  - relief le long d'une route
  - espaces aériens traversés
  - obstacles éventuels

## Utilisation

```typescript
import { AiracData } from "./AiracData";
const data = AiracData.loadCycle(AiracCycles.SEP_08_2022);
const aerodromesInCorsica = data.getAerodromesInBbox(8.5, 41.5, 9.5, 43);

console.log(
  aerodromesInCorsica
    .map(
      ({ icaoCode, aerodromeAltitude, mapShortName, runways }) =>
        `${mapShortName} (${icaoCode}): alt. ${aerodromeAltitude} ft, main runway: ${runways.mainRunway.name}`
    )
    .join("\n")
);

/* 
PROPRIANO (LFKO): alt. 16 ft, main runway: 09/27
AJACCIO (LFKJ): alt. 19 ft, main runway: 02/20
GHISONACCIA (LFKG): alt. 177 ft, main runway: 18/36
FIGARI (LFKF): alt. 85 ft, main runway: 05/23
CALVI (LFKC): alt. 210 ft, main runway: 18/36
BASTIA (LFKB): alt. 26 ft, main runway: 16/34
CORTE (LFKT): alt. 1130 ft, main runway: 12/30 */
```
