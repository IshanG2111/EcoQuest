import { NextResponse } from 'next/server';
import { EcoGraphReasoningEngine } from '@/lib/ecograph/reasoning';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, mode } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "query" parameter.' },
        { status: 400 }
      );
    }

    const reasoningEngine = new EcoGraphReasoningEngine();
    const result = reasoningEngine.query(query);

    return NextResponse.json({
      success: true,
      mode: mode || 'hybrid-rag',
      data: result,
    });
  } catch (error: any) {
    console.error('[EcoGraph Query API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Knowledge Engine Error' },
      { status: 500 }
    );
  }
}
