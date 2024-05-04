import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const token = process.env.API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const options = [
    { text: "1 month", value: "1" },
    { text: "3 months", value: "3" },
    { text: "6 months", value: "6" },
    { text: "1 year", value: "12" },
];

function sendOptions(chatId) {
    const keyboard = {
        reply_markup: {
            keyboard: options.map((option) => [{ text: option.text }]),
            resize_keyboard: true,
        },
    };
    bot.sendMessage(chatId, "Choose an option:", keyboard);
}

// Event listener for /start command
bot.onText(/\/start/, (msg) => {
    sendOptions(msg.chat.id);
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const selectedOption = options.find((option) => option.text === text);

    if (selectedOption) {
        try {
            const { data } = await axios.get(
                `${process.env.BACKEND_URL}/${selectedOption.value}`
            );
            bot.sendMessage(
                chatId,
                `Cheapest Price is ${data.price} for Country ${data.countryCode}`
            );
        } catch (error) {
            console.error("Error fetching data:", error);
            bot.sendMessage(
                chatId,
                "Error fetching data. Please try again later."
            );
        }
    }
});
