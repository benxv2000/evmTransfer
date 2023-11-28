const axios = require('axios');
const BigNumber = require('bignumber.js');
const winston = require('winston');
const transferEventHash = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const perPage = 1000;
const beginBlock = '0';
const endBlock = 'latest'
const tokenIDBuyerMap = new Map();

const etherscanApiKey = '7PRK5WGMY42G4E4N8XD5IQAS3C79FR4H9X';

const contractAddress = '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85';

var indexPage = 0;

function pickInfo(element) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const buyer = element.topics[2]; 
      const tokenIDHex = element.topics[3];
      const tokenIDDecimal = new BigNumber(tokenIDHex).toString();
      tokenIDBuyerMap.set(tokenIDDecimal, buyer);
      resolve(); 
    }, 1000);
  });
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logfile.log' }),
    new winston.transports.Console(),
  ]
});

async function getTransferEvents(indexPage) {
  try {
    const params = {
      module: 'logs',
      action: 'getLogs',
      fromBlock: beginBlock,
      toBlock: endBlock,
      page: indexPage,
      offset: perPage,
      address: contractAddress,
      topic0: transferEventHash,
      apikey: etherscanApiKey,
    };
    const response = await axios.get(`https://api.etherscan.io/api`, { params });
    logger.info(`Page:${indexPage}`);
    await transferEventArray(response.data.result);
  } catch (error) {
    console.error('Error fetching Transfer events:', error.message);
  }
}

async function transferEventArray(events) {
  const promises = events.map((element) => pickInfo(element));
  await Promise.all(promises);
  logger.info(`tokenIDBuyerMap.size:${tokenIDBuyerMap.size}`);
}

const conTab = async() => {
  indexPage ++;
  await getTransferEvents(indexPage);
  setTimeout(conTab, 200);
}
async function main() {
  logger.info(`contractAddress: ${contractAddress}`);
  logger.info('TransferEvent');
  conTab();
}

main()
