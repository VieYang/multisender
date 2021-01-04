import { action, observable } from "mobx";
import getWeb3 from '../getWeb3';
import Web3 from 'web3';
class Web3Store {
  @observable web3 = {};
  @observable defaultAccount = '';
  getWeb3Promise = null;
  @observable loading = true;
  @observable errors = [];
  @observable userTokens = [];
  @observable explorerUrl = '';
  @observable startedUrl = window.location.hash
  constructor(rootStore) {

    this.getWeb3Promise = getWeb3().then(async (web3Config) => {
      const {web3Instance, defaultAccount} = web3Config;
      this.defaultAccount = defaultAccount;
      this.web3 = new Web3(web3Instance.currentProvider);
      this.getUserTokens(web3Config)
      this.setExplorerUrl(web3Config.explorerUrl)
      console.log('web3 loaded')
    }).catch((e) => {
      console.error(e,'web3 not loaded')
      this.errors.push(e.message)
    })
  }
  @action
  setExplorerUrl(url){
    this.explorerUrl = url
  }
  @action
  setStartedUrl(url){
    this.startedUrl = url;
  }
  async getUserTokens({netId, trustApiName, defaultAccount}) {
    window.fetch(`https://misc.newswap.org/tokenlist/default_list.json`).then((res) => {
      return res.json()
    }).then((res) => {
      let tokens = res.tokens.filter(token => {
        const {chainId} = token;
        return netId == chainId;
      }).map(token => {
        const {address, symbol, name} = token;
        return {label: `${symbol} - ${name}`, value: address}
      })
      tokens.unshift({
        value: '0x000000000000000000000000000000000000bEEF',
        label: "ETH - Ethereum Native Currency"
      })
      this.userTokens = tokens;
      this.loading = false;
    }).catch((e) => {
      this.loading = false;
      console.error(e);
    })
  }

}

export default Web3Store;