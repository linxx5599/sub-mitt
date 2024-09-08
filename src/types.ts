import { Subject } from "rxjs";

export interface ClientType {
  getId(): string;

  getSubject(event: string): Subject<any> | undefined;

  isDestroyed(): boolean;

  sub<T>(event: string, subscribe: (e: T) => void): string;

  stopSubByTopic(event: string): void;

  stopSubBySubscriptionId(id: string): void;

  destroy(): void;
}
