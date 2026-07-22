import { NextResponse } from 'next/server';
import { EcoGraphEngine } from '@/lib/ecograph/engine';

export async function GET() {
  try {
    const engine = EcoGraphEngine.getInstance();
    const stats = engine.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[EcoGraph Stats API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Knowledge Engine Error' },
      { status: 500 }
    );
  }
}
