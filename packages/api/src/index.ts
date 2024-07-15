import express, { Request } from "express";
import cors from "cors";

import { rateLimit } from "express-rate-limit";

import redis from "./Redis";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 2,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
app.use(limiter);

app.get("/:month", async (req: Request<{ month: Month }>, res) => {
    const { month }: { month: Month } = req.params;

    const response = JSON.parse(
        (await redis.get(`cheapest-${month}`)) ||
            '{"price": "", "countryCode": ""}'
    );

    res.json({
        ...response,
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

type Month = "1" | "3" | "6" | "12";
