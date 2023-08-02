import { Binder } from './binder';
import { IListener, ISpecifiedListener } from './types';
export declare class Subscriber {
    _binders: Record<string, Binder[]>;
    constructor(unSubscribe: () => void, initListener: (_: typeof IListener) => void);
    /**
     * Un-subscribe this subscriber.
     */
    unSubscribe(): void;
    /**
     * Bind to specified event of this subscriber.
     * @param eventName Event name
     * @param listener Listener
     */
    bind(eventName: string, listener: typeof ISpecifiedListener): void;
    /**
     * Un-bind all specified events of this subscriber.
     * @param eventName Event name
     */
    unBind(eventName: string): this;
    /**
     * Un-bind all events of this subscriber.
     */
    unBindAll(): this;
}
