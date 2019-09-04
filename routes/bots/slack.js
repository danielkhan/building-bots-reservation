const express = require('express');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const moment = require('moment');

const router = express.Router();

function createSessionId(channel, user, ts) {
  return `${channel}-${user}-${ts}`;
}

module.exports = (params) => {
  const {
    config,
    witService,
    reservationService,
    sessionService,
  } = params;

  const slackEvents = createEventAdapter(config.slack.signingSecret);
  const slackWebClient = new WebClient(config.slack.token);

  router.use('/events', slackEvents.requestListener());

  async function handleMention(event) {
    const mention = /<@[A-Z0-9]+>/;
    const eventText = event.text.replace(mention, '').trim();

    let text = '';

    if (!eventText) {
      text = 'Hey!';
    } else {
      const entities = await witService.query(eventText);
      const { intent, customerName, reservationDateTime, numberOfGuests } = entities;

      if (!intent || intent !== 'reservation' || !customerName || !reservationDateTime || !numberOfGuests) {
        text = 'Sorry - could you rephrase that?';
        console.log(entities);
      } else {
        const reservationResult = await reservationService
          .tryReservation(moment(reservationDateTime).unix(), numberOfGuests, customerName);
        text = reservationResult.success || reservationResult.error;
      }
    }

    return slackWebClient.chat.postMessage({
      text,
      channel: event.channel,
      username: 'Resi',
    });
  }

  slackEvents.on('app_mention', handleMention);

  return router;
};
