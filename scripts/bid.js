/*
  Try `truffle exec scripts/bid.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts:
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/

const SimpleStorage = artifacts.require("./Auction.sol");

module.exports = async function (callback) {
    const deployed = await SimpleStorage.deployed();

    const highestPrice = +(await deployed.getHighestPrice()).toString();
    console.log(`Current highest price value: ${highestPrice}`);

    const basePrice = +(await deployed.getBasePrice()).toString();
    console.log(`Current base price value: ${basePrice}`);

    const nextBid = Math.max(highestPrice, basePrice) + 1000;
    console.log(`Next bid: ${nextBid}`)

    const { tx } = await deployed.bid.sendTransaction({ value: nextBid });
    console.log(`Confirmed transaction ${tx}`);

    const updatedPrice = +(await deployed.getHighestPrice()).toString();
    console.log(`Updated SimpleStorage value: ${updatedPrice}`);

    callback();
};
