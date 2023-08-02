"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Binder = void 0;
class Binder {
    constructor(pusherSubscriber, eventName, listener) {
        this.pusherSubscriber = pusherSubscriber;
        this.eventName = eventName;
        this.listener = listener;
    }
    emit(data) {
        this.listener(data);
    }
    unbind() {
        const eventListeners = this.pusherSubscriber._binders[this.eventName];
        if (Array.isArray(eventListeners) && eventListeners.length > 0) {
            const index = eventListeners.findIndex((v) => v === this);
            eventListeners.splice(index, 1);
        }
    }
}
exports.Binder = Binder;
