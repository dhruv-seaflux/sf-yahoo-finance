import { YahooFinance } from "./lib/rates";

const yahooFinance = new YahooFinance();

async function getConversionRates() {
    try {
        const rates = await yahooFinance.getFiatRates("USD", "INR");
        console.log(rates);
        const cryptoRates = await yahooFinance.getCryptoRates("JPY", "BTC");
        console.log(cryptoRates);
    } catch (error) {
        console.error("Error fetching rates:", error);
    }
}

getConversionRates()