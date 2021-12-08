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

const wallet = new Wallet("NODE" + 1);
const transactionPool = new TransactionPool();
const validators = new Validators(NUMBER_OF_NODES);
const blockchain = new Blockchain(validators);
const blockPool = new BlockPool();
const preparePool = new PreparePool();
const commitPool = new CommitPool();
const messagePool = new MessagePool();

let delta = 100;
let walletList = [];
let block;
let prepareBlock;
let commitBlock;

//Building up the  Stage
//init walletList, validators, transactionPool
init();
//Propose
propose();
//Prepare
prepare();

//Commit Stage
commit();
//Notify
//notify();

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
      block = blockchain.createBlock(
        transactionPool.transactions,
        wallet
      )
    }
}

async function propose(){
  //create block and broadcast it
  if (
      !blockPool.exisitingBlock(block) && // check if block exists in blockPool
      blockchain.isValidBlock(block)     // Check if valid
    ){
      //add to the block pool
      console.log("Adding block to pool")
      blockPool.addBlock(block)

      //Create a prepare block and broadcast to other nodes
      prepareBlock = preparePool.prepare(block, wallet);
      console.log("Creating preparePool block")
      //Broadcast and get response
      await sleep(delta)
    }
}


async function prepare() {
  //Check if wallet is a validator
  //Check the prepare message if it's valid
  
  if (
      preparePool.isValidPrepare(prepareBlock, wallet) &&
      validators.isValidValidator(wallet.publicKey)
    ) {      
      preparePool.addPrepare(prepareBlock);
      sleep()
      for(let i=0;i<=MIN_APPROVALS+1; i++){
        preparePool.addPrepare(prepareBlock);
      }
      console.log("123")
      if (preparePool.list[prepareBlock.blockHash].length >= MIN_APPROVALS){
        console.log("preparePool meets minimum approvals")
        //move on to commit step
        commitBlock = commitPool.commit(prepareBlock, wallet)
        //broadcast commit message and get response
        await sleep(delta)
        await sleep(delta)
        return prepareBlock;
      }
    }
}
function commit(){
  //Check if validCommit
  //Check if the wallet is a validator
   if (
      !commitPool.existingCommit(block) &&
      commitPool.isValidCommit(block) &&
      validators.isValidValidator(block.publicKey)
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
      commitPool.list[block.blockHash].length >=
      MIN_APPROVALS
    ) {
      console.log("ADDING BLOCK TO BLOCKCHAIN")
      blockchain.addUpdatedBlock(
        data.commit.blockHash,
        blockPool,
        preparePool,
        commitPool
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

function sleep(ms) {
  console.log("Sleeping")
  return new Promise((resolve) => {
    console.log("Waking up")
    setTimeout(resolve, ms);
  });
  
}

function randomMember() {
  return Math.floor(Math.random() * NUMBER_OF_NODES);
}
