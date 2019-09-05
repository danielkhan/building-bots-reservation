/* eslint-disable no-param-reassign */
class ConversationService {
  static async run(witService, text, context) {
    if (!context.conversation) {
      context.conversation = {
        entities: {},
        followUp: '',
        complete: false,
        exit: false,
      };
    }

    if (!text) {
      context.conversation.followUp = 'Hey back!';
      return context;
    }

    const entities = await witService.query(text);
    context.conversation.entities = { ...context.conversation.entities, ...entities };

    if (context.conversation.entities.bye) {
      context.conversation.followUp = 'Ok, bye!';
      context.conversation.exit = true;
      return context;
    }

    if (context.conversation.entities.intent === 'reservation') {
      return ConversationService.intentReservation(context);
    }

    if (context.conversation.entities.greetings) {
      context.conversation.followUp = 'Hello, this is Resi. What can I do for you?';
      return context;
    }

    context.conversation.followUp = 'Could you rephrase that?';
    return context;
  }

  static intentReservation(context) {
    const { conversation } = context;
    const { entities } = conversation;
    if (!entities.reservationDateTime) {
      conversation.followUp = 'For when would you like to make your reservation?';
      return context;
    }
    if (!entities.numberOfGuests) {
      conversation.followUp = 'For how many persons?';
      return context;
    }
    if (!entities.customerName) {
      conversation.followUp = 'Would you tell me your name please?';
      return context;
    }
    conversation.complete = true;
    return context;
  }
}

module.exports = ConversationService;
