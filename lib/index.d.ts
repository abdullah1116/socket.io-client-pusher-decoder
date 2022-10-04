import { Socket as ISocket } from 'socket.io-client';
export declare function initPusher(_io: any): typeof Pusher;
declare class Connection {
    private io;
    constructor(uri: string, opts?: any);
    bind(ev: string, listener: typeof IListener): ISocket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    unbind(ev: string, listener: typeof IListener): ISocket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
}
declare class Pusher {
    connection: Connection;
    subscribers: Record<string, Channel>;
    constructor(url: string, opts?: any);
    subscribe(ev: any): Channel;
    unsubscribe(ev: any): this;
    unsubscribe_all(): this;
    bind(ev: string, listner: typeof IListener): void;
}
declare class Channel {
    private pusher;
    private subscriberName;
    eventListeners: Record<string, PusherBinder[]>;
    constructor(pusher: Pusher, subscriberName: string);
    onEvent(ev: string, data: any): void;
    bind(ev: any, listner: any): void;
    unbind(ev: string): this;
    unbind_all(): this;
    unSubscribe(): void;
}
declare class PusherBinder {
    private pusherChannel;
    private ev;
    private listner;
    constructor(pusherChannel: Channel, ev: string, listner: any);
    emit(data: any): void;
    unbind(): void;
}
declare function IListener(...args: any[]): void;
export interface IPusher extends Pusher {
}
export interface IChannel extends Channel {
}
export {};
