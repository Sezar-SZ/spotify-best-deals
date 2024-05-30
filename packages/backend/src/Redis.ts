import Redis from "ioredis";

class RedisSingleton {
    private static instance: Redis | null = null;
    private _redis: Redis;

    private constructor() {
        this._redis = new Redis({
            host: process.env.REDIS_HOST as string,
            port: parseInt(process.env.REDIS_PORT || "6379", 10),
        });
    }

    public static getInstance(): Redis {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = new RedisSingleton()._redis;
        }
        return RedisSingleton.instance;
    }
}

export default RedisSingleton.getInstance();
