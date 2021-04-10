const db = require('./db');
const helper = require('../helper');

async function getAll() {
  const result = await db.query(`SELECT * FROM USERS_TABLE`);
  const data = helper.emptyOrRows(result);
  return { success: true, data };
}

module.exports = {
  getAll,
};
