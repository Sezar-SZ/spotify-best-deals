import axios from "axios";
import Redis from "ioredis";
import cron from "node-cron";

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

cron.schedule("*/60 * * * *", () => {
    getAllCheapest();
});

getAllCheapest();

export async function getAllCheapest() {
    try {
        await getCheapest("1");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        await getCheapest("3");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        await getCheapest("6");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        await getCheapest("12");
    } catch (error) {}
}

async function getCheapest(month) {
    const countriesList = await getCountriesList();
    const prices = [];

    for (const countryCode of countriesList) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const price = await getPrice(countryCode, month, "LTC");
        prices.push({ countryCode, price });
    }

    const sanitizedPrices = prices.filter(
        (price) => price.price && price.price > 0
    );

    const cheapest = sanitizedPrices.sort((a, b) => a.price - b.price)[0];

    if (cheapest.price) {
        const coinPrice = await getCoinPrice("LTC");
        cheapest.price = "$" + (coinPrice * cheapest.price).toFixed(2);

        if (cheapest.price)
            await redis.set(`cheapest-${month}`, JSON.stringify(cheapest));
    }
}

async function getCountriesList() {
    try {
        const { data } = await axios.get(
            "https://backend.coinsbee.com/api/v1/brands/info/Spotify/en"
        );

        return data.countries;
    } catch (error) {
        return [];
    }
}

async function getPrice(countryCode, month, coin) {
    try {
        const { data } = await axios.get(
            `https://backend.coinsbee.com/api/v1/products/list/Spotify/${countryCode}/en/
            `
        );

        const result = data.results.find((result) =>
            result.name.startsWith(`Spotify ${month} Month`)
        );
        if (result) {
            const { id, value } = result;

            const { data: priceRequestData } =
                await axios.get(`https://backend.coinsbee.com/api/v1/cart/price/${id}}/${value}/${coin}
            `);

            const newPrice = priceRequestData.results.supplier.price;

            return newPrice;
        }
        return "-1";
    } catch (error) {
        return "-1";
    }
}

async function getCoinPrice(coin) {
    const cachedPrice = await redis.get("ltc-price");
    if (cachedPrice) return cachedPrice;

    const { data } = await axios.get(
        `https://open-api.bingx.com/openApi/swap/v2/quote/ticker?symbol=${coin}-USDT`
    );

    const newPrice = data.data.lastPrice;
    await redis.set("ltc-price", newPrice, "EX", 60 * 60 * 2);
    return newPrice;
}
