const axios = require('axios');
const { expect } = require('chai');
const apiBaseUrl = "https://r7z0hdwnh5.execute-api.us-east-1.amazonaws.com/prod";

describe("Test Case: Concurrent Changes - Charge Request Redis", function () {
  // Increase the timeout to 5000 milliseconds (5 seconds)
  this.timeout(5000);
  it("should reflect the correct remaining balance using concurrent transactions", async function () {
    // Define the number of times to perform the charge request operation
    const numberOfChargeRequests = 18;
    // Set initial balance to 100
    await axios.post(`${apiBaseUrl}/reset-redis`);

    // Mock the input payload
    const inputPayload = {
      serviceType: "voice",
      unit: 2,
    };

    // Function to perform the charge request
    async function chargeRequestRedis() {
      try {
        const response = await axios.post(`${apiBaseUrl}/mod-charge-request-redis`, inputPayload);
        return response.data;
      } catch (error) {
        console.log("error");
        console.log(error);
        return false;
      }
    }

    // Perform the charge request multiple times
    const chargeResults = await Promise.all(Array.from({ length: numberOfChargeRequests }, () => chargeRequestRedis()));
    console.log(chargeResults);
    // Assert that isAuthorized=false for 10 transactions, and isAuthorized=true for the rest
    expect(chargeResults.filter(result => result.isAuthorized).length).to.equal(10);
    expect(chargeResults.filter(result => !result.isAuthorized).length).to.equal(8);
  
    
  });
});

// Test Results - Failing with old code
// ========================================
// Test Case: Concurrent Changes - Charge Request Redis
// [
//   { remainingBalance: 40, charges: 10, isAuthorized: true },
//   { remainingBalance: 90, charges: 10, isAuthorized: true },
//   { remainingBalance: -10, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, charges: 10, isAuthorized: true },
//   { remainingBalance: -10, charges: 10, isAuthorized: true },
//   { remainingBalance: 10, charges: 10, isAuthorized: true },
//   { remainingBalance: -10, isAuthorized: false, charges: 0 },
//   { remainingBalance: 50, charges: 10, isAuthorized: true },
//   { remainingBalance: -10, isAuthorized: false, charges: 0 },
//   { remainingBalance: -10, isAuthorized: false, charges: 0 },
//   { remainingBalance: 70, charges: 10, isAuthorized: true },
//   { remainingBalance: -10, isAuthorized: false, charges: 0 },
//   { remainingBalance: 30, charges: 10, isAuthorized: true },
//   { remainingBalance: -10, isAuthorized: false, charges: 0 },
//   { remainingBalance: 80, charges: 10, isAuthorized: true },
//   { remainingBalance: 60, charges: 10, isAuthorized: true },
//   { remainingBalance: -10, isAuthorized: false, charges: 0 },
//   { remainingBalance: 20, charges: 10, isAuthorized: true }
// ]
//     1) should reflect the correct remaining balance using concurrent transactions


//   0 passing (362ms)
//   1 failing

//   1) Test Case: Concurrent Changes - Charge Request Redis
//        should reflect the correct remaining balance using concurrent transactions:

//       AssertionError: expected 11 to equal 10
//       + expected - actual

//       -11
//       +10

// Test Results - Passing with new code
// ========================================
// kaustav@Anonymous-Air assignment % npm run test_concurrent_charge

// > api-test@1.0.0 test_concurrent_charge
// > mocha test_concurrent_charge.js



//   Test Case: Concurrent Changes - Charge Request Redis
// [
//   { remainingBalance: 10, charges: 10, isAuthorized: true },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 60, charges: 10, isAuthorized: true },
//   { remainingBalance: 30, charges: 10, isAuthorized: true },
//   { remainingBalance: 90, charges: 10, isAuthorized: true },
//   { remainingBalance: 0, charges: 10, isAuthorized: true },
//   { remainingBalance: 80, charges: 10, isAuthorized: true },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 20, charges: 10, isAuthorized: true },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 50, charges: 10, isAuthorized: true },
//   { remainingBalance: 40, charges: 10, isAuthorized: true },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 70, charges: 10, isAuthorized: true }
// ]
//     ✔ should reflect the correct remaining balance using concurrent transactions (663ms)


//   1 passing (668ms)

