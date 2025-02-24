import axios from "axios";
import { Constants } from "../config/constants";
import { ECryptoCurrency, EFiatCurrency } from "../config/enums";

export class YahooFinance {
    /**
     * Fetches the exchange rate from one currency to another.
     * @param {string} from - The currency to convert from.
     * @param {string} to - The currency to convert to.
     * @returns {Promise<number>} The exchange rate from `from` to `to`.
     */
    public async getFiatRates(from: string, to: string): Promise<number> {
        try {
            const response = await axios.get(`${Constants.YAHOO_FINANCE_BASE_URL}/${from}${to}=X`);
            if (!response.data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
                throw new Error("Exchange rate data unavailable");
            }
            return response.data.chart.result[0].meta.regularMarketPrice;
        } catch (error) {
            throw new Error(`Failed to fetch fiat rates: ${error.message}`);
        }
    }

    /**
     * Fetches the exchange rate between fiat and cryptocurrency.
     * @param {string} from - The currency to convert from.
     * @param {string} to - The currency to convert to.
     * @returns {Promise<number>} The exchange rate from `from` to `to`.
     */
    public async getCryptoRates(from: string, to: string): Promise<number> {
        if (this.isCryptoCurrency(from) && !this.isCryptoCurrency(to)) {
            return this.convertCryptoToFiat(from, to);
        }
        if (!this.isCryptoCurrency(from) && this.isCryptoCurrency(to)) {
            return this.convertFiatToCrypto(from, to);
        }
        throw new Error("Invalid currency pair");
    }

    private async convertCryptoToFiat(crypto: string, fiat: string): Promise<number> {
        const cryptoRate = await this.fetchCryptoRate(crypto);
        return fiat === EFiatCurrency.USD ? cryptoRate : cryptoRate * (await this.getFiatRates(EFiatCurrency.USD, fiat));
    }

    private async convertFiatToCrypto(fiat: string, crypto: string): Promise<number> {
        const cryptoRate = await this.fetchCryptoRate(crypto);
        return fiat === EFiatCurrency.USD ? 1 / cryptoRate : (await this.getFiatRates(EFiatCurrency.USD, fiat)) / cryptoRate;
    }

    private async fetchCryptoRate(crypto: string): Promise<number> {
        try {
            const response = await axios.get(`${Constants.YAHOO_FINANCE_CRYPTO_BASE_URL}/${crypto}-USD`);
            if (!response.data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
                throw new Error("Crypto exchange rate data unavailable");
            }
            return response.data.chart.result[0].meta.regularMarketPrice;
        } catch (error) {
            throw new Error(`Failed to fetch crypto rates: ${error.message}`);
        }
    }

    private isCryptoCurrency(currency: string): boolean {
        return Object.values(ECryptoCurrency).includes(currency.toUpperCase() as ECryptoCurrency);
    }
}
