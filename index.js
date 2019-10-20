const fs = require('fs')
const { resolve } = require('path')
const path = require('path')
const shardus = require('shardus-global-server')
const crypto = require('shardus-crypto-utils')
const stringify = require('fast-stable-stringify')
const { set } = require('dot-prop')
crypto('64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347')

// const configFile = resolve('../account.json')

// const payAcc = require(configFile).payAcc

/**
 * @typedef {import('shardus-enterprise-server/src/shardus')} Shardus
 */
/**
 * @typedef {import('shardus-enterprise-server/src/shardus').App} App
 */
/**
 * @typedef {import('shardus-enterprise-server/src/shardus').IncomingTransaction} IncomingTransaction
 */
/**
 * @typedef {import('shardus-enterprise-server/src/shardus').IncomingTransactionResult} IncomingTransactionResult
 */

/**
 * @implements {App}
 */

let config = {}

if (process.env.BASE_DIR) {
  if (fs.existsSync(path.join(process.env.BASE_DIR, 'config.json'))) {
    config = JSON.parse(
      fs.readFileSync(path.join(process.env.BASE_DIR, 'config.json'))
    )
  }
  config.server.baseDir = process.env.BASE_DIR
}

if (config.server) {
  config.server.transactionExpireTime = 10
} else {
  set(config, 'server', {
    transactionExpireTime: 10
  })
}

set(config, 'server.p2p', {
  cycleDuration: 15,
  seedList: 'http://127.0.0.1:4000/api/seednodes',
  maxNodesPerCycle: 20,
  minNodes: 60,
  maxNodes: 80,
  maxNodesToRotate: 1,
  maxPercentOfDelta: 40
})
set(config, 'server.loadDetection', {
  queueLimit: 1000,
  desiredTxTime: 5,
  highThreshold: 0.8,
  lowThreshold: 0.2
})
set(config, 'server.reporting', {
  interval: 1
})
set(config, 'server.rateLimiting', {
  limitRate: false,
  loadLimit: 0.1
})
set(config, 'server.sharding', {
  nodesPerConsensusGroup: 5
})
set(config, 'logs', {
  dir: './logs',
  files: { main: '', fatal: '', net: '' },
  options: {
    appenders: {
      out: { type: 'file', maxLogSize: 10000000, backups: 10 },
      app: {
        type: 'file',
        maxLogSize: 10000000,
        backups: 10
      },
      errorFile: {
        type: 'file',
        maxLogSize: 10000000,
        backups: 10
      },
      errors: {
        type: 'logLevelFilter',
        level: 'ERROR',
        appender: 'errorFile'
      },
      main: {
        type: 'file',
        maxLogSize: 10000000,
        backups: 10
      },
      fatal: {
        type: 'file',
        maxLogSize: 10000000,
        backups: 10
      },
      net: {
        type: 'file',
        maxLogSize: 10000000,
        backups: 10
      },
      playback: {
        type: 'file',
        maxLogSize: 10000000,
        backups: 10
      }
    },
    categories: {
      default: { appenders: ['out'], level: 'fatal' },
      app: { appenders: ['app', 'errors'], level: 'TRACE' },
      main: { appenders: ['main', 'errors'], level: 'trace' },
      fatal: { appenders: ['fatal'], level: 'fatal' },
      net: { appenders: ['net'], level: 'fatal' },
      playback: { appenders: ['playback'], level: 'fatal' }
    }
  }
})

// Added the lines below for AWS Testing
if (process.env.APP_SEEDLIST) set(config, 'server.p2p.seedList', `http://${process.env.APP_SEEDLIST}:4000/api/seednodes`)
if (process.env.APP_MONITOR) set(config, 'server.reporting.recipient', `http://${process.env.APP_MONITOR}:3000/api`)
set(config, 'server.ip.externalIp', null)
set(config, 'server.ip.internalIp', null)
set(config, 'server.ip.externalPort', 9001)
set(config, 'server.ip.internalPort', 9005)
// Added the lines below for AWS Testing

const dapp = shardus(config)

/**
 * interface account {
 *   id: string,        // 32 byte hex string
 *   hash: string,      // 32 byte hex string
 *   timestamp: number, // ms since epoch
 *   data: {
 *      balance: 0,
 *      toll: 1,
 *      chats: {},
 *      friends: []
 *   }
 * }
 *
 * interface accounts {
 *   [id: string]: account
 * }
 */

// Every 60 seconds for test purposes
const NODE_REWARD_TIME = 180 // 86400 for 24H
const NODE_REWARD_AMOUNT = 10
const CLAIM_REWARD = 50
const CLAIM_REWARD_TIME = 120 * 1000

function selfReward () {
  try {
    const nodeId = dapp.getNodeId()
    const { address } = dapp.getNode(nodeId)
    const tgtAcc = /* payAcc || */ address
    const tx = {
      type: 'node_reward',
      timestamp: Date.now(),
      nodeId: nodeId,
      srcAcc: address,
      tgtAcc: tgtAcc,
      amount: NODE_REWARD_AMOUNT
    }
    dapp.put(tx)
  } catch (err) {
    console.log(err)
  }
}

let accounts = {}

// function setAccountData (accountsToAdd = []) {
//   for (const account of accountsToAdd) {
//     accounts[account.id] = account
//   }
// }

function createAccount (obj = {}) {
  const account = Object.assign(
    {
      timestamp: Date.now(),
      id: crypto.randomBytes(),
      data: {
        balance: 0,
        toll: 1,
        chats: {},
        friends: {},
        transactions: []
      }
    },
    obj
  )
  account.hash = crypto.hashObj(account)
  return account
}

function createAlias (obj = {}) {
  const alias = Object.assign(
    {
      timestamp: Date.now(),
      id: crypto.randomBytes()
    },
    obj
  )
  alias.hash = crypto.hashObj(alias)
  return alias
}

dapp.registerExternalPost('inject', async (req, res) => {
  const result = dapp.put(req.body)
  res.json({ result })
})

dapp.registerExternalGet('account/:id', async (req, res) => {
  const id = req.params['id']
  const account = await dapp.getLocalOrRemoteAccount(id)
  res.json({ account: account.data })
})

dapp.registerExternalGet('account/:id/handle', async (req, res) => {
  const id = req.params['id']
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account) {
    res.json({ handle: account.data.handle })
  } else {
    res.json({ error: 'No account with the given id' })
  }
})

dapp.registerExternalGet('account/:id/balance', async (req, res) => {
  const id = req.params['id']
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account) {
    res.json({ balance: account.data.data.balance })
  } else {
    res.json({ error: 'No account with the given id' })
  }
})

dapp.registerExternalGet('account/:id/claim', async (req, res) => {
  const id = req.params['id']
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account) {
    if (!account.data.lastClaim) {
      res.json({ claim: CLAIM_REWARD })
    } else {
      if (Date.now() - account.data.lastClaim < CLAIM_REWARD_TIME) {
        res.json({ claim: 0 })
      } else {
        res.json({
          claim:
            CLAIM_REWARD *
            Math.floor(
              (Date.now() - account.data.lastClaim) / CLAIM_REWARD_TIME
            )
        })
      }
    }
  }
})

dapp.registerExternalGet('account/:id/toll', async (req, res) => {
  const id = req.params['id']
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account) {
    res.json({ toll: account.data.data.toll })
  } else {
    res.json({ error: 'No account with the given id' })
  }
})

dapp.registerExternalGet('address/:name', async (req, res) => {
  const name = req.params['name']
  const account = await dapp.getLocalOrRemoteAccount(name)
  const address = account && account.data.address
  if (address) {
    res.json({ address })
  } else {
    res.json({ error: 'No account exists for the given handle' })
  }
})

dapp.registerExternalGet('account/:id/:friendId/toll', async (req, res) => {
  const id = req.params['id']
  const friendId = req.params['friendId']
  if (!friendId) {
    res.json({ error: 'No provided friendId' })
  }
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account && account.data.data.friends[friendId]) {
    res.json({ toll: 1 })
  } else if (account) {
    res.json({ toll: account.data.data.toll })
  } else {
    res.json({ error: 'No account found with the given id' })
  }
})

dapp.registerExternalGet('account/:id/friends', async (req, res) => {
  const id = req.params['id']
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account) {
    res.json({ friends: account.data.data.friends })
  } else {
    res.json({ error: 'No account for given id' })
  }
})

dapp.registerExternalGet('account/:id/transactions', async (req, res) => {
  const id = req.params['id']
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account) {
    res.json({ transactions: account.data.data.transactions })
  } else {
    res.json({ error: 'No account for given id' })
  }
})

dapp.registerExternalGet('account/:id/recentMessages', async (req, res) => {
  const id = req.params['id']
  let messages = []
  const account = await dapp.getLocalOrRemoteAccount(id)
  if (account) {
    Object.values(account.data.data.chats).forEach(chat => {
      messages.push(...chat.messages)
    })
    res.json({ messages: messages })
  } else {
    res.json({ error: 'No account for given id' })
  }
})

dapp.registerExternalGet('accounts', async (req, res) => {
  res.json({ accounts })
})

dapp.registerExternalGet('messages/:accountId/:chatId', async (req, res) => {
  const { accountId, chatId } = req.params
  const account = await dapp.getLocalOrRemoteAccount(accountId)
  if (!account) {
    res.json({ error: "Account doesn't exist" })
    res.end()
    return
  }
  if (!account.data.data.chats[chatId]) {
    res.json({ error: 'no chat history for this request' })
    res.end()
  } else {
    let messages = [...account.data.data.chats[chatId].messages]
    res.json({ messages })
  }
})

dapp.setup({
  validateTransaction (tx, wrappedStates) {
    const response = {
      result: 'fail',
      reason: 'Transaction is not valid.'
    }

    let srcAddress = tx.srcAcc
    let tgtAddress = tx.tgtAcc
    // let tgtAddresses = tx.tgtAccs
    let amount = tx.amount
    let toll = tx.toll
    let type = tx.type
    let sign = tx.sign

    let alias = wrappedStates[tx.id] && wrappedStates[tx.id].data
    let source = wrappedStates[srcAddress] && wrappedStates[srcAddress].data
    let target = wrappedStates[tgtAddress] && wrappedStates[tgtAddress].data

    switch (type) {
      case 'register': {
        if (sign.owner !== srcAddress) {
          response.reason = 'not signed by source account'
          return response
        }
        if (crypto.verifyObj(tx) === false) {
          response.reason = 'incorrect signing'
          return response
        }
        if (alias.inbox === tx.handle) {
          response.reason = 'This handle is already taken'
          return response
        }
        if (tx.handle && tx.handle.length >= 17) {
          response.reason = 'Handle must be less than 17 characters'
          return response
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      case 'create': {
        if (target === undefined || target === null) {
          response.reason = "target account doesn't exist"
          return response
        }
        if (amount < 1) {
          response.reason = 'create amount needs to be positive'
          return response
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      case 'transfer': {
        if (sign.owner !== srcAddress) {
          response.reason = 'not signed by source account'
          return response
        }
        if (crypto.verifyObj(tx) === false) {
          response.reason = 'incorrect signing'
          return response
        }
        if (source === undefined || source === null) {
          response.reason = "source account doesn't exist"
          return response
        }
        if (target === undefined || target === null) {
          response.reason = "target account doesn't exist"
          return response
        }
        if (source.data.balance < amount) {
          response.reason = "source account doesn't have sufficient balance to cover the transaction"
          return response
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      case 'message': {
        if (sign.owner !== srcAddress) {
          response.reason = 'not signed by source account'
          return response
        }
        if (crypto.verifyObj(tx) === false) {
          response.reason = 'incorrect signing'
          return response
        }
        if (typeof source === 'undefined' || source === null) {
          response.reason = '"source" account does not exist.'
          return response
        }
        if (typeof target === 'undefined' || target === null) {
          response.reason = '"target" account does not exist.'
          return response
        }
        if (tx.amount < 1) {
          response.reason = 'Must send at least 1 token with the message transaction'
          return response
        }
        if (target.data.friends[srcAddress]) {
          if (source.data.balance < 1) {
            response.reason = 'Source account does not have sufficient funds.'
            return response
          }
        } else {
          if (source.data.balance < amount || source.data.balance < target.data.toll) {
            response.reason = 'Source account does not have sufficient funds.'
            return response
          }
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      // case 'broadcast': {
      //   if (sign.owner !== srcAddress) {
      //     response.reason = 'not signed by source account'
      //     return response
      //   }
      //   if (crypto.verifyObj(tx) === false) {
      //     response.reason = 'incorrect signing'
      //     return response
      //   }
      //   if (typeof source === 'undefined' || source === null) {
      //     response.reason = '"source" account does not exist.'
      //     return response
      //   }
      //   let requiredAmount = 0
      //   tgtAddresses.forEach(address => {
      //     let target = accounts[address]
      //     if (typeof target === 'undefined' || target === null) {
      //       response.reason = 'target ' + address + " doesn't have an account"
      //       return response
      //     }
      //     if (target.data.friends[srcAddress]) {
      //       requiredAmount += 1
      //     } else {
      //       requiredAmount += target.data.toll
      //     }
      //   })
      //   if (amount < requiredAmount) {
      //     response.reason =
      //       'Not enough tokens sent to cover the cost of the broadcast'
      //     return response
      //   }
      //   response.result = 'pass'
      //   response.reason = 'This transaction is valid!'
      //   return response
      // }
      case 'toll': {
        if (sign.owner !== srcAddress) {
          response.reason = 'not signed by source account'
          return response
        }
        if (crypto.verifyObj(tx) === false) {
          response.reason = 'incorrect signing'
          return response
        }
        if (!source) {
          response.reason = 'Source account does not exist'
          return response
        }
        if (source.data.balance < 1) {
          response.reason = 'Source account does not have sufficient funds.'
          return response
        }
        if (amount < 1) {
          response.reason = 'Must burn 1 token in order to set a toll'
          return response
        }
        if (typeof toll === 'undefined' || toll === null) {
          response.reason = 'Toll was not defined in the transaction'
          return response
        }
        if (toll < 1) {
          response.reason = 'Toll must be greater than or equal to 1'
          return response
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      case 'friend': {
        if (typeof source === 'undefined' || source === null) {
          response.reason = 'Source account does not exist'
          return response
        }
        if (sign.owner !== srcAddress) {
          response.reason = 'not signed by source account'
          return response
        }
        if (crypto.verifyObj(tx) === false) {
          response.reason = 'incorrect signing'
          return response
        }
        if (source.data.balance < amount || amount < 1) {
          response.reason = "Not enough tokens to cover transaction, or didn't send 1 token with the transaction"
          return response
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      case 'remove_friend': {
        if (typeof source === 'undefined' || source === null) {
          response.reason = 'Source account does not exist'
          return response
        }
        if (sign.owner !== srcAddress) {
          response.reason = 'not signed by source account'
          return response
        }
        if (crypto.verifyObj(tx) === false) {
          response.reason = 'incorrect signing'
          return response
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      case 'node_reward': {
        let nodeInfo
        try {
          nodeInfo = dapp.getNode(tx.nodeId)
        } catch (err) {
          console.log(err)
        }
        if (!nodeInfo) {
          response.reason = 'no nodeInfo'
          return response
        }
        if (tx.timestamp - nodeInfo.activeTimestamp < NODE_REWARD_TIME * 1000) {
          response.reason = 'Too early for this node to get paid'
          return response
        }
        if (!source) {
          response.result = 'pass'
          response.reason = 'This transaction in valid'
          return response
        }
        if (source) {
          if (!source.nodeRewardTime) {
            response.result = 'pass'
            response.reason = 'This transaction in valid'
            return response
          }
          if (tx.timestamp - source.nodeRewardTime < NODE_REWARD_TIME * 1000) {
            response.reason = 'Too early for this node to get paid'
            return response
          }
        }
        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      case 'claim_reward': {
        if (target === undefined || target === null) {
          response.reason = "source account doesn't exist"
          return response
        }
        if (sign.owner !== tgtAddress) {
          response.reason = 'not signed by source account'
          return response
        }
        if (crypto.verifyObj(tx) === false) {
          response.reason = 'incorrect signing'
          return response
        }
        if (target.lastClaim) {
          if (tx.timestamp - target.lastClaim < CLAIM_REWARD_TIME) {
            response.reason = 'Too early to claim coins for this account'
            return response
          }
        }

        response.result = 'pass'
        response.reason = 'This transaction is valid!'
        return response
      }
      default:
        response.reason = 'type must be "register", "message", "friend", "toll", or "node_reward"'
        return response
    }
  },
  validateTxnFields (tx) {
    // Validate tx fields here
    let result = 'pass'
    let reason = ''

    let txnTimestamp = tx.timestamp
    let srcAddress = tx.srcAcc
    let tgtAddress = tx.tgtAcc
    let amount = tx.amount
    let type = tx.type
    // let sign = tx.sign

    if (typeof type !== 'string') {
      result = 'fail'
      reason = '"type" must be a string.'
      throw new Error(reason)
    }
    if (!srcAddress || typeof srcAddress !== 'string') {
      result = 'fail'
      reason = '"srcAddress" must be a string.'
      throw new Error(reason)
    }
    switch (tx.type) {
      case 'message': {
        if (!tgtAddress) {
          result = 'fail'
          reason = '"tgtAddress" does not exist'
          throw new Error(reason)
        }
        if (typeof tgtAddress !== 'string') {
          result = 'fail'
          reason = '"tgtAddress" is not a string'
          throw new Error(reason)
        }
        break
      }
      case 'broadcast': {
        if (tx.tgtAccs && !tx.tgtAccs.every(account => typeof account === 'string')) {
          result = 'fail'
          reason = 'One of the "tgtAccs" is not a string'
          throw new Error(reason)
        }
        break
      }
    }
    if (amount && typeof amount !== 'number') {
      result = 'fail'
      reason = '"amount" must be a number.'
      throw new Error(reason)
    }
    if (typeof txnTimestamp !== 'number') {
      result = 'fail'
      reason = '"timestamp" must be a number.'
      throw new Error(reason)
    }

    return {
      result,
      reason,
      txnTimestamp
    }
  },
  apply (tx, wrappedStates) {
    let alias = wrappedStates[tx.id] && wrappedStates[tx.id].data
    let source = wrappedStates[tx.srcAcc] && wrappedStates[tx.srcAcc].data
    let target = wrappedStates[tx.tgtAcc] && wrappedStates[tx.tgtAcc].data

    // Validate the tx
    const { result, reason } = this.validateTransaction(tx, wrappedStates)
    if (result !== 'pass') {
      throw new Error(
        `invalid transaction, reason: ${reason}. tx: ${stringify(tx)}`
      )
    }

    let type = tx.type
    let timestamp = tx.timestamp
    let srcAddress = tx.srcAcc
    let tgtAddress = tx.tgtAcc
    // let tgtAddresses = tx.tgtAccs
    let message = tx.message
    let amount = tx.amount
    let handle = tx.handle
    let toll = tx.toll
    // let sign = tx.sign

    // Create an applyResponse which will be used to tell Shardus that the tx has been applied
    const txId = crypto.hashObj(tx) // compute from tx
    const applyResponse = dapp.createApplyResponse(txId, timestamp)

    // Apply the tx
    switch (type) {
      case 'register': {
        alias.inbox = handle
        source.handle = handle
        // source.data.transactions.push({ ...tx, txId })
        source.timestamp = timestamp
        // console.log("Applied register tx", txId, accounts[srcAddress]);
        break
      }
      case 'create': {
        target.data.balance += amount
        target.timestamp = timestamp
        // console.log("Applied target tx", accounts[tgtAddress]);
        break
      }
      case 'transfer': {
        source.data.balance -= amount
        target.data.balance += amount
        // source.data.transactions.push({ ...tx, txId });
        // target.data.transactions.push({ ...tx, txId });
        source.timestamp = timestamp
        target.timestamp = timestamp
        // console.log(
        //   "Applied transfer tx",
        //   accounts[srcAddress],
        //   accounts[tgtAddress]
        // );
        break
      }
      case 'message': {
        source.data.balance -= amount
        target.data.balance += amount

        if (!source.data.chats[tgtAddress]) {
          source.data.chats[tgtAddress] = { messages: [message] }
        } else source.data.chats[tgtAddress].messages.push(message)

        if (!target.data.chats[srcAddress]) {
          target.data.chats[srcAddress] = { messages: [message] }
        } else target.data.chats[srcAddress].messages.push(message)

        // source.data.transactions.push({ ...tx, txId })
        // target.data.transactions.push({ ...tx, txId })

        source.timestamp = timestamp
        target.timestamp = timestamp

        // console.log(
        //   "Applied message tx",
        //   txId,
        //   accounts[srcAddress],
        //   accounts[tgtAddress]
        // );
        break
      }
      // case "broadcast": {
      //   const recipients = tgtAddresses.map(
      //     tgtAddress => wrappedStates[tgtAddress].data
      //   );
      //   recipients.forEach((recipient, i) => {
      //     if (recipient.data.friends[srcAddress]) {
      //       source.data.balance -= 1;
      //       recipient.data.balance += 1;
      //       if (!source.data.chats[recipient.id])
      //         source.data.chats[recipient.id] = {
      //           messages: [tx.messages[i]]
      //         };
      //       else source.data.chats[recipient.id].messages.push(tx.messages[i]);

      //       if (!recipient.data.chats[srcAddress])
      //         recipient.data.chats[srcAddress] = {
      //           messages: [tx.messages[i]]
      //         };
      //       else recipient.data.chats[srcAddress].messages.push(tx.messages[i]);
      //       recipient.timestamp = timestamp;
      //     } else {
      //       source.data.balance -= recipient.data.toll;
      //       recipient.data.balance += recipient.data.toll;
      //       if (!source.data.chats[recipient.id])
      //         source.data.chats[recipient.id] = {
      //           messages: [tx.messages[i]]
      //         };
      //       else source.data.chats[recipient.id].messages.push(tx.messages[i]);

      //       if (!recipient.data.chats[srcAddress])
      //         recipient.data.chats[srcAddress] = {
      //           messages: [tx.messages[i]]
      //         };
      //       else recipient.data.chats[srcAddress].messages.push(tx.messages[i]);
      //       recipient.timestamp = timestamp;
      //     }
      //   });
      //   source.timestamp = timestamp;
      //   console.log("Applied broadcast tx", txId, accounts[srcAddress]);
      //   break;
      // }
      case 'toll': {
        source.data.balance -= amount
        source.data.toll = toll
        // source.data.transactions.push({ ...tx, txId })
        source.timestamp = timestamp
        // console.log("Applied toll tx", txId, accounts[srcAddress]);
        break
      }
      case 'friend': {
        source.data.balance -= amount
        source.data.friends[tgtAddress] = handle
        // source.data.transactions.push({ ...tx, txId })
        source.timestamp = timestamp
        // console.log("Applied friend tx", txId, accounts[srcAddress]);
        break
      }
      case 'remove_friend': {
        source.data.friends[tgtAddress] = null
        source.timestamp = timestamp
        // console.log("Applied remove_friend tx", txId, accounts[srcAddress]);
        break
      }
      case 'node_reward': {
        target.data.balance += amount
        source.nodeRewardTime = tx.timestamp
        // target.data.transactions.push({ ...tx, txId })
        source.timestamp = tx.timestamp
        target.timestamp = tx.timestamp
        console.log(
          'Applied node_reward tx',
          txId,
          accounts[srcAddress],
          accounts[tgtAddress]
        )
        break
      }
      case 'claim_reward': {
        if (target.lastClaim) {
          tx.amount = CLAIM_REWARD * Math.floor((tx.timestamp - target.lastClaim) / CLAIM_REWARD_TIME)
          target.data.balance += tx.amount
        } else {
          tx.amount = CLAIM_REWARD
          target.data.balance += CLAIM_REWARD
        }
        // target.data.transactions.push({ ...tx, txId });
        target.lastClaim = tx.timestamp
        target.timestamp = tx.timestamp
        // console.log("Applied claim_reward tx", txId, accounts[tgtAddress]);
        break
      }
    }
    return applyResponse
  },
  getKeyFromTransaction (tx) {
    const result = {
      sourceKeys: [],
      targetKeys: [],
      allKeys: [],
      timestamp: tx.timestamp
    }
    switch (tx.type) {
      case 'register':
        result.targetKeys = [tx.srcAcc, tx.id]
        break
      case 'create':
        result.targetKeys = [tx.tgtAcc]
        break
      case 'transfer':
        result.sourceKeys = [tx.srcAcc]
        result.targetKeys = [tx.tgtAcc]
        break
      case 'message':
        result.targetKeys = [tx.tgtAcc]
        result.sourceKeys = [tx.srcAcc]
        break
      // case "broadcast":
      //   result.targetKeys = tx.tgtAccs;
      //   result.sourceKeys = [tx.srcAcc];
      //   break;
      case 'toll':
        result.targetKeys = [tx.srcAcc]
        break
      case 'friend':
        result.targetKeys = [tx.srcAcc]
        break
      case 'remove_friend':
        result.targetKeys = [tx.srcAcc]
        break
      case 'node_reward':
        result.sourceKeys = [tx.srcAcc]
        result.targetKeys = [tx.tgtAcc]
        break
      case 'claim_reward':
        result.targetKeys = [tx.tgtAcc]
        break
    }
    result.allKeys = result.allKeys.concat(
      result.sourceKeys,
      result.targetKeys
    )
    return result
  },
  getStateId (accountAddress, mustExist = true) {
    const account = accounts[accountAddress]
    if ((typeof account === 'undefined' || account === null) && mustExist === true) {
      throw new Error('Could not get stateId for account ' + accountAddress)
    }
    const stateId = account.hash
    return stateId
  },
  deleteLocalAccountData () {
    accounts = {}
  },
  setAccountData (accountRecords) {
    console.log('setAccountData: ', accountRecords)
    for (let account of accountRecords) {
      // possibly need to clone this so others lose their ref
      accounts[account.id] = account
    }
  },
  getRelevantData (accountId, tx) {
    let account = accounts[accountId]
    let accountCreated = false
    // Create the account if it doesn't exist
    if (typeof account === 'undefined' || account === null) {
      if (tx.type === 'register') {
        if (accountId === tx.id) {
          account = createAlias({
            id: accountId,
            address: tx.srcAcc,
            timestamp: 0
          })
          accounts[accountId] = account
          accountCreated = true
        } else {
          account = createAccount({
            id: accountId,
            timestamp: 0
          })
          accounts[accountId] = account
          accountCreated = true
        }
      }
    }
    if (typeof account === 'undefined' || account === null) {
      account = createAccount({
        id: accountId,
        timestamp: 0
      })
      accounts[accountId] = account
      accountCreated = true
    }
    // Wrap it for Shardus
    const wrapped = dapp.createWrappedResponse(
      accountId,
      accountCreated,
      account.hash,
      account.timestamp,
      account
    )
    return wrapped
  },
  updateAccountFull (wrappedData, localCache, applyResponse) {
    const accountId = wrappedData.accountId
    const accountCreated = wrappedData.accountCreated
    const updatedAccount = wrappedData.data
    // Update hash
    const hashBefore = updatedAccount.hash
    updatedAccount.hash = ''
    const hashAfter = crypto.hashObj(updatedAccount)
    updatedAccount.hash = hashAfter
    // Save updatedAccount to db / persistent storage
    accounts[accountId] = updatedAccount
    // Add data to our required response object
    dapp.applyResponseAddState(
      applyResponse,
      updatedAccount,
      updatedAccount,
      accountId,
      applyResponse.txId,
      applyResponse.txTimestamp,
      hashBefore,
      hashAfter,
      accountCreated
    )
  },
  updateAccountPartial (wrappedData, localCache, applyResponse) {
    this.updateAccountFull(wrappedData, localCache, applyResponse)
  },
  getAccountDataByRange (accountStart, accountEnd, tsStart, tsEnd, maxRecords) {
    const results = []
    const start = parseInt(accountStart, 16)
    const end = parseInt(accountEnd, 16)
    // Loop all accounts
    for (const account of Object.values(accounts)) {
      // Skip if not in account id range
      const id = parseInt(account.id, 16)
      if (id < start || id > end) continue
      // Skip if not in timestamp range
      const timestamp = account.timestamp
      if (timestamp < tsStart || timestamp > tsEnd) continue
      // Add to results
      const wrapped = {
        accountId: account.id,
        stateId: account.hash,
        data: account,
        timestamp: account.timestamp
      }
      results.push(wrapped)
      // Return results early if maxRecords reached
      if (results.length >= maxRecords) {
        results.sort((a, b) => a.timestamp - b.timestamp)
        return results
      }
    }
    results.sort((a, b) => a.timestamp - b.timestamp)
    return results
  },
  getAccountData (accountStart, accountEnd, maxRecords) {
    const results = []
    const start = parseInt(accountStart, 16)
    const end = parseInt(accountEnd, 16)
    // Loop all accounts
    for (const account of Object.values(accounts)) {
      // Skip if not in account id range
      const id = parseInt(account.id, 16)
      if (id < start || id > end) continue

      // Add to results
      const wrapped = {
        accountId: account.id,
        stateId: account.hash,
        data: account,
        timestamp: account.timestamp
      }
      results.push(wrapped)
      // Return results early if maxRecords reached
      if (results.length >= maxRecords) {
        results.sort((a, b) => a.timestamp - b.timestamp)
        return results
      }
    }
    results.sort((a, b) => a.timestamp - b.timestamp)
    return results
  },
  getAccountDataByList (addressList) {
    const results = []
    for (const address of addressList) {
      const account = accounts[address]
      if (account) {
        const wrapped = {
          accountId: account.id,
          stateId: account.hash,
          data: account,
          timestamp: account.timestamp
        }
        results.push(wrapped)
      }
    }
    results.sort((a, b) => a.accountId < b.accountId)
    return results
  },
  calculateAccountHash (account) {
    account.hash = ''
    account.hash = crypto.hashObj(account)
    return account.hash
  },
  resetAccountData (accountBackupCopies) {
    for (let recordData of accountBackupCopies) {
      console.log('recordData: ', recordData)
      accounts[recordData.id] = recordData
    }
  },
  deleteAccountData (addressList) {
    for (const address of addressList) {
      delete accounts[address]
    }
  },
  getAccountDebugValue (wrappedAccount) {
    return `${stringify(wrappedAccount)}`
  },
  close () {
    console.log('Shutting down server...')
  }
})

dapp.registerExceptionHandler();

(async () => {
  await dapp.start()
  setTimeout(() => {
    setInterval(() => {
      selfReward()
    }, NODE_REWARD_TIME * 1000)
  }, 100000)
})()
