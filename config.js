
// Maximum number of transactions that can be present in a block and transaction pool
const TRANSACTION_THRESHOLD = 5;

// total number of nodes in the network
const NUMBER_OF_NODES = 100;

// Minmum number of positive votes required for the message/block to be valid
const MIN_APPROVALS = 2 * (NUMBER_OF_NODES / 3) + 1;

const SECRET = require('crypto').randomBytes(32).toString('hex');

module.exports = {
  TRANSACTION_THRESHOLD,
  NUMBER_OF_NODES,
  MIN_APPROVALS,
};
