"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");

// Import the redlock library at the beginning of the Lambda function
const Redlock = require("redlock");
// Modification: removed Memcache related code
// const memcached = require("memcached");
const util = require("util");
const KEY = `account1/balance`;
const DEFAULT_BALANCE = 100;
// Modification: removed Memcache related code
// const MAX_EXPIRATION = 60 * 60 * 24 * 30;
// const memcachedClient = new memcached(`${process.env.ENDPOINT}:${process.env.PORT}`);

// Modification: Declare the Redis client variable at lambda global scope
let redisClient;
let redlock; // Declare the redlock instance at global scope

// Modification: Function to initialize the Redis client and Redlock instance
function initializeRedisClient() {
  if (!redisClient) {
    console.log("Initializing Redis client");
    redisClient = new Redis({
      host: process.env.ENDPOINT,
      port: parseInt(process.env.PORT || "6379"),
  });

    // Listen for the "ready" event to ensure the client is ready for use
    redisClient.on("ready", () => {
      console.log("Redis client ready");
    });

    // Listen for any errors that might occur with the client
    redisClient.on("error", (err) => {
      console.error("Error with Redis client:", err);
    });
  }

  // Initialize the Redlock instance with the Redis client
  if (!redlock) {
    redlock = new Redlock([redisClient], {
      // Redlock options, you can configure these as needed
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
    });
  }
}


// Modification: Lazy initialization: Call the function once to initialize the Redis client
initializeRedisClient();

// Modification: Included unit calculation for deducting the balance
// Modification: Transaction management using Redlock library
exports.chargeRequestRedis = async function (input) {
  
    // Wrap the critical section with a Redlock lock
    const lock = await redlock.lock(`locks:${KEY}`, 2000); // Lock the KEY with a 2-second TTL (adjust TTL as needed)
  
    try {
      var remainingBalance = await getBalanceRedis(redisClient, KEY);
      var charges = getCharges(input.unit);
      const isAuthorized = authorizeRequest(remainingBalance, charges);
      if (!isAuthorized) {
        return {
          remainingBalance,
          isAuthorized,
          charges: 0,
        };
      }
      remainingBalance = await chargeRedis(redisClient, KEY, charges);
      // Modification: Removed the disconnection code
      // await disconnectRedis(redisClient);
      console.log("releasing lock");
      return {
        remainingBalance,
        charges,
        isAuthorized,
      };
    } catch (error) {
      // Handle any errors that occur during the critical section
      console.error("Error during chargeRequestRedis:", error);
      return {
        error: "An error occurred during processing.",
      };
    } finally {
      // Always release the lock after the operation is complete (whether successful or not)
      await lock.unlock();
    }
  };

// Modification: removed the disconnection code
exports.resetRedis = async function () {
    const ret = new Promise((resolve, reject) => {
        redisClient.set(KEY, String(DEFAULT_BALANCE), (err, res) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(DEFAULT_BALANCE);
            }
        });
    });
    //await disconnectRedis(redisClient);
    return ret;
};

// Modification: removed Memcache related code
// exports.resetMemcached = async function () {
//     var ret = new Promise((resolve, reject) => {
//         memcachedClient.set(KEY, DEFAULT_BALANCE, MAX_EXPIRATION, (res, error) => {
//             if (error)
//                 resolve(res);
//             else
//                 reject(DEFAULT_BALANCE);
//         });
//     });
//     return ret;
// };
// Modification: removed Memcache related code
// exports.chargeRequestMemcached = async function (input) {
//     var remainingBalance = await getBalanceMemcached(KEY);
//     const charges = getCharges();
//     const isAuthorized = authorizeRequest(remainingBalance, charges);
//     if (!authorizeRequest(remainingBalance, charges)) {
//         return {
//             remainingBalance,
//             isAuthorized,
//             charges: 0,
//         };
//     }
//     remainingBalance = await chargeMemcached(KEY, charges);
//     return {
//         remainingBalance,
//         charges,
//         isAuthorized,
//     };
// };

// Modification:  Commenting out the following two methods:

// async function getRedisClient() {
//     return new Promise((resolve, reject) => {
//         try {
//             const client = new redis.RedisClient({
//                 host: process.env.ENDPOINT,
//                 port: parseInt(process.env.PORT || "6379"),
//             });
//             client.on("ready", () => {
//                 console.log('redis client ready');
//                 resolve(client);
//             });
//         }
//         catch (error) {
//             reject(error);
//         }
//     });
// }
// async function disconnectRedis(client) {
//     return new Promise((resolve, reject) => {
//         client.quit((error, res) => {
//             if (error) {
//                 reject(error);
//             }
//             else if (res == "OK") {
//                 console.log('redis client disconnected');
//                 resolve(res);
//             }
//             else {
//                 reject("unknown error closing redis connection.");
//             }
//         });
//     });
// }

function authorizeRequest(remainingBalance, charges) {
    return remainingBalance >= charges;
}
// Modification: Ideally getCharges method should take the unit count and per unit cost from inout into account
function getCharges(unit) {
    return DEFAULT_BALANCE / 20 * unit;
}
async function getBalanceRedis(redisClient, key) {
    const res = await util.promisify(redisClient.get).bind(redisClient).call(redisClient, key);
    return parseInt(res || "0");
}
async function chargeRedis(redisClient, key, charges) {
    return util.promisify(redisClient.decrby).bind(redisClient).call(redisClient, key, charges);
}
// Modification: removed Memcache related code
// async function getBalanceMemcached(key) {
//     return new Promise((resolve, reject) => {
//         memcachedClient.get(key, (err, data) => {
//             if (err) {
//                 reject(err);
//             }
//             else {
//                 resolve(Number(data));
//             }
//         });
//     });
// }
// Modification: removed Memcache related code
// async function chargeMemcached(key, charges) {
//     return new Promise((resolve, reject) => {
//         memcachedClient.decr(key, charges, (err, result) => {
//             if (err) {
//                 reject(err);
//             }
//             else {
//                 return resolve(Number(result));
//             }
//         });
//     });
// }
