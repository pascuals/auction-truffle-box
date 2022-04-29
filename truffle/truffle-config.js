const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id,
    },
    production: {
      host: "...",
      port: "",
      network_id: "4"
    },
  },
  plugins: ['truffle-plugin-verify'],
  api_keys: {
    etherscan: 'MY_API_KEY'
  }
};
