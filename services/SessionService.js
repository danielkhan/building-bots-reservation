class SessionService {
  constructor() {
    this.sessions = {};
    this.timeout = 60 * 5;
  }

  static now() {
    return Math.floor(new Date() / 1000);
  }

  create(sessionId) {
    this.cleanup();
    this.sessions[sessionId] = {
      timestamp: SessionService.now(),
      context: {},
    };

    return this.sessions[sessionId];
  }

  get(sessionId) {
    this.cleanup();
    if (!this.sessions[sessionId]) return false;
    this.update(sessionId);
    return this.sessions[sessionId];
  }

  delete(sessionId) {
    if (!this.sessions[sessionId]) return false;
    delete this.sessions[sessionId];
    return true;
  }

  update(sessionId) {
    this.cleanup();
    if (!this.sessions[sessionId]) return false;
    this.sessions[sessionId].timestamp = SessionService.now();
    return this.sessions[sessionId];
  }

  cleanup() {
    const now = SessionService.now();

    Object.keys(this.sessions).forEach((key) => {
      const session = this.sessions[key];
      if (session.timestamp + this.timeout < now) {
        this.delete(key);
      }
    });
    return true;
  }
}

module.exports = SessionService;
