# Chat App Template

> The basic idea behind this chat app is to create a way for anyone
> to communicate with anyone, as long as they pay them a fixed price set by them.
> This should keep people from getting spammed, while allowing anyone in the world
> to send them a message if they really want to.

### Token economics

- Every message transaction requires at least 1 token to be sent to the recipient of the message.
- Users can send a toll transaction by burning 1 token, enabling them to set the minimum amount of tokens needed to send them a message.
- Users can send a friend transaction, to add a user to a friend group that only have to pay them 1 token to send them a message.

### Transaction types

- Message - sends a message to a user
- friend - adds a friend's accountId to a friends list
- Toll - Sets toll for messages sent by users that aren't in their friend group

## Implementation

> Create the account data model

```javascript
// index.js (Server)
function createAccount(obj = {}) {
  const account = Object.assign(
    {
      timestamp: Date.now(),
      id: crypto.randomBytes(),
      data: {
        balance: 0,
        toll: 1,
        chats: {},
        friends: []
      }
    },
    obj
  );
  account.hash = crypto.hashObj(account.data);
  return account;
}
```

> Validate the transaction types you wish to create within the validateTransaction function
> of dapp.setup by adding cases to the switch statement

```javascript
// index.js
// validateTransaction(tx)
case "message":
    let source = accounts[tx.from];
    if (typeof source === "undefined" || source === null) {
        response.reason = '"from" account does not exist.';
        return response;
    }
    if (tx.amount < 1) {
        response.reason = "Must send at least 1 token with the message transaction"
        return response
    }
    if (source.data.balance < tx.amount) {
        response.reason = '"from" account does not have sufficient funds.';
        return response;
    }
    response.result = "pass";
    response.reason = "This transaction is valid!";
    return response;
case "toll":
    response.result = "pass";
    response.reason = "This transaction is valid!";
    return response;
case "friend":
    response.result = "pass";
    response.reason = "This transaction is valid!";
    return response;
default:
    response.reason = '"type" must be "create" "transfer", "message", "friend", or "toll"';
    return response;
```

> Write your business logic in the apply function of dapp.setup, by adding more switch statements for the transaction types

```javascript
// index.js
// apply(tx, wrappedStates)
      case "message": {
        let amount;
        let from = wrappedStates[tx.from].data;
        if (typeof from === "undefined" || from === null) {
          throw new Error(
            `from account '${tx.to}' missing. tx: ${JSON.stringify(tx)}`
          );
        }
        let to = wrappedStates[tx.to].data;
        if (typeof to === "undefined" || to === null) {
          throw new Error(
            `to account '${tx.to}' missing. tx: ${JSON.stringify(tx)}`
          );
        }

        if (to.data.friends.includes(tx.from)) {
          amount = 1;
        } else {
          amount = tx.amount;
          if (amount < to.data.toll) {
            throw new Error(
              `from account '${
                tx.from
              }' does not have sufficient funds to send to account ${
                tx.to
              } a message. tx: ${JSON.stringify(tx)}`
            );
          }
        }

        from.data.balance -= amount;
        to.data.balance += amount;

        if (!from.data.chats[tx.to])
          from.data.chats[tx.to] = { sent: [tx.message], received: [] };
        else
          from.data.chats[tx.to].sent = [
            ...from.data.chats[tx.to].sent,
            tx.message
          ];
        if (!to.data.chats[tx.from])
          to.data.chats[tx.from] = { sent: [], received: [tx.message] };
        else
          to.data.chats[tx.from].received = [
            ...to.data.chats[tx.from].received,
            tx.message
          ];
        from.timestamp = txTimestamp;
        to.timestamp = txTimestamp;
        console.log(
          "DBG",
          "applied message tx",
          txId,
          accounts[tx.from],
          accounts[tx.to]
        );
        break;
      }
      case "toll": {
        // Get the from account
        let from = wrappedStates[tx.from].data;
        let to = wrappedStates[tx.to].data;
        if (typeof from === "undefined" || from === null) {
          throw new Error(
            `account '${tx.from}' missing. tx: ${JSON.stringify(tx)}`
          );
        }
        from.data.balance -= tx.amount;
        to.data.toll = tx.toll;
        // Update the to accounts timestamp
        from.timestamp = txTimestamp;
        to.timestamp = txTimestamp;
        console.log("DBG", "applied toll tx", txId, accounts[tx.to]);
        break;
      }
      case "friend": {
        let from = wrappedStates[tx.from].data;
        let to = wrappedStates[tx.to].data;
        from.data.balance -= tx.amount;
        from.data.friends = [...from.data.friends, tx.to];
        from.timestamp = txTimestamp;
        to.timestamp = txTimestamp;
        console.log("DBG", "applied friend tx", txId, accounts[tx.from]);
        break;
      }
```

> Finally, add cases to the switch statement within the getKeyFromTransaction function of dapp.setup

```javascript
// index.js
// getKeyFromTransaction(tx)
case "message":
    result.targetKeys = [tx.to];
    result.sourceKeys = [tx.from];
    break;
case "toll":
    result.targetKeys = [tx.to];
    result.sourceKeys = [tx.from];
    break;
case "friend":
    result.targetKeys = [tx.to];
    result.sourceKeys = [tx.from];
    break;
```

> Now it's time to write some functions on the client to interact with the network by sending it transactions
> Start by opening up client.js and creating vorpal commands to inject transactions

```javascript
vorpal
  .command("friend add <from> <to>", "adds a friend <to> to account <from>")
  .action(function(args, callback) {
    let fromId = walletEntries[args.from];
    let toId = walletEntries[args.to];
    injectTx({
      type: "friend",
      from: fromId,
      to: toId,
      amount: 1,
      timestamp: Date.now()
    }).then(res => {
      this.log(res);
      callback();
    });
  });

vorpal
  .command(
    "toll set <account> <toll>",
    "sets the <toll> people must pay to send messages to the <account>"
  )
  .action(function(args, callback) {
    let accountId = walletEntries[args.account];
    injectTx({
      type: "toll",
      from: accountId,
      to: accountId,
      amount: 1,
      toll: args.toll
    }).then(res => {
      this.log(res);
      callback();
    });
  });

vorpal
  .command(
    "message send <message> <from> <to>",
    "sends a <message> from <from> to <to>"
  )
  .action(async function(args, callback) {
    let fromId = walletEntries[args.from];
    if (typeof fromId === "undefined" || fromId === null) {
      this.log(`Wallet '${args.from}' does not exist.`);
      this.callback();
    }
    let toId = walletEntries[args.to];
    if (typeof toId === "undefined" || toId === null) {
      toId = createEntry(args.to);
      this.log(`Created wallet '${args.to}': '${toId}'.`);
    }
    getAccountData(toId).then(res => {
      let {
        account: {
          data: { toll }
        }
      } = JSON.parse(res);
      injectTx({
        type: "message",
        from: fromId,
        to: toId,
        message: {
          text: args.message,
          timestamp: Date.now()
        },
        amount: toll
      }).then(res => {
        this.log(res);
        callback();
      });
    });
  });
```

> Now you're ready to play around and start sending messages, setting tolls, and adding friends

### Next steps

> Create a user interface to interact with the network
