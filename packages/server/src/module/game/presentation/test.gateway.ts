// custom-socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Injectable, Logger } from '@nestjs/common';

interface CustomSocket extends WebSocket {
  id: string;
}

@Injectable()
@WebSocketGateway({
  path: '/socket', // WebSocket 엔드포인트 경로
  cors: {
    origin: '*', // CORS 설정
  },
  transports: ['websocket'],
})
export class CustomSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CustomSocketGateway.name);
  private clients: Map<string, CustomSocket> = new Map();

  // 클라이언트 연결 시
  async handleConnection(client: CustomSocket) {
    const clientId = this.generateClientId();
    client.id = clientId;
    this.clients.set(clientId, client);

    this.logger.log(`Client connected: ${clientId}`);

    // 연결 성공 메시지 전송
    this.sendToClient(client, 'connection', {
      message: 'Successfully connected to server',
      clientId,
    });
  }

  // 클라이언트 연결 해제 시
  async handleDisconnect(client: CustomSocket) {
    this.clients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // 이벤트 수신 및 처리
  @SubscribeMessage('eventName')
  async handleEvent(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ): Promise<any> {
    this.logger.log(`Received event from ${client.id}:`, data);

    // 이벤트 처리 로직
    const response = {
      eventName: data.eventName,
      message: 'Event processed successfully',
      data: data,
    };

    return response; // 자동으로 클라이언트에게 응답됨
  }

  // 특정 클라이언트에게 메시지 전송
  private sendToClient(client: CustomSocket, eventName: string, data: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ eventName, ...data }));
    }
  }

  // 모든 클라이언트에게 브로드캐스트
  public broadcast(eventName: string, data: any, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (excludeClientId && clientId === excludeClientId) return;
      this.sendToClient(client, eventName, data);
    });
  }

  // 클라이언트 ID 생성
  private generateClientId(): string {
    return `client_${Math.random().toString(36).substr(2, 9)}`;
  }
}
