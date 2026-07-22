import { NextResponse } from 'next/server';
import { EcoGraphEngine } from '@/lib/ecograph/engine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startId = searchParams.get('startId');
    const endId = searchParams.get('endId');

    if (!startId || !endId) {
      return NextResponse.json(
        { error: 'Parameters "startId" and "endId" are required.' },
        { status: 400 }
      );
    }

    const engine = EcoGraphEngine.getInstance();
    const path = engine.findShortestPath(startId, endId);

    if (!path) {
      return NextResponse.json({
        success: false,
        message: `No path found connecting "${startId}" to "${endId}".`,
      });
    }

    return NextResponse.json({
      success: true,
      path,
    });
  } catch (error: any) {
    console.error('[EcoGraph Paths API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Knowledge Engine Error' },
      { status: 500 }
    );
  }
}
