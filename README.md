# ALS_ICO

## Deploy to rinkeby test network

1. Run geth node

```bash
geth --rinkeby --http --http.api personal,eth,net,web3 --allow-insecure-unlock
```

This can take dozens of hours, depending on your machine configuration and internet speed.  
This will cost you close to 100GB or so of hard drive space.

2. Create a new account

```bash
geth --rinkeby account new
```

3. Attach into geth console

```bash
geth --rinkeby attach
```

And you can do many things in geth console

```bash
eth.syncing     #check the syncing status
eth.accounts    #check all accounts
eth.getBalance(eth.accounts[0]) #check account balance
personal.unlockAccount(eth.accounts[0],null,1200)   #unlock a certain accont for 20 minutes
```

4. Acquire eth from https://www.rinkeby.io/#faucet

Here they require that you have to post a twitter or facebook, which is disgusting.

rinkeby.io may be unstable, you can use the following alt sites to get ether.

- https://faucets.chain.link/rinkeby
- https://rinkebyfaucet.com/
- https://app.mycrypto.com/faucet
- https://faucet.paradigm.xyz/

5. Migrate

```bash
truffle migrate --reset --compile-all --network rinkeby
```

6. Verify deployment and transfer tokens to sale contract

```bash
geth --rinkeby attach
```

```bash
var admin = eth.accounts[0]
var tokensAvailable = 20000000
var tokenSaleAddress = "Your_Sale_Contract_Address" # check the address in build/contracts/ALSTokenSale.json
var abi = [Your_Token_Contract_ABI_Array] #copy the abi ARRAY in build/contracts/Election.json, turn it into one line style. in oss code, select all data, and press F1, search join line.
var tokenAddress = "Your_Contract_Address" # check the address in build/contracts/ALSTokenSale.json
var TokenContract = web3.eth.contract(abi) # describe the contract - ABI to web3
var tokenInstance = TokenContract.at(tokenAddress) # tell web3 the contract address
tokenInstance.name() # check the name
tokenInstance.address # check the address
tokenInstance.transfer(tokenSaleAddress, tokensAvailable, {from: admin})
tokenInstance.balanceOf(tokenSaleAddress) # check the sale contract balance
```

7. import rinkeby account to metamask

keystore dir: `~/.ethereum/rinkeby/keystore`

keystore is the restore file, keep it carefully.

import your rinkeby account key file into metamask, use password for the account at the same time.

this may take several minutes, be patient.
