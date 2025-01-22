export default class CustomSocket extends WebSocket {
  constructor(url: string, protocols?: []) {
    super(url, protocols);
  }

  public emit(eventName: string, args?: any) {
    const data = {
      eventName,
      ...args,
    };
    this.send(data);
  }

  public on(eventName: string) {
    this.addEventListener('message', (event) => {
      if (event.data.eventName === eventName) {
        return event.data;
      }
    });
  }
  // MessageEvent<any>
  public emitWithAck(eventName: string, args?: any, cb?: (data: unknown) => unknown) {
    return new Promise((resolve, reject) => {
      this.send({ eventName, ...args });
      this.addEventListener('message', (event) => {
        if (event.data.eventName === eventName) {
          if (cb) {
            resolve(cb(event.data));
          } else {
            resolve(event.data);
          }
        }
      });
      setTimeout(() => {
        reject(new Error('no response from server'));
      }, 3000);
    });
  }
}
