import { NextResponse } from 'next/server';
import { verifyAdminApiAuth } from '@/lib/ecograph/admin-auth-guard';
import connectDB from '@/lib/mongodb';
import EcoGraphNode from '@/models/EcoGraphNode';
import EcoGraphEdge from '@/models/EcoGraphEdge';
import { KAGGLE_HF_NODES, KAGGLE_HF_EDGES } from '../../../../../../scripts/ingest_kaggle_huggingface';

export async function POST(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await connectDB();

    for (const node of KAGGLE_HF_NODES) {
      await EcoGraphNode.findOneAndUpdate({ id: node.id }, { $set: node }, { upsert: true, new: true });
    }

    for (const edge of KAGGLE_HF_EDGES) {
      await EcoGraphEdge.findOneAndUpdate({ id: edge.id }, { $set: edge }, { upsert: true, new: true });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully ingested Kaggle, HuggingFace, & NASA environmental clusters into MongoDB Atlas!',
      nodeCount: KAGGLE_HF_NODES.length,
      edgeCount: KAGGLE_HF_EDGES.length,
    });
  } catch (error: any) {
    console.error('[External Ingestion API Error]:', error);
    return NextResponse.json({ error: error.message || 'External Ingestion Failure' }, { status: 500 });
  }
}
