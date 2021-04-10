function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

const txType = {
  PURCHASE: 'PURCHASE',
  REFUND: 'REFUND',
};

module.exports = {
  emptyOrRows,
  txType,
};
