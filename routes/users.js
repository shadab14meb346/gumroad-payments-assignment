const express = require('express');
const router = express.Router();
const users = require('../services/users');

/* GET all users */
router.get('/', async function (req, res, next) {
  try {
    res.json(await users.getAll());
  } catch (err) {
    console.error(`Error while getting users`, err.message);
    next(err);
  }
});

router.get('/get-balance/:id', async function (req, res, next) {
  try {
    res.json(await users.getBalance(req.params.id));
  } catch (err) {
    console.error(`Error while getting users`, err.message);
    next(err);
  }
});

/*this route will be accessible to the Admins or the script only to do the payouts.*/
router.get('/payout-amount/:id', async function (req, res, next) {
  try {
    res.json(await users.getPayoutAmount(req.params.id, req.query.till));
  } catch (err) {
    console.error(`Error while getting users`, err.message);
    next(err);
  }
});

module.exports = router;
