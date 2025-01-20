import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/config/database/redis/redis.service';
import { GameInfo } from '../../interfaces/GameInfo';

@Injectable()
export class GameStateService {
  constructor(private readonly redisService: RedisService) {}

  /**
   *
   * @param pinCode
   * @returns 게임 정보
   */
  async getGameInfo(pinCode: string) {
    const gameInfoJson = await this.redisService.get(`gameId=${pinCode}`);
    if (!gameInfoJson) {
      throw new NotFoundException(`Game with pinCode ${pinCode} not found`);
    }
    return JSON.parse(gameInfoJson);
  }

  async setGameInfo(pinCode: string, gameInfo: GameInfo) {
    await this.redisService.set(`gameId=${pinCode}`, JSON.stringify(gameInfo));
  }

  async getGameSidList(pinCode: string) {
    const gameSidList = await this.redisService.get(`gameId=${pinCode}:sid`);
    if (!gameSidList) {
      throw new NotFoundException(`Game with pinCode ${pinCode} not found`);
    }
    return JSON.parse(gameSidList);
  }

  async updateGameInfoCurrentOrder(pinCode: string, gameInfo: GameInfo) {
    gameInfo.currentOrder += 1;
    await this.setGameInfo(pinCode, gameInfo);

    return gameInfo.currentOrder;
  }

  async updateGameInfoStatus(pinCode: string, status: string) {
    const gameInfo = await this.getGameInfo(pinCode);
    gameInfo.gameStatus = status;
    await this.redisService.set(`gameId=${pinCode}`, JSON.stringify(gameInfo));

    return gameInfo;
  }
}
