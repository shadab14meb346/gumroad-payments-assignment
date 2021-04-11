function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

const TxType = {
  PURCHASE: 'PURCHASE',
  REFUND: 'REFUND',
};

const UTCToSQLDateTimeFormat = (UTCTime) => {
  return new Date(UTCTime).toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

module.exports = {
  emptyOrRows,
  TxType,
  UTCToSQLDateTimeFormat,
};
