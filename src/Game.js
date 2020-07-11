export class Game {
  constructor() {
    this._subscribers = [];
    // this.register = this.register.bind(this);
    // this._dispatch = this._dispatch.bind(this);
  }
  register(subscriber) {
    this._subscribers.append(subscriber);
  }
  _dispatch(event) {
    for (subscriber of this._subscribers) {
      subscriber.notify(event);
    }
  }
}
