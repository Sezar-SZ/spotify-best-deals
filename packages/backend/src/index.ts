import express from "express";
import cors from "cors";

import Redis from "ioredis";

import { getCheapest } from "./getCheapest";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
    const response = await getCheapest();
    res.json({
        ...response,
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
