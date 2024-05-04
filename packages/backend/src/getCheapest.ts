import axios from "axios";
import redis from "./Redis";

export async function getCheapest() {
    const countriesList = await getCountriesList();
    return { data: countriesList };
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
