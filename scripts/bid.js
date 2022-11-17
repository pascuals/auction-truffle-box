/*
  Try `truffle exec scripts/bid.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/

const SimpleStorage = artifacts.require("Auction");

module.exports = async function (callback) {
    const deployed = await SimpleStorage.deployed();

    const highestPrice = (await deployed.getHighestPrice()).toNumber();
    console.log(`Current highest price value: ${highestPrice}`);

    const { tx } = await deployed.bid().send({ value: highestPrice });
    console.log(`Confirmed transaction ${tx}`);

    const updatedPrice = (await deployed.getHighestPrice()).toNumber();
    console.log(`Updated SimpleStorage value: ${updatedPrice}`);

    callback();
};
