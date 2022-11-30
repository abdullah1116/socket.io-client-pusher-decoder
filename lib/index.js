"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pusher = void 0;
class Connection {
    constructor(io, uri, opts) {
        this.socket = io(uri, opts);
    }
    bind(eventName, listener) {
        return this.socket.on(eventName, listener);
    }
    unbind(eventName, listener) {
        return this.socket.off(eventName, listener);
    }
}
class Pusher {
    constructor(io, url, opts) {
        this.subscribers = {};
        if (typeof io === undefined) {
            throw 'not initialized';
        }
        this.io = new Connection(io, url, {
            auth: (cb) => cb(opts),
        });
    }
    /**
     * Subscribe specified channels.
     * @param eventName Event name
     */
    subscribe(eventName) {
        if (this.subscribers[eventName]) {
            return this.subscribers[eventName];
        }
        return (this.subscribers[eventName] = new Channel(this, eventName));
    }
    /**
     * Un-Subscribe specified channels.
     * @param eventName Event name
     */
    unsubscribe(eventName) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].unSubscribe();
        }
        return this;
    }
    /**
     * Un-Subscribe all channels.
     * !!WARNING!!! This will remove all subscribers
     */
    unsubscribe_all() {
        Object.keys(this.subscribers).forEach((eventName) => {
            if (this.subscribers[eventName]) {
                this.subscribers[eventName].unbind_all();
                delete this.subscribers[eventName];
            }
        });
        return this;
    }
    /**
     * Bind to all events of all channels.
     * @param eventName Event name
     * @param listener Listener
     */
    bind(eventName, listener) {
        this.io.bind(eventName, listener);
    }
}
exports.Pusher = Pusher;
class Channel {
    constructor(pusher, subscriberName) {
        this.pusher = pusher;
        this.subscriberName = subscriberName;
        this.eventListeners = {};
        pusher.io.bind(subscriberName, (eventName, data) => this.onEvent(eventName, data));
    }
    onEvent(eventName, data) {
        if (eventName) {
            if (this.eventListeners[eventName]) {
                this.eventListeners[eventName].forEach((listeners) => {
                    listeners.emit(data);
                });
            }
        }
    }
    /**
     * Bind to specified event of this channel.
     * @param eventName Event name
     * @param listener Listener
     */
    bind(eventName, listener) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(new PusherBinder(this, eventName, listener));
    }
    /**
     * Un-bind all specified events of this channel.
     * @param eventName Event name
     */
    unbind(eventName) {
        const eventListeners = this.eventListeners[eventName];
        if (Array.isArray(eventListeners) && eventListeners.length > 0) {
            eventListeners.forEach((listeners, i) => {
                listeners.unbind();
                delete eventListeners[i];
            });
            eventListeners.length = 0;
        }
        return this;
    }
    /**
     * Un-bind all events of this channel.
     */
    unbind_all() {
        Object.keys(this.eventListeners).forEach((eventName) => this.unbind(eventName));
        return this;
    }
    /**
     * Un-subscribe this channel.
     */
    unSubscribe() {
        this.pusher.io.unbind(this.subscriberName, this.onEvent);
        delete this.pusher.subscribe[this.subscriberName];
    }
}
class PusherBinder {
    constructor(pusherChannel, eventName, listener) {
        this.pusherChannel = pusherChannel;
        this.eventName = eventName;
        this.listener = listener;
    }
    emit(data) {
        this.listener(data);
    }
    unbind() {
        const eventListeners = this.pusherChannel.eventListeners[this.eventName];
        if (Array.isArray(eventListeners) && eventListeners.length > 0) {
            const index = eventListeners.findIndex((v) => v === this);
            eventListeners.splice(index, 1);
        }
    }
}
