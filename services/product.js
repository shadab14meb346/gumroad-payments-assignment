const db = require('./db');
const helper = require('../helper');
const { txType } = require('../helper');

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
  const { fk_seller_id, price } = product[0];
  const result = await db.query(
    `INSERT INTO TRANSACTIONS_TABLE
    (fk_product_id, fk_seller_id, customer_id, tx_type)
    VALUES
    (?, ?, ?, ?)`,
    [productId, fk_seller_id, customerId, txType.PURCHASE]
  );
  if (result.affectedRows) {
    const sellerBalance = await db.query(
      `SELECT balance FROM USERS_TABLE WHERE id=?`,
      [fk_seller_id]
    );
    console.log(sellerBalance, 'sellerBalance');
    const balanceUpdateOfSeller = await db.query(
      `UPDATE USERS_TABLE SET balance=? WHERE id=?`,
      [sellerBalance[0].balance + price, fk_seller_id]
    );
    if (balanceUpdateOfSeller.changedRows) {
      return {
        success: true,
        data: {
          txId: result.insertId,
          productId,
        },
      };
    } else {
      //TODO if the balance update wasn't successful we should delete the above inserted transaction row
      //TODO send a better error message
      return {
        success: false,
        error: 'Something went wrong in balance update, please try again',
      };
    }
  } else {
    return {
      success: false,
      error: 'Something went wrong while inserting in tx table',
    };
  }
}

async function refund(txId) {
  const transaction = await db.query(
    `SELECT fk_product_id,customer_id FROM TRANSACTIONS_TABLE WHERE tx_id=?`,
    [txId]
  );
  //Also need to check if this txId was Already refunded or not?
  //If we include an amount key in the transaction table we can skip the below query
  //We can include one more key in TRANSACTIONS_TABLE for tx_type REFUND a key can be there to identify which tx_type PURCHASE this refund was made for? So that we can check if this refund is already processed and second time refund is made,
  const product = await db.query(
    `SELECT id,price,fk_seller_id FROM PRODUCTS_TABLE WHERE id=?`,
    [transaction[0].fk_product_id]
  );
  const { id, fk_seller_id, price } = product[0];
  const result = await db.query(
    `INSERT INTO TRANSACTIONS_TABLE
    (fk_product_id, fk_seller_id, customer_id, tx_type)
    VALUES
    (?, ?, ?, ?)`,
    [id, fk_seller_id, transaction[0].customer_id, txType.REFUND]
  );
  if (result.affectedRows) {
    const sellerBalance = await db.query(
      `SELECT balance FROM USERS_TABLE WHERE id=?`,
      [fk_seller_id]
    );
    const balanceUpdateOfSeller = await db.query(
      `UPDATE USERS_TABLE SET balance=? WHERE id=?`,
      [sellerBalance[0].balance - price, fk_seller_id]
    );
    if (balanceUpdateOfSeller.changedRows) {
      return {
        success: true,
        data: {
          txId: result.insertId,
        },
      };
    } else {
      //TODO if the balance update wasn't successful we should delete the above inserted transaction row
      //TODO send a better error message
      return {
        success: false,
        error: 'Something went wrong in balance update, please try again',
      };
    }
  } else {
    return {
      success: false,
      error: 'Something went wrong while inserting in tx table',
    };
  }
}

module.exports = {
  get,
  getAll,
  purchase,
  refund,
};
