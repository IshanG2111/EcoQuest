# EcoGraph: Automated Ingestion & Linker Specification Guide

**Version:** 1.0.0  
**Target Platform:** EcoQuest Knowledge Engine (`src/lib/ecograph`)  
**Status:** Implementation Specification  

---

## 1. Overview & Architecture

EcoGraph’s Automated Ingestion & Linker Pipeline extracts, normalizes, and connects unstructured or tabular environmental datasets into a semantically-rich property graph. By performing entity resolution, spatial bounding box lookup, and NLP trigger matching, the pipeline automatically creates typed edges (`lives_in`, `threatened_by`, `emits`, `reduces`, `protects`) between species, habitats, pollutants, climate trends, and policies.

---

## 2. Directory Structure Specification

Place all ingested data files under the following repository paths:

```
EcoQuest/
├── data/
│   ├── raw/                      # Downloaded raw data (CSVs, JSON dumps, PDFs)
│   │   ├── gbif/                 # GBIF occurrence and taxonomy records
│   │   ├── iucn/                 # IUCN Red List species assessments
│   │   ├── cpcb/                 # CPCB air & water quality monitoring CSVs
│   │   ├── ibp/                  # India Biodiversity Portal datasets
│   │   └── policies/             # UN SDGs, Project Tiger, WPA 1972 PDFs & text
│   ├── ontologies/               # Standard vocabularies (ENVO, Biolink, QUDT)
│   │   ├── envo.json             # Environment Ontology habitat codes
│   │   └── biolink_schema.yaml   # Biolink relationship definitions
│   └── processed/                # Normalized JSON-LD graphs ready for loader
│       └── ecograph_ingested.json
└── scripts/
    └── auto_linker.py            # Automated ingestion & relationship linker script
```

---

## 3. Recommended Datasets for Ingestion

| Domain | Source & License | Recommended Files to Place in `data/raw/` | Auto-Linker Rules |
| :--- | :--- | :--- | :--- |
| **Biodiversity & Species** | **GBIF** (CC0/CC-BY)<br>**IUCN Red List** (API)<br>**India Biodiversity Portal** (CC-BY-SA) | `data/raw/gbif/species_india.csv`<br>`data/raw/iucn/threatened_taxa.json` | Matches scientific names (`Panthera tigris`) ➔ creates `Species` node with taxon IDs. |
| **Habitats & Ecosystems** | **ENVO Ontology**<br>**Forest Survey of India (FSI)** | `data/raw/fsi/forest_cover_2025.csv`<br>`data/ontologies/envo.json` | Maps coordinate polygons ➔ links species to `Habitat` nodes via `lives_in`. |
| **Air & Water Pollution** | **OpenAQ** (Open License)<br>**CPCB India Ambient Air** | `data/raw/cpcb/air_quality_stations.csv`<br>`data/raw/openaq/pm25_readings.json` | Scans pollutant codes (`PM2.5`, `SO2`) ➔ creates `Pollutant` and `EmissionSource` nodes. |
| **Climate Indicators** | **Copernicus Climate CDS**<br>**NOAA Ocean Service** | `data/raw/copernicus/sea_level_rise.json` | Extracts oceanographic trends ➔ links `ClimateTrend` nodes to threatened biomes. |
| **Policies & SDGs** | **UN SDG Platform**<br>**MoEFCC India Gazettes** | `data/raw/policies/un_sdg_targets.json`<br>`data/raw/policies/project_tiger_directives.txt` | Scans text for policy targets ➔ creates `Policy` nodes and links `reduces` / `protects` edges. |

---

## 4. How Automatic Link Creation Works

The pipeline executes three automatic linking algorithms:

### 4.1 Taxonomic & Synonymous Resolution
- Matches species names across GBIF, IUCN, and India Biodiversity Portal records.
- Standardizes synonyms to canonical IDs (e.g. `GBIF:2435099` for Bengal Tiger).

### 4.2 Spatial Polygon Overlap Linking
- Given a `Species` occurrence coordinate `(lat, lng)` and a `Habitat` spatial bounding box:
  ```python
  if point_in_polygon(species.coordinates, habitat.polygon):
      create_edge(source=species.id, target=habitat.id, type="lives_in")
  ```

### 4.3 NLP Relation Extraction (Unstructured Text)
- Scans ingested document text using keyword trigger rules:
  - `"threatened by"` / `"vulnerable to"` ➔ Creates `threatened_by` edge.
  - `"emits"` / `"pollutes"` ➔ Creates `emits` edge.
  - `"protects"` / `"designates sanctuary"` ➔ Creates `protects` edge.
  - `"reduces"` / `"mitigates"` ➔ Creates `reduces` edge.

---

## 5. Quick Command to Run Auto-Linker

Once raw data files are placed in `data/raw/`, run the ingestion script:

```bash
python scripts/auto_linker.py --input data/raw/ --output data/processed/ecograph_ingested.json
```

Or trigger the Next.js API loader endpoint:
`POST /api/ecograph/query` with body `{ "action": "ingest_auto_link" }`.
