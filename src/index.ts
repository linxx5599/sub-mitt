import { Observable, Subject } from "rxjs";
import { Random } from "./share/random";
import { ClientType } from "./types";
import Client from "./client";

export default class SubMitt {
  private static Random = Random;
  private random = new SubMitt.Random(); // 使用种子随机数生成唯一ID
  private clients = new Map<string, ClientType>(); // 客户端
  private topic2clients = new Map<string, Map<string, ClientType>>(); // 根据Topic存储的客户端
  private persistentQueue = new Map<any, Array<any>>(); // 持久化队列
  constructor() {}

  /* 创建连接 */
  public createClient(id?: string): ClientType {
    return this.createClientByParam({ id: id });
  }

  private createClientByParam(param: { id?: string }): ClientType {
    if (param.id == null) {
      param.id =
        SubMitt.Random.generateCharMixed(20) +
        "_" +
        this.random.nextInt(2147483647);
    }
    if (this.clients.has(param.id)) {
      throw "Client ID重复";
    }
    let client = new Client(param.id, {
      onSubscribe: (event, subject) => {
        // 根据topic存储client
        if (this.topic2clients.get(event) == null) {
          this.topic2clients.set(event, new Map<string, ClientType>());
        }
        this.topic2clients.get(event)?.set(client.getId(), client);
        // 完成存储后执行其它回调方法
        this.clientSubscribeCallback(client, event, subject);
      },
    });
    this.clients.set(param.id, client);
    return client;
  }

  /* 销毁连接 */
  public destroyClient(client: ClientType): void {
    // 删除客户端
    this.clients.delete(client.getId());
    // 删除根据Topic存储的客户端
    for (let event of this.topic2clients.keys()) {
      this.topic2clients.get(event)?.delete(client.getId());
    }
    client.destroy();
  }

  /* 发布 */
  public pub(event: string, msg: any): void {
    let published = false;
    let clients = this.topic2clients.get(event);
    if (clients != null) {
      for (let client of clients.values()) {
        if (!client.isDestroyed()) {
          let subject = client.getSubject(event);
          if (subject != null && !subject.closed) {
            subject.next(msg);
            published = true;
          }
        }
      }
    }
    // 消息未发送，进行持久化存储
    if (!published) {
      if (this.persistentQueue.get(event) == null) {
        this.persistentQueue.set(event, []);
      }
      this.persistentQueue.get(event)?.push(msg);
    }
  }

  /* 客户端订阅回调 */
  private clientSubscribeCallback(
    client: ClientType,
    event: string,
    subject: Subject<any>
  ): void {
    // 处理持久化消息
    this.processPersistentQueue(event, subject);
  }

  /* 处理持久化消息 */
  private processPersistentQueue(event: string, subject: Subject<any>): void {
    let queue = this.persistentQueue.get(event);
    if (queue == null) {
      return;
    }
    // 异步发送已持久化的消息
    new Observable<boolean>((observer) => {
      Promise.resolve().then(() => {
        observer.next(true);
      });
    }).subscribe(() => {
      if (queue == null) {
        return;
      }
      for (let i = 0; i < queue.length; i++) {
        subject.next(queue[i].data);
      }
      if (queue.length == 0) {
        this.persistentQueue.delete(event);
      }
    });
  }
}
