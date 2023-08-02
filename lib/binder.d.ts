import { Subscriber } from './subscriber';
import { ISpecifiedListener } from './types';
export declare class Binder {
    private pusherSubscriber;
    private eventName;
    private listener;
    constructor(pusherSubscriber: Subscriber, eventName: string, listener: typeof ISpecifiedListener);
    emit(data: any): void;
    unbind(): void;
}
