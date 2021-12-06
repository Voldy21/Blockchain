const { NUMBER_OF_NODES, MIN_APPROVALS, TRANSACTION_THRESHOLD, SECRET } = require('./config');

// import the min approval constant which will be used to compare the count the messages

const Wallet = require("./wallet");
const bodyParser = require("body-parser");
const TransactionPool = require("./transaction-pool");
const P2pserver = require("./p2p-server");
const Validators = require("./validators");
const Blockchain = require("./blockchain");
const BlockPool = require("./block-pool");
const CommitPool = require("./commit-pool");
const PreparePool = require("./prepare-pool");
const MessagePool = require("./message-pool");
const Transaction = require("./transaction");
const Block = require("./block");

const wallet = new Wallet(SECRET);
const transactionPool = new TransactionPool();
const validators = new Validators(NUMBER_OF_NODES);
const blockchain = new Blockchain(validators);
const blockPool = new BlockPool();
const preparePool = new PreparePool();
const commitPool = new CommitPool();
const messagePool = new MessagePool();

let delta = 100;
let walletList = [];
//Building up the  Stage
//init walletList, validators, transactionPool
let block = init();
console.log(block)
//Propose
/*
block = propose(block);
//Prepare
block = prepare(block);
*/
/*
//Commit Stage
commit();
//Notify
notify();
*/
function init() {
  //init walletList
  for (let i = 0; i < NUMBER_OF_NODES; i++) {
    walletList.push(new Wallet("NODE" + i));
  }
  //init transactionPool
  let thresholdReached;
  for (let i = 0; i < TRANSACTION_THRESHOLD; i++) {
    let transaction = walletList[randomMember()].createTransaction("Message number" + i);
    thresholdReached = transactionPool.addTransaction(transaction);
  }
    //If the threshold is reached, create the block
    if(thresholdReached){
      console.log("Threshold Reached")
      let block = blockchain.createBlock(
        transactionPool.transactions,
        wallet
      )
      return block;
    }
}

function propose(block) {  
  //create block and broadcast it
  if (
      blockPool.exisitingBlock(block) && // check if block exists in blockPool
      blockchain.isValidBlock(block)     // Check if valid
    ){
      //add to the block pool
      blockPool.addBlock(block)

      //Create a prepare block and broadcast to other nodes
      block = preparePool.prepare(block, wallet);
      //Broadcast and get response
      sleep()

      return block;
    }
}

function prepare(block) {
  //Check if wallet is a validator
  //Check the prepare message if it's valid
  console.log(block)
  if (
      preparePool.isValidPrepare(block, wallet) &&
      validators.isValidValidator(wallet.publicKey)
    ) {
      preparePool.addPrepare(block);
      sleep()
      for(let i=0;i<=MIN_APPROVALS; i++){
        preparePool.addPrepare(block);
      }
      console.log("Entered")
      if (preparePool.list.length >= MIN_APPROVALS){
        console.log("preparePool meets minimum approvals")
        //move on to commit step
        block = commitPool.commit(block, wallet)
        //broadcast commit message and get response
        sleep()
        sleep()
        return block;
      }
    }
}
function commit(){
  //Check if validCommit
  //Check if the wallet is a validator
   if (
      !this.commitPool.existingCommit(data.commit) &&
      this.commitPool.isValidCommit(data.commit) &&
      this.validators.isValidValidator(data.commit.publicKey)
    ) {

    //add commit block to pool
    commitPool.addCommit(block);

    //broadcast and recieve response
    sleep()
    sleep()

    for(let i=0;i<MIN_APPROVALS; i++){
      commitPool.addCommit(block);
    }

     //When MIN_APPROVALS are met, 
    //add block, blockpool, preparepool, commit pool to blockchain
    if (
      this.commitPool.list[data.commit.blockHash].length >=
      MIN_APPROVALS
    ) {
      console.log("ADDING BLOCK TO BLOCKCHAIN")
      this.blockchain.addUpdatedBlock(
        data.commit.blockHash,
        this.blockPool,
        this.preparePool,
        this.commitPool
      );
    }
  }
 

}

function notify(block) {
  //message is sent to other nodes and then messages are recieved\
  let message = this.messagePool.createMessage(
    blockchain.chain[this.blockchain.chain.length - 1].hash,
    wallet
  );
  sleep()
  sleep()
  transactionPool.clear()
}

async function sleep() {
  console.log("Sleeping");
  await new Promise((r) => setTimeout(r, delta));
  console.log("Waking up");
}

function randomMember() {
  return Math.floor(Math.random() * NUMBER_OF_NODES);
}
