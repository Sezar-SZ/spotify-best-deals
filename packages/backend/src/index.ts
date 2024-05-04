import express, { Request } from "express";
import cors from "cors";

import Redis from "ioredis";

import { Month, getCheapest } from "./getCheapest";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

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
