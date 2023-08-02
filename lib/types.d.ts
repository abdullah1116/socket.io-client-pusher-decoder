import { Pusher } from './pusher';
import { Subscriber } from './subscriber';
export declare function IListener(eventName: string, data: any): void;
export declare function ISpecifiedListener(data: any): void;
export interface IPusher extends Pusher {
}
export interface ISubscriber extends Subscriber {
}
