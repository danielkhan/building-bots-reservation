const { Wit } = require('node-wit');

class WitService {
  constructor(accessToken) {
    this.client = new Wit({ accessToken });
  }

  async query(text) {
    const queryResult = await this.client.message(text);

    const { entities } = queryResult;

    const extractedEntities = {};

    Object.keys(entities).forEach((key) => {
      if (entities[key][0].confidence > 0.7) {
        extractedEntities[key] = entities[key][0].value;
      }
    });
    return extractedEntities;
  }
}

module.exports = WitService;
