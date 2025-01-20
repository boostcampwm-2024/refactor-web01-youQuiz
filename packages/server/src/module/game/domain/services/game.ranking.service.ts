import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/config/database/redis/redis.service';
import { GameService } from '../../application/game.service';

@Injectable()
export class GameRankingService {
  constructor(private readonly redisService: RedisService) {}

  async getRanking() {
    return 'ranking';
  }

  async getRank(key: string, participantNum: number) {
    const result = await this.redisService.zrevrange(key, 0, participantNum);

    const formattedRank = result
      .map((item, index) => {
        if (index % 2 === 0) {
          return [item, result[index + 1]];
        }
      })
      .filter((item) => item !== undefined);

    return formattedRank;
  }

  async showRanking(pinCode: string, sid: string) {
    const participantNumber = await this.redisService.zcard(`gameId=${pinCode}:ranking`);
    const allRankers = await this.getRank(`gameId=${pinCode}:ranking`, participantNumber);

    const rankerData = await Promise.all(
      allRankers.map(async ([sid, score]) => {
        const { nickname } = JSON.parse(await this.redisService.get(`participant_sid=${sid}`));
        return { nickname, score };
      }),
    );

    const myRank = await this.redisService.zrevrank(`gameId=${pinCode}:ranking`, sid);
    const myScore = await this.redisService.zscore(`gameId=${pinCode}:ranking`, sid);
    const participantInfo = await this.redisService.get(`participant_sid=${sid}`);
    const { nickname: myNickname } = JSON.parse(participantInfo);

    return { rankerData, myRank, myScore, myNickname };
  }

  async getLeaderBoardInfo(pinCode: string) {
    const participantNumber = await this.redisService.zcard(`gameId=${pinCode}:ranking`);
    const allRankers = await this.getRank(`gameId=${pinCode}:ranking`, participantNumber);

    return { participantNumber, allRankers };
  }
}
