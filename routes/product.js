const express = require('express');
const router = express.Router();
const products = require('../services/product');
/*GET all products*/
router.get('/', async function (req, res, next) {
  try {
    res.json(await products.getAll());
  } catch (err) {
    console.error(`Error while getting programming languages`, err.message);
    next(err);
  }
});

/* GET an individual product*/
router.get('/:id', async function (req, res, next) {
  try {
    res.json(await products.get(req.params.id));
  } catch (err) {
    console.error(`Error while getting programming languages`, err.message);
    next(err);
  }
});

/*POST Purchase a product*/
router.post('/purchase', async function (req, res, next) {
  try {
    res.json(await products.purchase(req.body.productId, req.body.customerId));
  } catch (err) {
    console.error(`Error while getting programming languages`, err.message);
    next(err);
  }
});

/*POST Refund for a product*/
router.post('/refund', async function (req, res, next) {
  try {
    res.json(await products.refund(req.body.txId));
  } catch (err) {
    console.error(`Error while getting programming languages`, err.message);
    next(err);
  }
});

module.exports = router;
