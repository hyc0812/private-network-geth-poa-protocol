## Setting up a private network with multiple PCs using Go Ethereum (Geth)





> This blog explains how to set up a private blockchain network with multiple nodes running on different computers.

> _This tutorial is meant for those with some knowledge of Ethereum and smart contracts, who have some knowledge of nodes, geth and POA, etc._
> The purpose of building this blog is to write down the detailed operation history and my memo for learning the dApps.
> If you are also interested and want to get hands dirty, just follow these steps below and have fun!~

### Prerequisites
- Two PCs (I used MacOS and LinuxOS)
- [Geth](https://geth.ethereum.org/docs/install-and-build/installing-geth) and [Node.js](https://nodejs.org/en/) installed
- MetaMask (optional)


> **NOTE:** In the following **Command Line Interface** (CLI) We mark the two CLIs running on different computers as `pc1$` and `pc2$`. 
> **Do not** copy the prefix `pc1$` and `pc2$`. 

## Getting started

### Check IP address
We use this CLI command to know the ip address of **macOS** device **pc1**:
```linux
pc1$ ifconfig|grep netmask|awk '{print $2}'
```
Output:
`127.0.0.1
1X.1XX.2XX.35`
> Use the second one.

### Generate a new geth account
```linux
geth account new
```
Output:
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

In the same directory we add file **mineWhenNeeded.js** and paste the following code:
```js
var mining_threads = 1

function checkWork() {
    if (eth.getBlock("pending").transactions.length > 0) {
        if (eth.mining) return;
        console.log("== Pending transactions! Mining...");
        miner.start(mining_threads);
    } else {
        miner.stop();
        console.log("== No transactions! Mining stopped.");
    }
}

eth.filter("latest", function(err, block) { checkWork(); });
eth.filter("pending", function(err, block) { checkWork(); });

checkWork();
```
> For mining automatically when necessary. 

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
pc1$ geth --datadir . --keystore ~/Library/ethereum/keystore --allow-insecure-unlock --http --http.api 'personal,eth,net,web3,txpool,miner' --http.corsdomain "*" --networkid 15 --nat extip:IP_ADDRESS --mine --miner.etherbase="GETH_ACCOUNT_ADDRESS" 
```

> Replace the **keystore** route, **GETH_ACCOUNT_ADDRESS** and the **IP_ADDRESS** with yours.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xthgu9fi7sjyuvcqal9a.png)

Now use another CLI to extract the ‘node record’ of the bootnode using the JS console.
```linux
pc1$ geth attach geth.ipc --exec admin.nodeInfo.enr
```
Or use this one to prompt a new Geth CLI and get the ‘node record’:
```linux
pc1$ geth --preload "checkAllBalances.js" attach geth.ipc
pc1> admin.nodeInfo.enr
```

> This command should print a base64 string such as the following example. Other nodes will use the information contained in the bootstrap node record to connect to your peer-to-peer network.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dgp66anysjf2o8g2r119.png)

### Running member nodes on another machine
Before running a member node on **LinuxOS Ubuntu**, we have to first initialize it with the same genesis file as used for the bootstrap node.
> Navigate to the directory **/genesis.json** first.
```linux
pc2$ geth init --datadir . genesis.json
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xc3zr8mv5dcz67dqkb8j.png)

Then we connect the second node to the bootstrap node:
**Option 1**:
```linux
pc2$ geth --datadir . --networkid 15 --port 30304 --bootnodes "enr:-YOUR_ENR_STRING"
```
> In this option:
> Node 2 will not be a miner.
> Use your own enr string.

**Option 2**:
**Alternatively** use this one to connect the second node to the bootstrap node:
```linux
pc2$ geth account new
pc2$ geth --datadir . --keystore /home/yongchang/.ethereum/keystore --allow-insecure-unlock --http --http.api 'personal,eth,net,web3,txpool,miner' --http.corsdomain "*" --networkid 15 --port 30304 --mine --miner.etherbase="YOUR_ACCOUNT_ADDRESS" --bootnodes "BOOTNODE ENR"
```
> Node 2 will be a miner using this command
> Use your own keystore route, account address and enr string.

### Check the connection status.

Open a new CLI and input the following:
```linux
pc2$ geth --preload "checkAllBalances.js" attach geth.ipc
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/19y759q7qi3luld44pnm.png)

Find peers:
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
> miner.start()
```
Let's allow it to run for a while, and then stop the mining by typing:
```javascript
> miner.stop()
```

Now We have rewarded some tokens for mining new blocks. We can verify this by running the following command:
```javascript
> eth.getBalance(eth.accounts[0])
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2rhyc3680lxi1nxa0jqo.png)

### Sending Tokens
**Option 1:**
```javascript
> eth.sendTransaction({from: ACCOUNT_pc1_STRING, to: ACCOUNT_pc2_STRING, value: 5000})
```
> **Value** here is in Wei (Where 1 ETH equals 1 x 10 ^ 18 Wei)

We should get a green transaction hash if the transaction has been done correctly (should mining for a while).
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pi83kyutpekqyengbdr2.png)

**Option 2:**
We can use MetaMask to transfer ETH from account_pc1 to account_pc2 and vice versa. Should be faster and simpler.

### ENJOY!


## References

https://geth.ethereum.org/

"enr:-KO4QF6Dcpj50FbPEkAxz57lEuDptxQpqvTqLzJCxl3EnUTEZUvof69tW4Uo11z4xDpzX84z-ndkfoPvGbV2dyTgOReGAYAkwfa9g2V0aMfGhMGBRa2AgmlkgnY0gmlwhAqI5CKJc2VjcDI1NmsxoQOjJMzoZhkh5D_dNWdRnhpvscavnt6kHz0qMSOUvz1ZN4RzbmFwwIN0Y3CCdl-DdWRwgnZf"

http://10.136.228.34:3000/


