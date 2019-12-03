import { BN } from 'ethereumjs-util';
import { renderFromWei, weiToFiat } from './number';

/**
 * Calculates wei value of estimate gas price in gwei
 *
 * @param {number} estimate - Number corresponding to api gas price estimation
 * @returns {Object} - BN instance containing gas price in wei
 */
export function apiEstimateModifiedToWEI(estimate) {
	const GWEIRate = 1000000000;
	return new BN((estimate * GWEIRate).toString(), 10);
}

/**
 * Calculates GWEI value of estimate gas price from ethgasstation.info
 *
 * @param {number} val - Number corresponding to api gas price estimation
 * @returns {string} - The GWEI value as a string
 */
export function convertApiValueToGWEI(val) {
	return (parseInt(val, 10) / 10).toString();
}

/**
 * Calculates gas fee in wei
 *
 * @param {number} estimate - Number corresponding to api gas price estimation
 * @param {number} gasLimit - Number corresponding to transaction gas limit
 * @returns {Object} - BN instance containing gas price in wei
 */
export function getWeiGasFee(estimate, gasLimit = 21000) {
	const apiEstimate = apiEstimateModifiedToWEI(estimate);
	const gasFee = apiEstimate.mul(new BN(gasLimit, 10));
	return gasFee;
}

/**
 * Calculates gas fee in eth
 *
 * @param {number} estimate - Number corresponding to api gas price estimation
 * @param {number} gasLimit - Number corresponding to transaction gas limit
 * @returns {Object} - BN instance containing gas price in wei
 */
export function getRenderableEthGasFee(estimate, gasLimit = 21000) {
	const gasFee = getWeiGasFee(estimate, gasLimit);
	return renderFromWei(gasFee);
}

/**
 * Calculates gas fee in fiat
 *
 * @param {number} estimate - Number corresponding to api gas price estimation
 * @param {number} conversionRate - Number corresponding to conversion rate for current `currencyCode`
 * @param {string} currencyCode - String corresponding to code of current currency
 * @param {number} gasLimit - Number corresponding to transaction gas limit
 * @returns {Object} - BN instance containing gas price in wei
 */
export function getRenderableFiatGasFee(estimate, conversionRate, currencyCode, gasLimit = 21000) {
	const wei = getWeiGasFee(estimate, gasLimit);
	return weiToFiat(wei, conversionRate, currencyCode);
}

/**
 * Parse minutes number to readable wait time
 *
 * @param {number} min - Minutes
 * @returns {string} - Readable wait time
 */
export function parseWaitTime(min, strHour, strMin, strSec) {
	let parsed = '';
	let weekRendered, dayRendered, hourRendered, minRendered, tempMin;

	const weeks = Math.floor(min / 10080);
	if (weeks) {
		parsed += `${weeks}${'week'}`;
		weekRendered = true;
	}
	tempMin = min % 10080;

	const days = Math.floor(tempMin / 1440);
	if (days) {
		if (parsed !== '') parsed += ' ';
		parsed += `${days}${'day'}`;
		dayRendered = true;
		min = tempMin;
	}
	tempMin = min % 1440;

	const hours = Math.floor(tempMin / 60);
	if (!weekRendered && hours) {
		if (parsed !== '') parsed += ' ';
		parsed += `${hours}${strHour}`;
		hourRendered = true;
		min = tempMin;
	}
	tempMin = min % 60;

	const minutes = Math.floor(tempMin);
	if (!weekRendered && !dayRendered && minutes >= 1) {
		if (parsed !== '') parsed += ' ';
		minRendered = true;
		parsed += `${minutes}${strMin}`;
		min = tempMin;
	}
	min %= 1;

	const seconds = (Math.round(min * 100) * 3) / 5;
	if (!weekRendered && !dayRendered && !hourRendered && !minRendered && seconds > 1) {
		if (parsed !== '') parsed += ' ';
		parsed += `${Math.ceil(seconds)}${strSec}`;
	}

	return parsed;
}

/**
 * Fetches gas estimated from gas station
 *
 * @returns {Object} - Object containing basic estimates
 */
export async function fetchBasicGasEstimates() {
	return await fetch('https://ethgasstation.info/json/ethgasAPI.json', {
		headers: {},
		referrer: 'http://ethgasstation.info/json/',
		referrerPolicy: 'no-referrer-when-downgrade',
		body: null,
		method: 'GET',
		mode: 'cors'
	})
		.then(r => r.json())
		.then(
			({
				average,
				avgWait,
				block_time: blockTime,
				blockNum,
				fast,
				fastest,
				fastestWait,
				fastWait,
				safeLow,
				safeLowWait,
				speed
			}) => {
				const basicEstimates = {
					average,
					averageWait: avgWait,
					blockTime,
					blockNum,
					fast,
					fastest,
					fastestWait,
					fastWait,
					safeLow,
					safeLowWait,
					speed
				};
				console.log('basicEstimates', basicEstimates);
				return basicEstimates;
			}
		);
}
