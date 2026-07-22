import { NextResponse } from 'next/server';
import { EcoGraphQuestEngine } from '@/lib/ecograph/quest-engine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const exploredStr = searchParams.get('explored') || '';
    const exploredIds = exploredStr ? exploredStr.split(',') : [];

    const questEngine = new EcoGraphQuestEngine();
    const quests = questEngine.generatePersonalizedQuests(exploredIds);

    return NextResponse.json({
      success: true,
      quests,
    });
  } catch (error: any) {
    console.error('[EcoGraph Quests API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Knowledge Engine Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questId, currentXP } = body;

    if (!questId) {
      return NextResponse.json({ error: 'Missing "questId" parameter.' }, { status: 400 });
    }

    const questEngine = new EcoGraphQuestEngine();
    const result = questEngine.completeQuest(questId, currentXP || 0);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[EcoGraph Quests Complete API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Knowledge Engine Error' },
      { status: 500 }
    );
  }
}
