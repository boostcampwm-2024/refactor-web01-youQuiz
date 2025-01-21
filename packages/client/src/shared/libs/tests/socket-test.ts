import { io } from 'socket.io-client';

export default class Tester {
  socketObject: any;

  constructor(socketObject: any) {
    this.socketObject = socketObject;
  }

  async connectTimeTest(type: 'websocket' | 'socket-io', serverUrl: string) {
    if (type === 'websocket') {
      const startTime = performance.now();
      const ws = new WebSocket(serverUrl);
      ws.onopen = () => {
        const endTime = performance.now();
        const connectionTime = endTime - startTime;
        console.log('WebSocket Connection Time: ', connectionTime, 'ms');
      };
    } else {
      const startTime = performance.now();
      const socket = io(serverUrl, {
        transports: ['websocket'],
      });
      socket.on('connect', () => {
        const endTime = performance.now();
        const connectionTime = endTime - startTime;
        console.log('Socket.io Connection Time: ', connectionTime, 'ms');
      });
    }
  }

  async latencyTest(
    type: 'websocket' | 'socket-io',
    messageCount: number = 100,
    messageType: string,
    args?: any,
  ) {
    const results = {
      average: 0,
      min: Infinity,
      max: 0,
      samples: [] as number[],
    };

    const pingPong = async (): Promise<number> => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        if (type === 'socket-io') {
          this.socketObject.emit(messageType, args);
          this.socketObject.on(messageType, () => {
            const latency = performance.now() - startTime;
            resolve(latency);
          });
        } else {
          this.socketObject.send(messageType, args);
          this.socketObject.onmessage = () => {
            const latency = performance.now() - startTime;
            resolve(latency);
          };
        }
      });
    };

    Array.from({ length: messageCount }).forEach(async () => {
      const latency = await pingPong();
      results.samples.push(latency);
      results.average += latency / messageCount;
      results.min = Math.min(results.min, latency);
      results.max = Math.max(results.max, latency);
    });

    console.log('Latency Test Average Latency: ', results.average);
    console.log('Latency Test Min Latency: ', results.min);
    console.log('Latency Test Max Latency: ', results.max);
    results.average = results.samples.reduce((acc, curr) => acc + curr, 0) / messageCount;
    return results;
  }

  async throughputTest(
    type: 'websocket' | 'socket-io',
    messageSize: number = 1024,
    totalMessages: number = 100,
    messageType: string,
  ) {
    let recivedMessages = 0;
    return new Promise((resolve) => {
      const message = 'x'.repeat(messageSize);
      const startTime = performance.now();

      if (type === 'socket-io') {
        this.socketObject.on(messageType, () => {
          recivedMessages++;
          if (recivedMessages === totalMessages) {
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            const messageThroughput = totalMessages / duration; // message per second
            const dataThroughput = (totalMessages * messageSize) / (1024 * 1024 * duration); // MB/s
            console.log('Socket.io Message Throughput Test: ', messageThroughput, 'msg/s');
            console.log('Socket.io Data Throughput Test: ', dataThroughput, 'MB/s');
            resolve({ messageThroughput, dataThroughput, duration });
          }
        });
      } else {
        this.socketObject.onMessage = () => {
          recivedMessages++;
          if (recivedMessages === totalMessages) {
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            const messageThroughput = totalMessages / duration; // message per second
            const dataThroughput = (totalMessages * messageSize) / (1024 * 1024 * duration); // MB/s
            console.log('WebSocket Message Throughput Test: ', messageThroughput, 'msg/s');
            console.log('WebSocket Data Throughput Test: ', dataThroughput, 'MB/s');
            resolve({ messageThroughput, dataThroughput, duration });
          }
        };
      }

      Array.from({ length: totalMessages }).forEach(() => {
        if (type === 'socket-io') {
          this.socketObject.emit(messageType, message);
        } else {
          this.socketObject.send(message);
        }
      });
    });
  }
}
