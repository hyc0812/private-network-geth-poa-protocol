## Setting up a private network with multiple PCs using Go Ethereum (Geth)

> This blog explains how to set up a multiple node private blockchain network running on different computers.

> _This tutorial is meant for those with some knowledge of Ethereum and smart contracts, who have some knowledge of nodes, geth and POA, etc._
> The purpose of building this blog is to write down the detailed operation history and my memo for learning the dApps.
> If you are also interested and want to get hands dirty, just follow these steps below and have fun!~

### Prerequisites
- Two PCs (MacOS and LinuxOS are recommended)
- [Geth](https://geth.ethereum.org/docs/install-and-build/installing-geth) installed
- Node.js 


> In Command Line Interface (CLI) We mark the two computers as `pc1` and `pc2`. 

## Getting started

First we use this CLI command to know the ip address of device **pc1**:
```linux
$ ifconfig|grep netmask|awk '{print $2}'
```

