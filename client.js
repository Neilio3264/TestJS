const fs = require('fs')
const { resolve } = require('path')
const path = require('path')
const vorpal = require('vorpal')()
const got = require('got')
const crypto = require('shardus-crypto-utils')
const stringify = require('fast-stable-stringify')
const axios = require('axios')
crypto('64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347')

let HOST = 'localhost'

const walletFile = resolve('./wallet.json')
let walletEntries = {}

const baseDir = '.'

try {
  walletEntries = require(walletFile)
} catch (e) {
  saveEntries(walletEntries, walletFile)
  console.log(`Created wallet file '${walletFile}'.`)
}

async function getSeedNodes () {
  const res = await axios.get(`http://${HOST}:4000/api/seednodes`)
  const { seedNodes } = res.data
  return seedNodes
}

function saveEntries (entries, file) {
  const stringifiedEntries = JSON.stringify(entries, null, 2)
  fs.writeFileSync(file, stringifiedEntries)
}

function createAccount (keys = crypto.generateKeypair()) {
  return {
    address: keys.publicKey,
    keys
  }
}

function createAccounts (num) {
  const accounts = new Array(num).fill().map(account => createAccount())
  return accounts
}

// Creates an account with a keypair and adds it to the clients walletFile
function createEntry (name, id) {
  const account = createAccount()
  if (typeof id === 'undefined' || id === null) {
    id = crypto.hash(name)
  }
  account.id = id
  walletEntries[name] = account
  saveEntries(walletEntries, walletFile)
  return account.keys.publicKey
}

console.log(`Loaded wallet entries from '${walletFile}'.`)

// let LOCAL_ADDRESS = '198.58.101.124';
let host = process.argv[2] || 'localhost:9001'

function getInjectUrl () {
  return `http://${host}/inject`
}
function getAccountsUrl () {
  return `http://${host}/accounts`
}
function getAccountUrl (id) {
  return `http://${host}/account/${id}`
}

console.log(`Using ${host} as coin-app node for queries and transactions.`)

async function postJSON (url, obj) {
  const response = await got(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(obj)
  })
  return response.body
}

/**
 * interface tx {
 *   type: string
 *   from: string,
 *   to: string,
 *   amount: number,
 *   timestamp: number
 * }
 */

function makeTxGenerator (accounts, total = 0, type) {
  function * buildGenerator (txBuilder, accounts, total, type) {
    let account1, offset, account2
    let username
    let users = {}
    while (total > 0) {
      // Keep looping through all available accounts as the srcAcct
      account1 = accounts[total % accounts.length]
      // Pick some other random account as the tgtAcct
      offset = Math.floor(Math.random() * (accounts.length - 1)) + 1
      account2 = accounts[(total + offset) % accounts.length]

      // if (!users[account1.address]) {
      //   username = `user${account1.address.slice(0, 4)}`
      //   yield txBuilder({
      //     type: 'register',
      //     from: account1,
      //     handle: username,
      //     id: crypto.hash(username)
      //   })
      //   total--
      //   users[account1.address] = true
      // }

      // Return a create tx to add funds to the srcAcct
      yield txBuilder({ type: 'create', to: account1, amount: 1 })
      total--
      if (!(total > 0)) break

      // Return a transfer tx to transfer funds from srcAcct to tgtAcct
      switch (type) {
        case 'create': {
          yield txBuilder({ type: 'create', to: account1, amount: 1 })
          break
        }
        case 'transfer': {
          yield txBuilder({
            type: 'transfer',
            from: account1,
            to: account2,
            amount: 1
          })
          break
        }
        case 'friend': {
          yield txBuilder({
            type: 'friend',
            from: account1,
            to: account2,
            amount: 1
          })
          break
        }
        case 'message': {
          const message = stringify({
            body: 'spam1234',
            timestamp: Date.now(),
            handle: account1.address.slice(0, 5)
          })
          yield txBuilder({
            type: 'message',
            from: account1,
            to: account2,
            message: message,
            amount: 1
          })
          break
        }
        case 'toll': {
          yield txBuilder({
            type: 'toll',
            from: account1,
            toll: Math.ceil(Math.random() * 1000),
            amount: 1
          })
          break
        }
        default: {
          console.log('Type must be `transfer`, `message`, or `toll`')
        }
      }
      total--
      if (!(total > 0)) break
    }
  }
  const generator = buildGenerator(buildTx, accounts, total, type)
  generator.length = total
  return generator
}

function buildTx ({ type, from = {}, to, handle, id, amount, message, toll }) {
  let actualTx
  switch (type) {
    case 'register': {
      actualTx = {
        type,
        srcAcc: from.address,
        handle,
        id,
        timestamp: Date.now()
      }
      break
    }
    case 'create': {
      actualTx = {
        type,
        srcAcc: '0'.repeat(64),
        tgtAcc: to.address,
        amount: Number(amount),
        timestamp: Date.now()
      }
      break
    }
    case 'transfer': {
      actualTx = {
        type,
        srcAcc: from.address,
        timestamp: Date.now(),
        tgtAcc: to.address,
        amount: Number(amount)
      }
      break
    }
    case 'friend': {
      actualTx = {
        type,
        srcAcc: from.address,
        tgtAcc: to.address,
        handle: `${to.address.slice(0, 5)}`,
        amount: Number(amount),
        timestamp: Date.now()
      }
      break
    }
    case 'message': {
      actualTx = {
        type,
        srcAcc: from.address,
        tgtAcc: to.address,
        message: message,
        amount: Number(amount),
        timestamp: Date.now()
      }
      break
    }
    case 'toll': {
      actualTx = {
        type,
        srcAcc: from.address,
        toll,
        amount: Number(amount),
        timestamp: Date.now()
      }
      break
    }
    default: {
      console.log('Type must be `transfer`, `message`, or `toll`')
    }
  }
  if (from.keys) {
    crypto.signObj(actualTx, from.keys.secretKey, from.keys.publicKey)
  } else {
    crypto.signObj(actualTx, to.keys.secretKey, to.keys.publicKey)
  }
  return actualTx
}

let loggedError = false

async function sendTx (tx, port = null, verbose = false) {
  if (!tx.sign) {
    tx = buildTx(tx)
  }
  if (verbose) {
    console.log(`Sending tx to ${port}...`)
    console.log(tx)
  }
  try {
    const { data } = await axios.post(`http://${HOST}:${port}/inject`, tx)
    if (verbose) console.log('Got response:', data)
    return data
  } catch (err) {
    if (!loggedError) console.log('Stopped spamming due to error')
  }
}

async function spamTxs ({
  txs,
  rate,
  ports = [],
  saveFile = null,
  verbose = false
}) {
  if (!Array.isArray(ports)) ports = [ports]

  console.log(
    `Spamming ${ports.length > 1 ? 'ports' : 'port'} ${ports.join()} with ${
      txs.length ? txs.length + ' ' : ''
    }txs at ${rate} TPS...`
  )

  const writeStream = saveFile
    ? fs.createWriteStream(path.join(baseDir, saveFile))
    : null

  const promises = []
  let port

  for (const tx of txs) {
    if (writeStream) writeStream.write(JSON.stringify(tx, null, 2) + '\n')
    port = ports[Math.floor(Math.random() * ports.length)]
    promises.push(sendTx(tx, port, verbose))
    await _sleep((1 / rate) * 1000)
  }
  if (writeStream) writeStream.end()
  console.log()

  await Promise.all(promises)
  console.log('Done spamming')

  if (writeStream) {
    await new Promise(resolve => writeStream.on('finish', resolve))
    console.log(`Wrote spammed txs to '${saveFile}'`)
  }
}

async function _sleep (ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function injectTx (tx) {
  try {
    const res = await postJSON(getInjectUrl(), tx)
    return res
  } catch (err) {
    return err.message
  }
}

async function getAccountData (id) {
  try {
    const res = await got(
      typeof id !== 'undefined' && id !== null
        ? getAccountUrl(id)
        : getAccountsUrl()
    )
    return res.body
  } catch (err) {
    return err.message
  }
}

async function getToll (friendId, yourId) {
  try {
    let res = await got(`http://${host}/account/${friendId}/${yourId}/toll`)
    let { toll } = JSON.parse(res.body)
    return toll
  } catch (err) {
    return err.message
  }
}

async function getAddress (handle) {
  if (handle.length === 64) return handle
  try {
    let res = await got(`http://${host}/address/${crypto.hash(handle)}`)
    const { address, error } = JSON.parse(res.body)
    if (error) {
      console.log(error)
    } else {
      return address
    }
  } catch (e) {
    console.log(e.message)
  }
}

async function pollMessages (to, from, timestamp) {
  try {
    const res = await got(`http://${host}/messages/${to}/${from}/${timestamp}`)
    const { messages } = JSON.parse(res.body)
    return messages
  } catch (err) {
    return err.message
  }
}

vorpal
  .command(
    'spam transactions <type> <accounts> <count> <tps> <ports>',
    'spams the network with <type> transactions <count> times, with <account> number of accounts, at <tps> transactions per second, using <ports> number of ports'
  )
  .action(async function (args, callback) {
    const accounts = createAccounts(args.accounts)
    const txs = makeTxGenerator(accounts, args.count, args.type)
    const seedNodes = await getSeedNodes()
    console.log('SEED_NODES:', seedNodes)
    const ports = seedNodes.map(url => url.port)
    // const ports = new Array(args.ports).fill().map((_, i) => 9001 + i)
    console.log(ports)
    await spamTxs({
      txs,
      rate: args.tps,
      ports: ports,
      saveFile: 'spam-test.json'
    })
    this.log('Done spamming...')
    callback()
  })

vorpal
  .command(
    'use <host>',
    'Uses the given <host> as the coin-app node for queries and transactions.'
  )
  .action(function (args, callback) {
    host = args.host
    this.log(`Set ${args.host} as coin-app node for transactions.`)
    callback()
  })

vorpal
  .command(
    'wallet create <name> [id]',
    'Creates a wallet with the given <name> and [id]. Makes [id] = hash(<name>) if [id] is not given.'
  )
  .action(function (args, callback) {
    if (
      typeof walletEntries[args.name] !== 'undefined' &&
      walletEntries[args.name] !== null
    ) {
      this.log(`Wallet named '${args.name}' already exists.`)
      callback()
    } else {
      const publicKey = createEntry(args.name, args.id)
      this.log(`Created wallet '${args.name}': '${publicKey}'.`)
      callback()
    }
  })

vorpal
  .command(
    'wallet list [name]',
    'Lists wallet for the given [name]. Otherwise, lists all wallets.'
  )
  .action(function (args, callback) {
    let wallet = walletEntries[args.name]
    if (typeof wallet !== 'undefined' && wallet !== null) {
      this.log(`${JSON.stringify(wallet, null, 2)}`)
    } else {
      this.log(`${JSON.stringify(walletEntries, null, 2)}`)
    }
    callback()
  })

vorpal
  .command(
    'tokens create <amount> <target>',
    'creates <amount> tokens for the <target> account'
  )
  .action(function (args, callback) {
    const target = walletEntries[args.target]
    const tx = {
      type: 'create',
      srcAcc: '0'.repeat(64),
      tgtAcc: target.address,
      timestamp: Date.now(),
      amount: args.amount
    }
    injectTx(tx).then(res => {
      console.log(res)
      callback()
    })
  })

vorpal
  .command(
    'tokens claim <target>',
    'claims the daily alloted tokens for your account'
  )
  .action(async function (args, callback) {
    const target = walletEntries[args.target]
    const tx = {
      type: 'claim_reward',
      srcAcc: '0'.repeat(64),
      tgtAcc: target.address,
      timestamp: Date.now()
    }
    crypto.signObj(tx, target.keys.secretKey, target.keys.publicKey)
    injectTx(tx).then(res => {
      console.log(res)
      callback()
    })
  })

vorpal
  .command(
    'tokens transfer <amount> <source> <target>',
    'transfers <amount> tokens from <source> account to <target> account'
  )
  .action(async function (args, callback) {
    const source = walletEntries[args.source]
    const targetAddress = await getAddress(args.target)
    const tx = {
      type: 'transfer',
      srcAcc: source.address,
      tgtAcc: targetAddress,
      amount: args.amount,
      timestamp: Date.now()
    }
    crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
    injectTx(tx).then(res => {
      console.log(res)
      callback()
    })
  })

vorpal
  .command(
    'handle create <handle> <source>',
    'Creates a unique handle for the <source> account on the server'
  )
  .action((args, callback) => {
    const source = walletEntries[args.source]
    const tx = {
      type: 'register',
      id: crypto.hash(args.handle),
      handle: args.handle,
      srcAcc: source.address,
      timestamp: Date.now()
    }
    crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
    injectTx(tx).then(res => {
      console.log(res)
      callback()
    })
  })

vorpal
  .command(
    'friend add <target> <source>',
    'adds a friend <target> to account <source>'
  )
  .action(async function (args, callback) {
    const source = walletEntries[args.source]
    const targetAddress = await getAddress(args.target)
    if (targetAddress === undefined || targetAddress === null) {
      this.log("Target account doesn't exist for: ", args.target)
      callback()
    }
    const tx = {
      type: 'friend',
      handle: args.target,
      srcAcc: source.address,
      tgtAcc: targetAddress,
      amount: 1,
      timestamp: Date.now()
    }
    crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
    injectTx(tx).then(res => {
      this.log(res)
      callback()
    })
  })

vorpal
  .command(
    'friend remove <target> <source>',
    'removes a friend <target> from account <source>'
  )
  .action(async function (args, callback) {
    const source = walletEntries[args.source]
    const targetAddress = await getAddress(args.target)
    if (targetAddress === undefined || targetAddress === null) {
      this.log("Target account doesn't exist for: ", args.target)
      callback()
    }
    const tx = {
      type: 'remove_friend',
      srcAcc: source.address,
      tgtAcc: targetAddress,
      timestamp: Date.now()
    }
    crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
    injectTx(tx).then(res => {
      this.log(res)
      callback()
    })
  })

vorpal
  .command(
    'toll set <source> <toll>',
    'sets the <toll> people must pay in tokens to send messages to the <source> account'
  )
  .action(function (args, callback) {
    const source = walletEntries[args.source]
    const tx = {
      type: 'toll',
      srcAcc: source.address,
      toll: args.toll,
      amount: 1,
      timestamp: Date.now()
    }
    crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
    injectTx(tx).then(res => {
      this.log(res)
      callback()
    })
  })

vorpal
  .command(
    'message broadcast <message> <source> [recipients...]',
    'broadcasts a <message> from <source> to all the [recipients...]'
  )
  .action(async function (args, callback) {
    const source = walletEntries[args.source]
    let targetAccs = []
    let messages = []
    let requiredAmount = 0
    for (let i = 0; i < args.recipients.length; i++) {
      console.log('RECIP: ', args.recipients[i])
      let tgtAddress = await getAddress(args.recipients[i])
      targetAccs.push(tgtAddress)
      let message = stringify({
        body: args.message,
        timestamp: Date.now(),
        handle: args.source
      })
      let encryptedMsg = crypto.encrypt(
        message,
        crypto.convertSkToCurve(source.keys.secretKey),
        crypto.convertPkToCurve(tgtAddress)
      )
      messages.push(encryptedMsg)
      requiredAmount += await getToll(tgtAddress, source.address)
    }
    this.log(requiredAmount)
    const tx = {
      type: 'broadcast',
      messages: messages,
      srcAcc: source.address,
      tgtAccs: targetAccs,
      amount: requiredAmount,
      timestamp: Date.now()
    }
    crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
    injectTx(tx).then(res => {
      this.log(res)
      callback()
    })
  })

vorpal
  .command(
    'message send <message> <source> <target>',
    'sends a private message from <source> to <target> that only <target> can decrypt'
  )
  .action(async function (args, callback) {
    const source = walletEntries[args.source]
    const targetAddress = await getAddress(args.target)
    if (targetAddress === undefined || targetAddress === null) {
      this.log("Target account doesn't exist for: ", args.target)
      callback()
    }
    const message = stringify({
      body: args.message,
      timestamp: Date.now(),
      handle: args.source
    })
    // const encryptedMsg = crypto.encrypt(
    //   message,
    //   crypto.convertSkToCurve(source.keys.secretKey),
    //   crypto.convertPkToCurve(targetAddress)
    // );
    getToll(targetAddress, source.address).then(toll => {
      const tx = {
        type: 'message',
        srcAcc: source.address,
        tgtAcc: targetAddress,
        message: message,
        amount: parseInt(toll),
        timestamp: Date.now()
      }
      crypto.signObj(tx, source.keys.secretKey, source.keys.publicKey)
      injectTx(tx).then(res => {
        this.log(res)
        callback()
      })
    })
  })

vorpal
  .command(
    'message poll <source> <target> <timestamp>',
    'polls data for messages between <source> and <target> after specified timestamp'
  )
  .action(async function (args, callback) {
    const source = walletEntries[args.source]
    const targetAddress = await getAddress(args.target)
    pollMessages(source.address, targetAddress, args.timestamp).then(
      messages => {
        messages = messages.map(message => {
          message = crypto.decrypt(
            message,
            crypto.convertSkToCurve(source.keys.secretKey),
            crypto.convertPkToCurve(targetAddress)
          ).message
          return JSON.parse(message)
        })
        this.log(messages)
      }
    )
    callback()
  })

vorpal
  .command(
    'query [account]',
    'Queries network data for the account associated with the given [wallet]. Otherwise, gets all network data.'
  )
  .action(async function (args, callback) {
    let address
    if (args.account !== undefined) address = await getAddress(args.account)
    this.log(
      `Querying network for ${
        address ? `'${args.account}' wallet data` : 'all data'
      }:`
    )
    getAccountData(address).then(res => {
      try {
        const parsed = JSON.parse(res)
        res = JSON.stringify(parsed, null, 2)
      } catch (err) {
        this.log('Response is not a JSON object')
      } finally {
        this.log(res)
        callback()
      }
    })
  })

vorpal.delimiter('client$').show()
