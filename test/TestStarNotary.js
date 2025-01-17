const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);

    //needed starting from London block
    const block = await web3.eth.getBlock('latest');
    const next_gas_price = Math.ceil(block.baseFeePerGas);
    
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:next_gas_price});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);

    assert.equal(balanceAfterUser2BuysStar < balanceOfUser2BeforeTransaction, true);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const nameToken = await instance.name.call();
    assert.equal(nameToken, "Udacity Star Token");
    const symbolToken = await instance.symbol.call();
    assert.equal(symbolToken, "UST");
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    // 1. create 2 Stars with different tokenId
    let tokenId1 = 100;
    let tokenId2 = 200;
    let owner1 = accounts[0];
    let owner2 = accounts[1];
    await instance.createStar('First Awesome Star', tokenId1, {from: owner1});
    await instance.createStar('Second Awesome Star', tokenId2, {from: owner2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2);

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(tokenId1), owner2);
    assert.equal(await instance.ownerOf.call(tokenId2), owner1);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let owner1 = accounts[0];
    let owner2 = accounts[1];
    let starId = 300;
    await instance.createStar('Awesome star 12', starId, {from: owner1});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(owner2, starId, {from: owner1});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(starId), owner2);
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let owner = accounts[0];
    let starId = 13;
    await instance.createStar('Most Awesome Star', starId, {from: owner});
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo (starId);
    // 3. Verify if you Star name is the same
    assert(starName, 'Most Awesome Star');
});