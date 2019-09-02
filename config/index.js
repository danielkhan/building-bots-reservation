const path = require('path');

require('dotenv').config();

module.exports = {
  reservations: {
    datafile: path.join(__dirname, '../data/reservations.json'),
    reservationDuration: 2,
    numberOfTables: 6,
  },
  slack: {
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_TOKEN,
  },
  wit: {
    token: process.env.WIT_TOKEN,
  },
};
