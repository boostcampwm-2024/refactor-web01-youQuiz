export interface BaseParticipant {
  nickname: string;
  character: number;
  position: number;
  connection: string;
}

export interface ParticipantListInfo extends BaseParticipant {}

export interface ParticipantInfo extends BaseParticipant {
  pinCode: string;
  socketId: string;
}
