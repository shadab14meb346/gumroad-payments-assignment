const db = require('./db');
const helper = require('../helper');
const { TxType, UTCToSQLDateTimeFormat } = require('../helper');

async function getAll() {
  const result = await db.query(`SELECT * FROM USERS_TABLE`);
  const data = helper.emptyOrRows(result);
  return { success: true, data };
}
//getBalance(userId,from,to)
async function getBalance(userId) {
  const mostRecentPayout = await db.query(
    `SELECT * FROM PAYOUTS_TABLE WHERE fk_seller_id=? ORDER BY payout_date DESC LIMIT 1`,
    [userId]
  );
  /*if mostRecentPayout.length === 0  i.e there are no payouts 
    made to this user so we will now query the complete TRANSACTIONS_TABLE to 
    calculate the balance of the user
   */
  if (!mostRecentPayout.length) {
    const allPurchases = await db.query(
      `SELECT id as product_id, SUM(price) FROM PRODUCTS_TABLE INNER JOIN TRANSACTIONS_TABLE ON PRODUCTS_TABLE.id = TRANSACTIONS_TABLE.fk_product_id AND TRANSACTIONS_TABLE.fk_seller_id=? AND TRANSACTIONS_TABLE.tx_type=? GROUP BY PRODUCTS_TABLE.id`,
      [userId, TxType.PURCHASE]
    );
    //check if there is a way to the below thing using any SQL query
    const totalPurchasesAmount = allPurchases.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue['SUM(price)'];
      },
      0
    );
    const allRefunds = await db.query(
      `SELECT id as product_id, SUM(price) FROM PRODUCTS_TABLE INNER JOIN TRANSACTIONS_TABLE ON PRODUCTS_TABLE.id = TRANSACTIONS_TABLE.fk_product_id AND TRANSACTIONS_TABLE.fk_seller_id=? AND TRANSACTIONS_TABLE.tx_type=? GROUP BY PRODUCTS_TABLE.id`,
      [userId, TxType.REFUND]
    );
    //check if there is a way to the below thing using any SQL query
    const totalRefundsAmount = allRefunds.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue['SUM(price)'];
      },
      0
    );
    const netBalance = totalPurchasesAmount - totalRefundsAmount;
    return {
      success: true,
      data: { netBalance },
    };
  } else {
    /*in this block i.e there are some payouts made to the user
     so we will query allPurchases and allRefunds from the last payout mostRecentPayout.to till now
    */
    const allPurchasesFromLastPayoutTillToday = await db.query(
      `SELECT id as product_id, SUM(price) FROM PRODUCTS_TABLE INNER JOIN TRANSACTIONS_TABLE ON PRODUCTS_TABLE.id = TRANSACTIONS_TABLE.fk_product_id AND TRANSACTIONS_TABLE.fk_seller_id=? AND TRANSACTIONS_TABLE.tx_type=? AND TRANSACTIONS_TABLE.created_at > ? GROUP BY PRODUCTS_TABLE.id`,
      [userId, TxType.PURCHASE, UTCToSQLDateTimeFormat(mostRecentPayout[0].to)]
    );
    //check if there is a way to the below thing using any SQL query
    const totalPurchaseAmountFromLastPayoutTillToday = allPurchasesFromLastPayoutTillToday.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue['SUM(price)'];
      },
      0
    );
    const allRefundsFromLastPayoutTillToday = await db.query(
      `SELECT id as product_id, SUM(price) FROM PRODUCTS_TABLE INNER JOIN TRANSACTIONS_TABLE ON PRODUCTS_TABLE.id = TRANSACTIONS_TABLE.fk_product_id AND TRANSACTIONS_TABLE.fk_seller_id=? AND TRANSACTIONS_TABLE.tx_type=? AND TRANSACTIONS_TABLE.created_at > ? GROUP BY PRODUCTS_TABLE.id`,
      [userId, TxType.REFUND, UTCToSQLDateTimeFormat(mostRecentPayout[0].to)]
    );
    //check if there is a way to the below thing using any SQL query
    const totalPRefundAmountFromLastPayoutTillToday = allRefundsFromLastPayoutTillToday.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue['SUM(price)'];
      },
      0
    );
    const netBalance =
      totalPurchaseAmountFromLastPayoutTillToday -
      totalPRefundAmountFromLastPayoutTillToday;
    return {
      success: true,
      data: { netBalance },
    };
  }
}

module.exports = {
  getAll,
  getBalance,
};
