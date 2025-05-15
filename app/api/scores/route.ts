import { NextRequest, NextResponse } from 'next/server';
import { ScoreService } from './_lib/score.service';
import { handleApiError } from './_lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, score } = body;
    const newScore = await ScoreService.createScore(username, score);
    return NextResponse.json(newScore);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const stats = searchParams.get('stats');

    if (stats === 'true') {
      const statistics = await ScoreService.getStats();
      return NextResponse.json(statistics);
    }

    if (username) {
      const userScores = await ScoreService.getUserScores(username);
      return NextResponse.json(userScores);
    }

    const scores = await ScoreService.getTopScores();
    return NextResponse.json(scores);
  } catch (error) {
    return handleApiError(error);
  }
} 