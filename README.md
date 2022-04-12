## Setting up a private network with multiple PCs using Go Ethereum (Geth)

> ### This blog explains how to set up a multiple nodes private blockchain network running on different computers.
> _This tutorial is meant for those with some knowledge of Ethereum and smart contracts, who have some knowledge of nodes, geth and POA, etc._
> The purpose of building this blog is to write down the detailed operation history and my memo for learning the dApps.
> If you are also interested and want to get hands dirty, just follow these steps below and have fun!~

### Prerequisites
- Two PCs (MacOS and LinuxOS are recommended)
- [Geth](https://geth.ethereum.org/docs/install-and-build/installing-geth) and [Node.js](https://nodejs.org/en/) installed


> In Command Line Interface (CLI) We mark the two computers as `pc1` and `pc2`. 

## Getting started

### Check IP address
We use this CLI command to know the ip address of **macOS** device **pc1**:
```linux
pc1$ ifconfig|grep netmask|awk '{print $2}'
```
Output:
`127.0.0.1
1X.1XX.2XX.35`

### Generate a new geth account
```linux
geth account new
```
output:
E.g. :
`Your new key was generated`
`Public address of the key:`   `0xXa79b38262Xf270d5A3141X4F326X76A9F37e9E4`
`Path of the secret key file:`
`......` 

### Initializing the Geth Database
Copy the following code and name it as **genesis.json**.
```json
{
    "config": {
      "chainId": 15,
      "homesteadBlock": 0,
      "eip150Block": 0,
      "eip155Block": 0,
      "eip158Block": 0,
      "byzantiumBlock": 0,
      "constantinopleBlock": 0,
      "petersburgBlock": 0,
      "ethash": {}
    },
    "difficulty": "1",
    "gasLimit": "8000000",
    "alloc": {}
  }
```
This is the code for creating genesis block.
To create a blockchain node using this, we navigate to the directory that created this file, and run the following command: 

> This imports and sets the canonical genesis block for your chain.
```linux
pc1$ geth init --datadir . genesis.json
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/njfir8ldzo7d39dnsgmb.png)

### Setting up networking
Once node is initialized to the desired genesis state, it is time to set up the peer-to-peer network. 

> Any node can be used as an entry point. I recommend dedicating a single node as the rendezvous point which all other nodes use to join. This node is called the ‘bootstrap node’. 

```linux
pc1$ geth --datadir . --keystore ~/Library/ethereum/keystore --allow-insecure-unlock --http --http.api 'personal,eth,net,web3,txpool,miner' --http.corsdomain "*" --networkid 15 --nat extip:YOUR_IP_ADDRESS --mine --miner.etherbase="YOUR_ACCOUNT_ADDRESS" 
```

> Replace the Geth account address and the IP address with yours.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xthgu9fi7sjyuvcqal9a.png)

Now use another CLI to extract the ‘node record’ of the bootnode using the JS console.
```linux
pc1$ geth attach geth.ipc --exec admin.nodeInfo.enr
```
> This command should print a base64 string such as the following example. Other nodes will use the information contained in the bootstrap node record to connect to your peer-to-peer network.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dgp66anysjf2o8g2r119.png)

### Running member nodes on another machine
Before running a member node on **LinuxOS Ubuntu**, we have to first initialize it with the same genesis file as used for the bootstrap node.
> Navigate to the directory **/genesis.json** first.
```linux
pc2$ geth init --datadir pc2 genesis.json
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xc3zr8mv5dcz67dqkb8j.png)

Then we connect the second node to the bootstrap node:
```linux
pc2$ geth --datadir pc2 --networkid 15 --port 30304 --bootnodes "enr:-KO4QPSFgMKtubyZlc5yyvfmAZvb7uAuevXAiggzQ1ert0w2GQI6h6v15cnRdn2LJqyEC8RFoVNo5VyfWUltwDqF1YGGAYAZwr5Qg2V0aMfGhMGBRa2AgmlkgnY0gmlwhAqI5COJc2VjcDI1NmsxoQI30yNxr1nIqyU0YYAQaNFBztGq1gVfvYMsYUd4hd9zBoRzbmFwwIN0Y3CCdl-DdWRwgnZf"
```
> Use your own enr instead. 
Now on pc2, check the connection status.

first open a new CLI and input the following:
```linux
pc2$ geth attach pc2/geth.ipc
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/19y759q7qi3luld44pnm.png)

Then find peers:
```linux
> admin.peers
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w0il6i08jw3s8nv98h0f.png)
Show peer numbers:
```linux
> net.peerCount
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xgjld4rt2x2wyggn0n01.png)


### Mining Ethereum blocks
To begin mining our blockchain, we can run:
```javascript
miner.start()
```
Let's allow it to run for a while, and then stop the mining by typing:
```javascript
miner.stop()
```

Now We have rewarded some tokens for mining new blocks. We can verify this by running the following command:
```javascript
eth.getBalance(eth.accounts[0])
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2rhyc3680lxi1nxa0jqo.png)

### Sending Tokens

Run the following command to finish the authentication process of **account 0** before sending tokens:
```javascript
personal.unlockAccount(eth.accounts[0])
```
Input the password we have set to unlock **account 0**:
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/doymc04mjfh2r8mwbeym.png)

Now let's transfer tokens from **account 0** to **account 1** by running this command:
```javascript
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[1], value: 500000})
```

> **Value** here is in Wei (Where 1 ETH equals 1 x 10 ^ 18 Wei)

We should get a green transaction hash if the transaction has been done correctly.
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pi83kyutpekqyengbdr2.png)

Since we had stopped the mining process before we were creating the transaction, this transaction is added to the memory pool rather than being added to the blockchain. At this point, account 1 cannot receive the transferred token if we run:

```javascript
eth.getBalance(eth.accounts[1])
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xywjc6cntze2wta4o84l.png)

Let's start the mining process again for a while:
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hvdjno1ndn2kp7m5jphs.png)

And run the following again:
```javascript
eth.getBalance(eth.accounts[1])
```
Finally transferred tokens have been received by **account 1**:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qdsuoo985zcvl33htr99.png)

Pretty COOL!
