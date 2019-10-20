import axios from "axios";
import stringify from "fast-stable-stringify";
import crypto from "shardus-crypto-web";

let IP = "localhost";
let PORT = 9001;

let host = process.argv[2] || `${IP}:${PORT}`;

let wallet = JSON.parse(localStorage.getItem("wallet"));

(async () => {
  await crypto.initialize(
    "64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347"
  );
  crypto.hash("Hello World");
})();

export function createWallet() {
  localStorage.setItem("wallet", JSON.stringify(crypto.generateKeypair()));
  wallet = JSON.parse(localStorage.getItem("wallet"));
  return { wallet };
}

export function importWallet(sk) {
  wallet = {
    publicKey: sk.slice(64),
    secretKey: sk
  };
  localStorage.setItem("wallet", JSON.stringify(wallet));
  return wallet.publicKey;
}

export function setIP(ip) {
  IP = ip;
  host = `${IP}:${PORT}`;
}

export function setPort(port) {
  PORT = port;
  host = `${IP}:${PORT}`;
}

// GET request for address
export async function getAddress(tgt) {
  if (tgt.length === 64) return tgt;
  await crypto.initialize(
    "64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347"
  );
  try {
    let res = await axios.get(`http://${host}/address/${crypto.hash(tgt)}`);
    const { address, error } = res.data;
    if (error) {
      console.log(error);
    } else {
      return address;
    }
  } catch (e) {
    console.log(e.message);
  }
}

// GET request for toll
export async function getToll(tgt) {
  const targetAddress = await getAddress(tgt);
  try {
    let res = await axios.get(
      `http://${host}/account/${targetAddress}/${wallet.publicKey}/toll`
    );
    let { toll } = res.data;
    return toll;
  } catch (err) {
    return err.message;
  }
}

export async function getAccountToll() {
  const res = await axios.get(
    `http://${host}/account/${wallet.publicKey}/toll`
  );
  const { toll } = res.data;
  return toll;
}

export async function getFriends() {
  try {
    const res = await axios.get(
      `http://${host}/account/${wallet.publicKey}/friends`
    );
    const { friends } = res.data;
    return friends;
  } catch (err) {
    console.log(err.message);
  }
}

// POST request for injecting transactions
async function injectTx(tx) {
  try {
    const res = await axios.post(`http://${host}/inject`, tx);
    return res;
  } catch (err) {
    return err.message;
  }
}

export async function pollMessages(source, target) {
  try {
    const res = await axios.get(`http://${host}/messages/${source}/${target}`);
    const { messages } = res.data;
    return messages;
  } catch (err) {
    return err.message;
  }
}

// Create Tokens Function
export function createTokens(amount) {
  const tx = {
    type: "create",
    srcAcc: "0".repeat(64),
    tgtAcc: wallet.publicKey,
    timestamp: Date.now(),
    amount: amount
  };
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

// Transfer Token Function
export async function transferTokens(tgt, amount) {
  const targetAddress = await getAddress(tgt);
  const tx = {
    type: "transfer",
    srcAcc: wallet.publicKey,
    tgtAcc: targetAddress,
    amount: amount,
    timestamp: Date.now()
  };
  crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

// Register Handle Function
export function registerHandle(handle) {
  const tx = {
    type: "register",
    id: crypto.hash(handle),
    handle: handle,
    srcAcc: wallet.publicKey,
    timestamp: Date.now()
  };
  crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

// Add Friend Function
export async function addFriend(tgt) {
  const targetAddress = await getAddress(tgt);
  if (targetAddress === undefined || targetAddress === null) {
    // console.log("Target account doesn't exist for: ", tgt);
    return;
  }
  const tx = {
    type: "friend",
    handle: tgt,
    srcAcc: wallet.publicKey,
    tgtAcc: targetAddress,
    amount: 1,
    timestamp: Date.now()
  };
  crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

export async function removeFriend(tgt) {
  const targetAddress = await getAddress(tgt);
  if (targetAddress === undefined || targetAddress === null) {
    // console.log("Target account doesn't exist for: ", tgt);
    return;
  }
  const tx = {
    type: "remove_friend",
    srcAcc: wallet.publicKey,
    tgtAcc: targetAddress,
    timestamp: Date.now()
  };
  crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

// Set Toll Function
export function setToll(toll) {
  const tx = {
    type: "toll",
    srcAcc: wallet.publicKey,
    toll: toll,
    amount: 1,
    timestamp: Date.now()
  };
  crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

// Send Message Function
export async function sendMessage(tgt, text) {
  const targetAddress = await getAddress(tgt);
  const handle = await getHandle(wallet.publicKey);
  if (targetAddress === undefined || targetAddress === null) {
    // console.log("Target account doesn't exist for: ", tgt);
  }
  const message = stringify({
    body: text,
    timestamp: Date.now(),
    handle: handle
  });
  // const encryptedMsg = crypto.encrypt(
  //   message,
  //   crypto.convertSkToCurve(wallet.secretKey),
  //   crypto.convertPkToCurve(targetAddress)
  // );
  getToll(tgt).then(toll => {
    const tx = {
      type: "message",
      srcAcc: wallet.publicKey,
      tgtAcc: targetAddress,
      message: message,
      amount: toll,
      timestamp: Date.now()
    };
    crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
    injectTx(tx).then(res => {
      // console.log(res);
    });
  });
}

export async function claimTokens() {
  const tx = {
    type: "claim_reward",
    srcAcc: "0".repeat(64),
    tgtAcc: wallet.publicKey,
    timestamp: Date.now()
  };
  crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

// Send Broadcast Function
export async function sendBroadcast(handle, recipients, text) {
  let targetAccs = [];
  let messages = [];
  let requiredAmount = 0;
  for (let i = 0; i < recipients.length; i++) {
    let tgtAddress = await getAddress(recipients[i]);
    targetAccs.push(tgtAddress);
    let message = stringify({
      body: text,
      timestamp: Date.now(),
      handle: handle
    });
    let encryptedMsg = crypto.encrypt(
      message,
      crypto.convertSkToCurve(wallet.secretKey),
      crypto.convertPkToCurve(tgtAddress)
    );
    messages.push(encryptedMsg);
    requiredAmount += await getToll(tgtAddress, wallet.publicKey);
  }
  const tx = {
    type: "broadcast",
    messages: messages,
    srcAcc: wallet.publicKey,
    tgtAccs: targetAccs,
    amount: requiredAmount,
    timestamp: Date.now()
  };
  crypto.signObj(tx, wallet.secretKey, wallet.publicKey);
  injectTx(tx).then(res => {
    // console.log(res);
  });
}

// Poll Messages function
export async function getMessages(tgt) {
  const targetAddress = await getAddress(tgt);
  let messageRes;
  pollMessages(wallet.publicKey, targetAddress).then(messages => {
    // messages = messages.map(message => {
    //   message = crypto.decrypt(
    //     message,
    //     crypto.convertSkToCurve(wallet.secretKey),
    //     crypto.convertPkToCurve(targetAddress)
    //   ).message;
    //   return JSON.parse(message);
    // });
    messageRes = messages;
  });
  return messageRes;
}

export async function getAccount(id) {
  const res = await axios.get(`http://${host}/account/${id}`);
  const { account } = res.data;
  return account;
}

export async function getHandle() {
  if (wallet) {
    const res = await axios.get(
      `http://${host}/account/${wallet.publicKey}/handle`
    );
    const { handle } = res.data;
    return handle;
  }
}

export async function getTransactions(id) {
  const res = await axios.get(`http://${host}/account/${id}/transactions`);
  const { transactions } = res.data;
  return transactions;
}

export async function getRecentMessages(id) {
  const res = await axios.get(`http://${host}/account/${id}/recentMessages`);
  let { messages } = res.data;
  return messages.map(message => JSON.parse(message));
}

export async function getChatHistory(target) {
  const targetAddress = await getAddress(target);
  const res = await axios.get(
    `http://${host}/messages/${wallet.publicKey}/${targetAddress}`
  );
  let { messages } = res.data;
  if (messages) return messages.map(message => JSON.parse(message))
  else return []
}

export async function getBalance() {
  const res = await axios.get(
    `http://${host}/account/${wallet.publicKey}/balance`
  );
  const { balance } = res.data;
  return balance;
}

export async function getClaimReward() {
  const res = await axios.get(
    `http://${host}/account/${wallet.publicKey}/claim`
  );
  const { claim } = res.data;
  return claim;
}
