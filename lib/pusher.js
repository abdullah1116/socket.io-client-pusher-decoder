"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pusher = void 0;
const socket_io_client_1 = require("socket.io-client");
const subscriber_1 = require("./subscriber");
class Pusher {
    constructor(url, options) {
        this._subscribers = {};
        this._socket = (0, socket_io_client_1.io)(url, {
            auth: (callback) => callback(Object.assign(Object.assign({}, (options || {})), { subscribers: Object.keys(this._subscribers) })),
        });
    }
    /**
     * Subscribe specified subscribers.
     * @param subscriberName Event name
     */
    subscribe(subscriberName) {
        return (this._subscribers[subscriberName] || this.initSubscriber(subscriberName)).subscriber;
    }
    initSubscriber(subscriberName) {
        this._subscribers[subscriberName] = {};
        this._subscribers[subscriberName].subscriber = new subscriber_1.Subscriber(() => this.unSubscribe(subscriberName), (listener) => {
            this._socket.emit('connection_subscribe', subscriberName);
            this._subscribers[subscriberName].listener = listener;
            this._socket.on(subscriberName, (eventName, data) => listener(eventName, data));
        });
        return this._subscribers[subscriberName];
    }
    /**
     * Un-Subscribe specified subscribers.
     * @param subscriberName Event name
     */
    unSubscribe(subscriberName) {
        if (this._subscribers[subscriberName]) {
            this._socket.emit('connection_un_subscribe', subscriberName);
            this._socket.off(subscriberName, this._subscribers[subscriberName].listener);
            delete this._subscribers[subscriberName].subscriber;
            delete this._subscribers[subscriberName];
        }
        return this;
    }
    /**
     * Un-Subscribe all subscribers.
     * !!WARNING!!! This will remove all subscribers
     */
    unSubscribeAll() {
        Object.keys(this._subscribers).forEach((subscriberName) => {
            this.unSubscribe(subscriberName);
        });
        return this;
    }
    /**
     * Bind to all events of all subscribers.
     * @param subscriberName Subscribers name
     * @param listener Listener
     * @deprecated
     */
    bind(subscriberName, listener) {
        this._socket.on(subscriberName, listener);
        return this;
    }
}
exports.Pusher = Pusher;
