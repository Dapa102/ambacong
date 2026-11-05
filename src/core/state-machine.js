export class StateMachine {
  constructor(initialState) {
    this.state = initialState;
    this.handlers = new Map();
  }

  on(state, handler) {
    if (!this.handlers.has(state)) this.handlers.set(state, []);
    this.handlers.get(state).push(handler);
    return () => {
      const list = this.handlers.get(state);
      if (!list) return;
      const index = list.indexOf(handler);
      if (index !== -1) list.splice(index, 1);
    };
  }

  set(state, payload) {
    this.state = state;
    const list = this.handlers.get(state);
    if (!list) return;
    for (const handler of [...list]) handler(payload);
  }
}
