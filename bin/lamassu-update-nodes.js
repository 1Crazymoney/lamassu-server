#!/usr/bin/env node

const _ = require('lodash/fp')

const { utils: coinUtils } = require('lamassu-coins')
const cryptos = coinUtils.cryptoCurrencies()

const common = require('../lib/blockchain/common')

const PLUGINS = {
  BTC: require('../lib/blockchain/bitcoin.js'),
  LTC: require('../lib/blockchain/litecoin.js'),
  ETH: require('../lib/blockchain/ethereum.js'),
  DASH: require('../lib/blockchain/dash.js'),
  ZEC: require('../lib/blockchain/zcash.js'),
  BCH: require('../lib/blockchain/bitcoincash.js')
}

function plugin (crypto) {
  const plugin = PLUGINS[crypto.cryptoCode]
  if (!plugin) throw new Error(`No such plugin: ${crypto.cryptoCode}`)
  return plugin
}

function run () {
  _.forEach((crypto) => {
    const cryptoPlugin = plugin(crypto)

    const status = common.es(`sudo supervisorctl status ${crypto.code} | awk '{ print $2 }'`)
    if (status === 'RUNNING') cryptoPlugin.updateCore(common.getBinaries(crypto.cryptoCode), true)
    if (status === 'STOPPED') cryptoPlugin.updateCore(common.getBinaries(crypto.cryptoCode), false)
  }, cryptos)
}

run()
