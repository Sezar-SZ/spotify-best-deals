import express, { Request } from "express";
import cors from "cors";

import { rateLimit } from "express-rate-limit";

import { Month, getCheapest } from "./getCheapest";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 2,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
app.use(limiter);

app.get("/:month", async (req: Request<{ month: Month }>, res) => {
    const { month }: { month: Month } = req.params;
    const response = await getCheapest(month);

    res.json({
        ...response,
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
