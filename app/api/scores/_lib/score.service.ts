import { prisma } from '@/lib/prisma';
import { ApiError } from './errors';

export class ScoreService {
  static async createScore(username: string, score: number) {
    if (!username?.trim()) {
      throw new ApiError('使用者名稱不能為空');
    }

    if (typeof score !== 'number' || score < 0) {
      throw new ApiError('分數必須是正數');
    }

    return await prisma.score.create({
      data: {
        username,
        score,
      },
    });
  }

  static async getTopScores(limit: number = 10) {
    return await prisma.score.findMany({
      orderBy: {
        score: 'desc',
      },
      take: limit,
    });
  }

  static async getUserScores(username: string) {
    if (!username?.trim()) {
      throw new ApiError('使用者名稱不能為空');
    }

    return await prisma.score.findMany({
      where: {
        username: username,
      },
      orderBy: {
        score: 'desc',
      },
      take: 5,
    });
  }

  static async getStats() {
    const [totalPlayers, totalGames, highestScore, averageScore] = await Promise.all([
      prisma.score.groupBy({
        by: ['username'],
        _count: true,
      }).then((result: Array<{ username: string }>) => result.length),
      prisma.score.count(),
      prisma.score.findFirst({
        orderBy: {
          score: 'desc',
        },
      }),
      prisma.score.aggregate({
        _avg: {
          score: true,
        },
      }),
    ]);

    return {
      totalPlayers,
      totalGames,
      highestScore: highestScore?.score ?? 0,
      averageScore: Math.round(averageScore._avg.score ?? 0),
    };
  }
} 