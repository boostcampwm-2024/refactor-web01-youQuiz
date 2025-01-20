import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/config/database/redis/redis.service';
import { ParticipantInfo } from '../../interfaces/ParticipantInfo';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { CONNECTION_TYPES } from '@shared/types/connection.types';

@Injectable()
export class GameUserInfoService {
  constructor(private readonly redisService: RedisService) {}

  async checkSidType(sid: string) {
    try {
      const keyIds = ['master', 'participant'];

      for (const keyId of keyIds) {
        if (await this.redisService.get(`${keyId}_sid=${sid}`)) {
          return { type: keyId };
        }
      }
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async validateMaster(sid: string, pinCode: string) {
    const masterInfo = await this.getMasterInfo(sid);

    if (!masterInfo || masterInfo.pinCode !== pinCode) {
      throw new UnauthorizedException(`Invalid master SID for pinCode ${pinCode}`);
    }
  }

  async getUserInfo(sid: string) {
    const sidType = await this.checkSidType(sid);
    if (!sidType) {
      throw new NotFoundException(`User with sid: ${sid} not found`);
    }
    const key = sidType.type === 'master' ? `master_sid=${sid}` : `participant_sid=${sid}`;

    const userInfo = await this.redisService.get(key);
    if (!userInfo) {
      throw new NotFoundException(`User with sid: ${sid} not found`);
    }

    return JSON.parse(userInfo);
  }

  /**
   *
   * @param sid
   * @returns 참가자 정보
   */
  async getParticipantInfo(sid: string) {
    const participantInfo = await this.redisService.get(`participant_sid=${sid}`);
    if (!participantInfo) {
      throw new NotFoundException(`Participant with sid ${sid} not found`);
    }
    return JSON.parse(participantInfo);
  }

  /**
   *
   * @param sid
   * @returns 마스터 정보
   */
  async getMasterInfo(sid: string) {
    const masterInfo = await this.redisService.get(`master_sid=${sid}`);
    console.log('sid', sid);
    console.log('masterInfo:', masterInfo);

    if (!masterInfo) {
      throw new NotFoundException(`Master with sid ${sid} not found`);
    }
    return JSON.parse(masterInfo);
  }

  async setMasterInfo(sid: string, masterInfo: any) {
    await this.redisService.set(`master_sid=${sid}`, JSON.stringify(masterInfo));
  }

  async setParticipantInfo(sid: string, participantInfo: ParticipantInfo) {
    await this.redisService.set(`participant_sid=${sid}`, JSON.stringify(participantInfo));
  }

  // 이건 객체로 관리해도 될 것 같은데 생성자로
  createUserInfo(
    pinCode: string,
    nickname: string,
    socketId: string,
    participantLength: number,
  ): ParticipantInfo {
    const participantSid = uuidv4();
    const character = Math.floor(Math.random() * 6);
    return {
      pinCode,
      nickname,
      socketId,
      character,
      position: participantLength,
      connection: CONNECTION_TYPES.ON,
    };
  }
}
