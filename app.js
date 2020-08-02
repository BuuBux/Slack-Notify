const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const url = process.env.BOT_URL;
const requestUrl = process.env.REQUEST_URL;
const accHour = new Date().getHours();

let xKomPromotion =  '';
let morelePromotion = '';
let asmoPromotion = '';
let carinetPromotion = '';
let combatPromotion = '';

const sendRequest = (val) => {
	return axios.post(`${url}`, {
		"text": `${val.data.productName}`,
		"blocks": [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `${val.data.productName}`
				}
			},
			{
				"type": "section",
				"block_id": "section567",
				"text": {
					"type": "mrkdwn",
					"text": `${val.data.productUrl}`
				},
				"accessory": {
					"type": "image",
					"image_url": `${ (val.data.pictureUrl) ? val.data.pictureUrl : 'https://i.ibb.co/nbWj5jN/err.jpg' }`,
					"alt_text": `${val.data.productName}`
				}
			},
			{
				"type": "section",
				"block_id": "section789",
				"fields": [
					{
						"type": "mrkdwn",
						"text": `~${val.data.oldPrice}~ - ${val.data.newPrice}`
					}
				]
			}
		]
	}).then((res) => {
		console.log(res);
	}).catch((err) => {
		console.log(err);
	})
};


const checkIsNewPromotion = (incomingValue, oldProductName, incomingProductName) => {
	if (incomingProductName !== oldProductName) {
		sendRequest(incomingValue)
			.then((res) => {
				console.log('Udany request do podmiany!');
			}).catch((err) => {
				console.log('Błąd w requescie przy zmienie');
				throw Error(err);
		})
		return incomingProductName;
	}
	return oldProductName;
}

const createPromisesForShops = (shopName) => {
	return new Promise(((resolve, reject) => resolve(axios.get(`${requestUrl}${shopName}`))));
}


setInterval(() => {

	if (accHour > 6) {

		const shops = ['combat'];

		Promise.all(shops.map((name) => createPromisesForShops(name)))
			.then((arrayOfPromotions) => {
				arrayOfPromotions.map((promotion) => {
					if (promotion.data.productName && typeof promotion.data.productName === "string" && promotion.data.productName !== 'null') {
						switch (promotion.data.shopName) {
							case 'amso':
								asmoPromotion = checkIsNewPromotion(promotion, asmoPromotion, promotion.data.productName)
								break;
							case 'combat':
								combatPromotion = checkIsNewPromotion(promotion, combatPromotion, 'inna nazwa');
								break;
							case 'morele.net':
								morelePromotion = checkIsNewPromotion(promotion, morelePromotion, promotion.data.productName);
								break;
							case 'carinet':
								carinetPromotion = checkIsNewPromotion(promotion, carinetPromotion, promotion.data.productName);
								break;
							case 'x-kom':
								xKomPromotion = checkIsNewPromotion(promotion, xKomPromotion, promotion.data.productName);
								break;
							default:
								console.log('No kurwa nie sądze');
								break;
						}
					}
				});
			}).catch((err) => {
				throw Error(err);
			});
	}

}, (10 * 1000));

console.log('Turn ON! New server for slackbot app');
