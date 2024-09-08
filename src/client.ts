import { Subject, Subscription } from "rxjs";
import type { ClientType } from "./types";
import { Random } from "./share/random";

export default class Client implements ClientType {
  protected subjects: Map<string, Subject<any>> = new Map<
    string,
    Subject<any>
  >(); // 实例
  protected subscriptions: Array<{
    id: string;
    event: string;
    subscription: Subscription;
  }> = []; // 订阅列表
  protected destroyed = false;

  constructor(
    protected readonly id: string,
    protected callback: {
      onSubscribe: (event: string, subject: Subject<any>) => void;
    }
  ) {}

  public getId(): string {
    return this.id;
  }

  public getSubject(event: string): Subject<any> | undefined {
    return this.subjects.get(event);
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  /* 订阅 */
  public sub<T>(event: string, subscribe: (e: T) => void): string {
    let subject = this.subjects.get(event);
    if (subject == null) {
      subject = new Subject<any>();
      this.subjects.set(event, subject);
    }
    let id = this.getSubscriptionId();
    let subscription = subject.subscribe((res) => subscribe(res));
    this.subscriptions.push({
      id: id,
      event: event,
      subscription: subscription,
    });
    this.callback.onSubscribe(event, subject);
    return id;
  }

  /* 取消订阅 By Topic */
  public stopSubByTopic(event: string): void {
    for (let i = 0; i < this.subscriptions.length; i++) {
      if (event == this.subscriptions[i].event) {
        this.subscriptions[i].subscription.unsubscribe();
        this.subscriptions.splice(i, 1);
        i--;
      }
    }
  }

  /* 取消订阅 By Id */
  public stopSubBySubscriptionId(id: string): void {
    for (let i = 0; i < this.subscriptions.length; i++) {
      if (id == this.subscriptions[i].id) {
        this.subscriptions[i].subscription.unsubscribe();
        this.subscriptions.splice(i, 1);
        i--;
      }
    }
  }

  /* 销毁 */
  public destroy(): void {
    this.destroyed = true;
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].subscription.unsubscribe();
    }
    for (let subject of this.subjects.values()) {
      subject.unsubscribe();
    }
    this.subjects.clear();
  }

  private getSubscriptionId(): string {
    let id = Random.generateCharMixed(20);
    for (let i = 0; i < this.subscriptions.length; i++) {
      if (id == this.subscriptions[i].id) {
        this.getSubscriptionId();
      }
    }
    return id;
  }
}
