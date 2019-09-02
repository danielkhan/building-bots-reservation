const express = require('express');
const moment = require('moment');

const router = express.Router();

module.exports = (params) => {
  const { reservationService } = params;

  router.get('/', async (req, res) => {
    const reservations = await reservationService.getList();
    res.render('index', {
      reservationResult: {},
      formdata: {},
      reservations,
      moment,
    });
  });

  router.post('/reservation', async (req, res, next) => {
    try {
      const {
        datetime,
        numberOfGuests,
        customerName,
      } = req.body;
      // This provides just a minimal sanity check.
      // In real projects make sure to add more input validation.
      if (!datetime || !numberOfGuests || !customerName) return next(new Error('Insufficient data'));

      const reservationResult = await reservationService.tryReservation(moment(datetime, 'L LT').unix(), numberOfGuests, customerName);

      const reservations = await reservationService.getList();
      let formdata = {};
      if (reservationResult.error) {
        formdata = { ...req.body };
      }
      return res.render('index', {
        reservationResult,
        reservations,
        moment,
        formdata,
      });
    } catch (err) {
      return next(err);
    }
  });
  return router;
};
