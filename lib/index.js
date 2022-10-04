"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPusher = void 0;
let io;
function initPusher(_io) {
    io = _io;
    return Pusher;
}
exports.initPusher = initPusher;
class Connection {
    constructor(uri, opts) {
        if (typeof io === undefined) {
            throw 'not initialized';
        }
        this.io = io(uri, opts);
    }
    bind(ev, listener) {
        return this.io.on(ev, listener);
    }
    unbind(ev, listener) {
        return this.io.off(ev, listener);
    }
}
class Pusher {
    constructor(url, opts) {
        this.subscribers = {};
        this.connection = new Connection(url, {
            auth: (cb) => cb(opts),
        });
    }
    subscribe(ev) {
        if (this.subscribers[ev]) {
            return this.subscribers[ev];
        }
        return (this.subscribers[ev] = new Channel(this, ev));
    }
    unsubscribe(ev) {
        if (this.subscribers[ev]) {
            this.subscribers[ev].unSubscribe();
        }
        return this;
    }
    unsubscribe_all() {
        Object.keys(this.subscribers).forEach((ev) => {
            if (this.subscribers[ev]) {
                this.subscribers[ev].unbind_all();
                delete this.subscribers[ev];
            }
        });
        return this;
    }
    bind(ev, listner) {
        this.connection.bind(ev, listner);
    }
}
class Channel {
    constructor(pusher, subscriberName) {
        this.pusher = pusher;
        this.subscriberName = subscriberName;
        this.eventListeners = {};
        pusher.connection.bind(subscriberName, (eventName, data) => this.onEvent(eventName, data));
    }
    onEvent(ev, data) {
        if (ev) {
            if (this.eventListeners[ev]) {
                this.eventListeners[ev].forEach((listeners) => {
                    listeners.emit(data);
                });
            }
        }
    }
    bind(ev, listner) {
        if (!this.eventListeners[ev]) {
            this.eventListeners[ev] = [];
        }
        this.eventListeners[ev].push(new PusherBinder(this, ev, listner));
    }
    unbind(ev) {
        const eventListeners = this.eventListeners[ev];
        if (Array.isArray(eventListeners) && eventListeners.length > 0) {
            eventListeners.forEach((listeners, i) => {
                listeners.unbind();
                delete eventListeners[i];
            });
            eventListeners.length = 0;
        }
        return this;
    }
    unbind_all() {
        Object.keys(this.eventListeners).forEach((ev) => this.unbind(ev));
        return this;
    }
    unSubscribe() {
        this.pusher.connection.unbind(this.subscriberName, this.onEvent);
        delete this.pusher.subscribe[this.subscriberName];
    }
}
class PusherBinder {
    constructor(pusherChannel, ev, listner) {
        this.pusherChannel = pusherChannel;
        this.ev = ev;
        this.listner = listner;
    }
    emit(data) {
        this.listner(data);
    }
    unbind() {
        const eventListeners = this.pusherChannel.eventListeners[this.ev];
        if (Array.isArray(eventListeners) && eventListeners.length > 0) {
            const index = eventListeners.findIndex((v) => v === this);
            eventListeners.splice(index, 1);
        }
    }
}
