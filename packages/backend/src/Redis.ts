import Redis from "ioredis";

class RedisSingleton {
    private static instance: Redis | null = null;
    private _redis: Redis;

    private constructor() {
        this._redis = new Redis({
            host: "localhost",
            port: 6379,
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
