"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriber = void 0;
const binder_1 = require("./binder");
class Subscriber {
    constructor(unSubscribe, initListener) {
        this._binders = {};
        this.unSubscribe = unSubscribe;
        initListener((eventName, data) => {
            if (eventName) {
                if (this._binders[eventName]) {
                    this._binders[eventName].forEach((listeners) => {
                        listeners.emit(data);
                    });
                }
            }
        });
    }
    /**
     * Un-subscribe this subscriber.
     */
    unSubscribe() { }
    //
    //
    //
    /**
     * Bind to specified event of this subscriber.
     * @param eventName Event name
     * @param listener Listener
     */
    bind(eventName, listener) {
        if (!this._binders[eventName]) {
            this._binders[eventName] = [];
        }
        this._binders[eventName].push(new binder_1.Binder(this, eventName, listener));
    }
    /**
     * Un-bind all specified events of this subscriber.
     * @param eventName Event name
     */
    unBind(eventName) {
        const eventListeners = this._binders[eventName];
        if (Array.isArray(eventListeners) && eventListeners.length > 0) {
            eventListeners.forEach((listeners, i) => {
                listeners.unbind();
                eventListeners.splice(i);
            });
            eventListeners.length = 0;
        }
        return this;
    }
    /**
     * Un-bind all events of this subscriber.
     */
    unBindAll() {
        Object.keys(this._binders).forEach((eventName) => {
            this.unBind(eventName);
        });
        return this;
    }
}
exports.Subscriber = Subscriber;
