import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/ecograph/admin-store';

export async function GET() {
  try {
    const presets = await adminStore.getPresets();
    return NextResponse.json({
      success: true,
      presets,
    });
  } catch (error: any) {
    console.error('[EcoGraph Presets API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Presets Error' },
      { status: 500 }
    );
  }
}
