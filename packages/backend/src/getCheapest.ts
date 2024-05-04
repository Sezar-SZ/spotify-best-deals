import axios from "axios";
import redis from "./Redis";

export async function getCheapest(month: Month) {
    const countriesList = await getCountriesList();
    const prices: any[] = [];

    for (const countryCode of countriesList) {
        const price = await getPrice(countryCode, month, "LTC");
        prices.push({ countryCode, price });
    }

    const sanitizedPrices = prices.filter((price) => price.price > 0);

    const cheapest = sanitizedPrices.sort((a, b) => a.price - b.price)[0];
    const coinPrice = await getCoinPrice("LTC");
    cheapest.price = "$" + (coinPrice * cheapest.price).toFixed(2);
    return { ...cheapest };
}

export async function getCountriesList() {
    try {
        const countriesList = await redis.get("countriesList");
        if (countriesList) {
            return JSON.parse(countriesList);
        }
        const { data } = await axios.get(
            "https://backend.coinsbee.com/api/v1/brands/info/Spotify/en"
        );
        await redis.set(
            "countriesList",
            JSON.stringify(data.countries),
            "EX",
            60 * 5
        );
        return data.countries;
    } catch (error) {
        console.log(error);

        return [];
    }
}

export async function getPrice(countryCode: string, month: Month, coin: any) {
    try {
        const price = await redis.get(`${countryCode}:${month}`);
        if (price) {
            return price;
        }
        const { data } = await axios.get(
            `https://backend.coinsbee.com/api/v1/products/list/Spotify/${countryCode}/en/
            `
        );
        const result = data.results.find((result: Record<string, any>) =>
            result.name.startsWith(`Spotify ${month} Month`)
        );
        if (result) {
            const { id, value } = result;

            const { data: priceRequestData } =
                await axios.get(`https://backend.coinsbee.com/api/v1/cart/price/${id}}/${value}/${coin}
            `);

            const newPrice = priceRequestData.results.supplier.price;
            await redis.set(`${countryCode}:${month}`, newPrice, "EX", 60 * 5);
            return newPrice;
        }
        await redis.set(`${countryCode}:${month}`, "-1", "EX", 60 * 5);
        return "-1";
    } catch (error) {
        console.log(error);
        return "-1";
    }
}

export async function getCoinPrice(coin: string) {
    const price = await redis.get(coin);
    if (price) return price;

    const { data } = await axios.get(
        `https://open-api.bingx.com/openApi/swap/v2/quote/ticker?symbol=${coin}-USDT`
    );

    const newPrice = data.data.lastPrice;
    await redis.set("coin", newPrice, "EX", 60 * 5);
    return newPrice;
}

export type Month = "1" | "3" | "6" | "12";
