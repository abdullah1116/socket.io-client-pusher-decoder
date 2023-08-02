import { Socket } from 'socket.io-client';
import { Subscriber } from './subscriber';
import { IListener } from './types';
export declare class Pusher {
    _socket: Socket;
    _subscribers: Record<string, {
        subscriber: Subscriber;
        listener: typeof IListener;
    }>;
    constructor(url: string, options?: any);
    /**
     * Subscribe specified subscribers.
     * @param subscriberName Event name
     */
    subscribe(subscriberName: string): Subscriber;
    private initSubscriber;
    /**
     * Un-Subscribe specified subscribers.
     * @param subscriberName Event name
     */
    unSubscribe(subscriberName: string): this;
    /**
     * Un-Subscribe all subscribers.
     * !!WARNING!!! This will remove all subscribers
     */
    unSubscribeAll(): this;
    /**
     * Bind to all events of all subscribers.
     * @param subscriberName Subscribers name
     * @param listener Listener
     * @deprecated
     */
    bind(subscriberName: string, listener: typeof IListener): this;
}
