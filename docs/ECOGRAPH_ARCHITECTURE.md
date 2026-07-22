# EcoGraph: Architectural Specification & Technical Blueprint

**Version:** 1.0.0  
**Target System:** EcoQuest Edu-OS Platform  
**Status:** Implementation Specification  

---

## 1. Executive Summary & Goals

EcoGraph is an environmental knowledge graph engine unified within the EcoQuest retro Edu-OS platform. It bridges diverse global and Indian environmental data (biodiversity, climate indicators, air/water pollution, spatial biomes, and conservation policies) into a queryable property graph model backed by formal ontologies (ENVO, NCBI/GBIF Taxonomy, IUCN Red List status, CPCB codes, Biolink/EGO concepts).

Key capabilities delivered by EcoGraph:
1. **Semantic Querying & Multi-hop Traversal:** Connecting species, habitats, pollutants, climate trends, and policies across complex ecological relationships.
2. **Hybrid RAG & AI Reasoning:** Combining vector embedding similarity matching with graph path extraction to generate explainable AI answers with verifiable provenance chains.
3. **Interactive Edu-OS Graph Visualization:** Dynamic force-directed graph exploration tool styled for retro CRT aesthetics (`ECO_GRAPH.SYS`).
4. **Graph-Driven Quests:** Personalized learning missions generated directly from user knowledge graph traversal metrics.
5. **Open Standard Data Ingestion & Quality:** SHACL-style quality validation, explicit data provenance metadata (source URL, license, timestamp), and standardized API endpoints.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Data Sources
        GBIF["GBIF Taxonomy & Occurrences (CC0/BY)"]
        IUCN["IUCN Red List Categories"]
        OpenAQ["OpenAQ Global Air Metrics"]
        CPCB["CPCB India Air/Water Quality"]
        IBP["India Biodiversity Portal"]
        Policy["UN SDGs & Project Tiger Directives"]
    end

    subgraph Data Ingestion & Normalization Engine
        Ingest["Ingestion Pipelines"] --> Resolve["Taxonomic & Facility Resolution"]
        Resolve --> Quality["SHACL / GraphGuard Data Quality Validation"]
    end

    Data Sources --> Ingest

    subgraph Knowledge Graph Engine Core
        GraphDB[("EcoGraph Property Graph (Nodes & Typed Edges)")]
        VectorStore[("Semantic Embedding Index")]
        OntologyStore["Ontology Mappers (ENVO, Biolink/EGO)"]
    end

    Quality --> GraphDB
    Quality --> VectorStore

    subgraph AI & Reasoning Engine
        HybridRAG["HybridRAG Query Pipeline"]
        PathRanker["Centrality & Path Ranking"]
        LLMReasoning["Explainable AI Generator"]
    end

    GraphDB <--> HybridRAG
    VectorStore <--> HybridRAG
    HybridRAG --> PathRanker
    PathRanker --> LLMReasoning

    subgraph API Layer
        QueryAPI["POST /api/ecograph/query"]
        EntityAPI["GET /api/ecograph/entities"]
        PathAPI["GET /api/ecograph/paths"]
        QuestAPI["GET /api/ecograph/quests"]
        StatsAPI["GET /api/ecograph/stats"]
    end

    LLMReasoning --> QueryAPI
    GraphDB --> EntityAPI
    GraphDB --> PathAPI
    GraphDB --> QuestAPI
    GraphDB --> StatsAPI

    subgraph Edu-OS Desktop Client
        Explorer["ECO_GRAPH.SYS Desktop Window"]
        MiniWidget["ECO_GRAPH_MINI.SYS Widget Dock"]
    end

    QueryAPI --> Explorer
    EntityAPI --> Explorer
    QuestAPI --> Explorer
    MiniWidget --> EntityAPI
```

---

## 3. Data Schema & Ontology Definitions

### 3.1 Node Labels (Types)
- `Species`: Biological species or taxon (e.g. *Panthera tigris*).
- `Habitat`: Ecosystem or spatial biome (e.g. *Sundarbans Mangrove Forest*, *Western Ghats*).
- `Pollutant`: Chemical, physical, or particulate stressor (e.g. *PM2.5*, *Microplastics*, *Nitrates*).
- `EmissionSource`: Origin of environmental stress (e.g. *Thermal Power Generation*, *Stubble Burning*).
- `ClimateTrend`: Long-term atmospheric/climatic shift (e.g. *Sea Level Rise*, *Thermal Anomaly*).
- `Policy`: Legislative or conservation framework (e.g. *Project Tiger*, *Wildlife Protection Act 1972*).
- `Location`: Spatial jurisdiction or geographic polygon (e.g. *West Bengal*, *India*).
- `User`: EcoQuest learner or citizen scientist profile.
- `Quest`: Dynamically generated learning mission based on graph connectivity.

### 3.2 Edge Types (Relationships)
- `lives_in` (`Species` -> `Habitat`)
- `threatened_by` (`Species` -> `Pollutant` / `ClimateTrend`)
- `affects` (`Pollutant` -> `Habitat` / `Species`)
- `emits` (`EmissionSource` -> `Pollutant`)
- `reduces` (`Policy` -> `Pollutant` / `ClimateTrend`)
- `protects` (`Policy` -> `Species` / `Habitat`)
- `located_in` (`Habitat` -> `Location`)
- `part_of` (`Location` -> `Location`)
- `explored` (`User` -> `Species` / `Habitat`)
- `requires_action` (`Quest` -> `Habitat` / `Policy`)

### 3.3 Core Provenance Attributes
Every node and edge maintains standard provenance metadata:
```json
{
  "source": "GBIF / IUCN / OpenAQ / CPCB / Ministry of Environment India",
  "license": "CC-BY 4.0 / Government Open Data License India",
  "confidenceScore": 0.98,
  "timestamp": "2026-07-22T00:00:00Z"
}
```

---

## 4. Hybrid RAG Reasoning Engine

EcoGraph implements a 3-stage Hybrid RAG retrieval pipeline:
1. **Dense Semantic Retrieval:** Converts natural language queries into text embeddings to identify top target candidate entities.
2. **Multi-Hop Graph Context Expansion:** Extracts k-hop subgraphs around candidate nodes, prioritizing shortest paths and edge weight confidence scores.
3. **Explainable AI Answer Synthesis:** Generates natural language responses with embedded graph citations and evidence paths:
   ```
   [Bengal Tiger (Species)] --(lives_in)--> [Sundarbans (Habitat)] <-- (threatened_by) -- [Sea Level Rise (ClimateTrend)]
   ```

---

## 5. API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/ecograph/query` | `POST` | Executes HybridRAG queries or structured graph traversals. |
| `/api/ecograph/entities` | `GET` | Entity lookup, prefix autocomplete, and k-hop neighborhood retrieval. |
| `/api/ecograph/paths` | `GET` | Finds shortest and all path sequences between two entity nodes. |
| `/api/ecograph/quests` | `GET/POST` | Generates graph-driven quests based on user exploration history. |
| `/api/ecograph/stats` | `GET` | Returns graph size metrics, SHACL quality scores, and source breakdowns. |

---

## 6. Phased Implementation Roadmap

- **Phase 1 (MVP - Included):** Core ontology definitions, seed dataset covering global and Indian environmental entities, in-memory graph query engine, HybridRAG QA layer, dynamic SVG desktop visualizer (`ECO_GRAPH.SYS`), widget integration (`ECO_GRAPH_MINI.SYS`), and API suite.
- **Phase 2 (Scalability):** Integration with cloud graph storage (Neo4j / Amazon Neptune instance) for graphs with >1M nodes.
- **Phase 3 (Citizen Science):** Real-time observation logging endpoint enlisting user submissions directly into the knowledge graph with automated verification workflows.
