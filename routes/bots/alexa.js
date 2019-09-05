const express = require('express');

// Install ask-sdk-core AND ask-sdk-model
const Alexa = require('ask-sdk-core');
const moment = require('moment');

const ConversationService = require('../../services/ConversationService');

const router = express.Router();

module.exports = (params) => {
  const {
    witService, reservationService, sessionService,
  } = params;

  // This handler is needed by Alexa to launch a conversation
  const sessionStartHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
      const speechText = 'Hey there! What can I do for you?';
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    },
  };

  // This is a handler needed by Alexa to handle stop phrases coming from the user
  const stopIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
      // Delete the session
      const { sessionId } = handlerInput.requestEnvelope.session;
      sessionService.delete(sessionId);
      const speechText = 'Alright, good bye!';
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();
    },
  };

  // This handler is called when an Alexa session actually ended
  const sessionEndHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      // Delete the session
      const { sessionId } = handlerInput.requestEnvelope.session;
      sessionService.delete(sessionId);
    },
  };

  // This handler is responsible for the reservation logic
  const reservationIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'reservation';
    },
    async handle(handlerInput) {
      const { sessionId } = handlerInput.requestEnvelope.session;
      let session = sessionService.get(sessionId);
      if (!session) {
        session = sessionService.create(sessionId);
      }
      const eventText = handlerInput.requestEnvelope.request.intent.slots.any.value;

      const context = await ConversationService.run(witService, eventText, session.context);
      const { conversation } = context;
      const { entities } = conversation;
      let speechText = '';
      if (!conversation.complete) {
        speechText = conversation.followUp;
      } else {
        const {
          customerName,
          reservationDateTime,
          numberOfGuests,
        } = entities;
        const reservationResult = await reservationService
          .tryReservation(moment(reservationDateTime).unix(), numberOfGuests, customerName);
        speechText = reservationResult.success || reservationResult.error;
      }
      const response = await handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(conversation.complete || conversation.exit)
        .getResponse();


      if (conversation.complete || conversation.exit) {
        // eslint-disable-next-line no-param-reassign
        sessionService.delete(sessionId);
      }

      return response;
    },
  };

  //  Here we register all the request handlers
  const skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      sessionStartHandler,
      sessionEndHandler,
      reservationIntentHandler,
      stopIntentHandler,
    )
    .create();

  // This provides us with the endpoint for Alexa
  router.post('/', async (req, res, next) => {
    try {
      const response = await skill.invoke(req.body);
      return res.json(response);
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
