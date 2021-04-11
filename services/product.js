const db = require('./db');
const helper = require('../helper');
const { TxType } = require('../helper');

async function get(productId) {
  const rows = await db.query(`SELECT * FROM PRODUCTS_TABLE WHERE id=?`, [
    productId,
  ]);
  const data = helper.emptyOrRows(rows);
  return {
    success: true,
    data,
  };
}

async function getAll() {
  const rows = await db.query(`SELECT * FROM PRODUCTS_TABLE`);
  const data = helper.emptyOrRows(rows);
  return {
    success: true,
    data,
  };
}

async function purchase(productId, customerId) {
  const product = await db.query(`SELECT * FROM PRODUCTS_TABLE WHERE id=?`, [
    productId,
  ]);
  const result = await db.query(
    `INSERT INTO TRANSACTIONS_TABLE
    (fk_product_id, fk_seller_id, customer_id, tx_type)
    VALUES
    (?, ?, ?, ?)`,
    [product[0].id, product[0].fk_seller_id, customerId, TxType.PURCHASE]
  );
  if (result.affectedRows) {
    return {
      success: true,
      data: {
        txId: result.insertId,
        productId,
      },
    };
  } else {
    return {
      success: false,
      error: 'Something went wrong while buying, please try again',
    };
  }
}

async function refund(txId) {
  const transaction = await db.query(
    `SELECT fk_product_id,fk_seller_id,customer_id FROM TRANSACTIONS_TABLE WHERE tx_id=?`,
    [txId]
  );
  //Also need to check if this txId was Already refunded or not?
  //Maybe we can include one more key in TRANSACTIONS_TABLE for tx_type REFUND a key can be there to identify which tx_type PURCHASE this refund was made for? So that we can check if this refund is already processed and no second time refund is made,
  const { fk_product_id, fk_seller_id, customer_id } = transaction[0];
  const result = await db.query(
    `INSERT INTO TRANSACTIONS_TABLE
    (fk_product_id, fk_seller_id, customer_id, tx_type)
    VALUES
    (?, ?, ?, ?)`,
    [fk_product_id, fk_seller_id, customer_id, TxType.REFUND]
  );
  if (result.affectedRows) {
    return {
      success: true,
      data: {
        txId: result.insertId,
      },
    };
  } else {
    return {
      success: false,
      error: 'Something went wrong while refund, please try again',
    };
  }
}

module.exports = {
  get,
  getAll,
  purchase,
  refund,
};
