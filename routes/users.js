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

module.exports = router;
