'use strict';

class ProviderBase {
  async send(messages) {
    throw new Error('send() must be implemented by subclasses');
  }
}

export { ProviderBase };
