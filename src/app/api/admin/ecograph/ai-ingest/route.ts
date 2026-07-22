import { NextResponse } from 'next/server';
import { verifyAdminApiAuth } from '@/lib/ecograph/admin-auth-guard';
import connectDB from '@/lib/mongodb';
import EcoGraphNode from '@/models/EcoGraphNode';

// Categories & Relationship Types supported by EcoGraph Ontology
const CATEGORY_ICONS: Record<string, string> = {
  Biodiversity: '🐅',
  Spatial: '🏞️',
  Pollution: '🌫️',
  Climate: '🌡️',
  Policy: '📜',
  EmissionSource: '🏭',
};

/**
 * Strips HTML tags and script elements from raw web responses.
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Rule-based fallback NLP extractor when LLM key is absent or offline.
 */
async function fallbackNlpExtractor(text: string) {
  await connectDB();
  const existingNodes = await EcoGraphNode.find().select('id name category label').lean();

  const extractedEntities: any[] = [];
  const proposedEdges: any[] = [];

  // NLP Keyword Match Rules
  const keywords = [
    { pattern: /(tiger|panthera|leopard|elephant|dolphin|rhino|hornbill|falcon|whale|turtle)/i, category: 'Biodiversity', label: 'Species', icon: '🐅' },
    { pattern: /(mangrove|sundarbans|forest|western ghats|himalayas|wetland|sanctuary|national park|reef)/i, category: 'Spatial', label: 'Habitat', icon: '🏞️' },
    { pattern: /(pm2\.5|pm10|microplastic|plastic|heavy metal|sulfur|nitrate|carbon|chemical)/i, category: 'Pollution', label: 'Pollutant', icon: '🌫️' },
    { pattern: /(sea level rise|heatwave|warming|monsoon|drought|cyclone|glacial melt)/i, category: 'Climate', label: 'ClimateTrend', icon: '🌡️' },
    { pattern: /(project tiger|wildlife protection act|paris agreement|sdg|environment act|forest conserv)/i, category: 'Policy', label: 'Policy', icon: '📜' },
  ];

  const sentences = text.split(/(?<=[.?!])\s+/);

  for (const rule of keywords) {
    const match = text.match(rule.pattern);
    if (match) {
      const name = match[0].charAt(0).toUpperCase() + match[0].slice(1);
      const entityId = `ai-node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Find sentence containing match
      const matchingSentence = sentences.find((s) => rule.pattern.test(s)) || text.slice(0, 150);

      const entity = {
        id: entityId,
        name: name,
        scientificName: rule.category === 'Biodiversity' ? `${name} taxa` : undefined,
        category: rule.category,
        label: rule.label,
        description: `NLP Ingested Entity: ${matchingSentence.trim()}`,
        icon: rule.icon,
        tags: ['AI_Ingested', rule.category, 'NLP_Extracted'],
        provenance: {
          source: 'EcoGraph Automated Web & NLP Ingestion Engine',
          license: 'CC-BY 4.0',
          confidenceScore: 0.88,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      };

      extractedEntities.push(entity);

      // Auto-Linker: Search existing DB nodes to create typed graph relationships
      for (const existingNode of existingNodes) {
        if (text.toLowerCase().includes(existingNode.name.toLowerCase())) {
          let relType = 'affects';
          let relLabel = 'connected concept';

          if (rule.category === 'Biodiversity' && existingNode.category === 'Spatial') {
            relType = 'lives_in';
            relLabel = 'inhabits ecosystem';
          } else if (rule.category === 'Biodiversity' && (existingNode.category === 'Pollution' || existingNode.category === 'Climate')) {
            relType = 'threatened_by';
            relLabel = 'threatened by stressor';
          } else if (rule.category === 'Policy' && (existingNode.category === 'Biodiversity' || existingNode.category === 'Spatial')) {
            relType = 'protects';
            relLabel = 'provides legislative protection';
          } else if (rule.category === 'Policy' && (existingNode.category === 'Pollution' || existingNode.category === 'Climate')) {
            relType = 'reduces';
            relLabel = 'mitigates environmental stress';
          }

          proposedEdges.push({
            id: `ai-edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sourceId: entityId,
            targetId: existingNode.id,
            targetName: existingNode.name,
            type: relType,
            label: relLabel,
            weight: 0.9,
          });
        }
      }
    }
  }

  // Fallback if no specific keywords matched
  if (extractedEntities.length === 0) {
    const fallbackId = `ai-node-${Date.now()}`;
    extractedEntities.push({
      id: fallbackId,
      name: text.slice(0, 30).trim() || 'Extracted Ecological Concept',
      category: 'Biodiversity',
      label: 'Species',
      scientificName: 'Extracted Entity',
      description: `AI Extracted Insight: ${text.slice(0, 180)}...`,
      icon: '🌱',
      tags: ['AI_Ingested', 'GeneralConcept'],
      provenance: {
        source: 'EcoGraph Automated Web Ingestion Engine',
        license: 'CC-BY 4.0',
        confidenceScore: 0.75,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    });
  }

  return { extractedEntities, proposedEdges, confidenceScore: 0.88 };
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { url, rawText } = await req.json();

    if (!url && !rawText) {
      return NextResponse.json({ error: 'Please provide a target web URL or text snippet to extract.' }, { status: 400 });
    }

    let textContent = rawText || '';

    // 1. Web Fetcher (if URL provided)
    if (url) {
      try {
        const fetchRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EcoGraphIngestionEngine/1.0',
          },
        });
        if (!fetchRes.ok) {
          throw new Error(`HTTP ${fetchRes.status} ${fetchRes.statusText}`);
        }
        const html = await fetchRes.text();
        textContent = cleanHtml(html);
      } catch (err: any) {
        console.warn('[AI Ingest Web Fetch Warning]:', err.message);
        if (!rawText) {
          return NextResponse.json(
            { error: `Failed to fetch target URL (${err.message}). Please paste raw text snippet instead.` },
            { status: 502 }
          );
        }
      }
    }

    // 2. Check for optional external Python FastAPI Backend
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;
    if (pythonBackendUrl) {
      try {
        const backendRes = await fetch(`${pythonBackendUrl.replace(/\/$/, '')}/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, text: textContent }),
        });
        if (backendRes.ok) {
          const backendData = await backendRes.json();
          return NextResponse.json({
            success: true,
            extractedEntities: backendData.entities || [],
            proposedEdges: backendData.edges || [],
            confidenceScore: backendData.confidence || 0.95,
            engine: 'Python FastAPI Auto-Linker Microservice',
          });
        }
      } catch (err) {
        console.warn('[Python Backend Call Failed - Using Local Engine]:', err);
      }
    }

    // 3. Gemini LLM Extraction (if GEMINI_API_KEY is configured)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const prompt = `You are the EcoGraph Knowledge Engine Ingestion AI. Extract environmental entity nodes and typed relationship edges from the text below.
Respond ONLY with valid JSON in this exact schema without markdown formatting:
{
  "entities": [
    {
      "name": "Entity Name",
      "scientificName": "Scientific Taxa (or null)",
      "category": "Biodiversity | Spatial | Pollution | Climate | Policy | EmissionSource",
      "label": "Species | Habitat | Pollutant | ClimateTrend | Policy | EmissionSource",
      "description": "Short explanation (1-2 sentences)",
      "icon": "Emoji representation",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "proposedRelationships": [
    {
      "sourceName": "Entity Name",
      "targetName": "Target Entity Name",
      "type": "lives_in | threatened_by | emits | reduces | protects | affects",
      "label": "Relationship summary"
    }
  ]
}

Text to extract from:
${textContent.slice(0, 3000)}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawResponseText = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJsonText = rawResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJsonText);

          if (parsed.entities && Array.isArray(parsed.entities)) {
            const formattedEntities = parsed.entities.map((e: any, idx: number) => ({
              id: `ai-node-${Date.now()}-${idx}`,
              name: e.name,
              scientificName: e.scientificName || '',
              category: e.category || 'Biodiversity',
              label: e.label || 'Species',
              description: e.description,
              icon: e.icon || CATEGORY_ICONS[e.category] || '🌱',
              tags: e.tags || ['AI_Ingested', 'GeminiExtracted'],
              provenance: {
                source: url ? `Web Extract (${url})` : 'AI Ingest Studio Text Stream',
                license: 'CC-BY 4.0',
                confidenceScore: 0.96,
                lastUpdated: new Date().toISOString().split('T')[0],
              },
            }));

            return NextResponse.json({
              success: true,
              extractedEntities: formattedEntities,
              proposedEdges: parsed.proposedRelationships || [],
              confidenceScore: 0.96,
              engine: 'Google Gemini 1.5 Flash LLM',
            });
          }
        }
      } catch (geminiErr: any) {
        console.warn('[Gemini LLM Extraction Warning]:', geminiErr.message);
      }
    }

    // 4. Fallback NLP Engine
    const fallbackResult = await fallbackNlpExtractor(textContent);
    return NextResponse.json({
      success: true,
      extractedEntities: fallbackResult.extractedEntities,
      proposedEdges: fallbackResult.proposedEdges,
      confidenceScore: fallbackResult.confidenceScore,
      engine: 'EcoGraph Smart NLP Auto-Linker (Local Engine)',
    });
  } catch (error: any) {
    console.error('[AI Ingestion API Error]:', error);
    return NextResponse.json({ error: error.message || 'AI Ingestion Engine Failure' }, { status: 500 });
  }
}
