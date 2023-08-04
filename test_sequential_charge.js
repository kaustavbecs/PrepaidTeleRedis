const axios = require('axios');
const { expect } = require('chai');
const apiBaseUrl = "https://r7z0hdwnh5.execute-api.us-east-1.amazonaws.com/prod";

describe("Test Case: Sequential Changes - Charge Request Redis", function () {
    // Increase the timeout to accommodate sequential API calls
    this.timeout(10000);
  
    it("should reflect the correct remaining balance using sequential transactions", async function () {
      // Define the number of times to perform the charge request operation
      const numberOfChargeRequests = 18;
      // Set initial balance to 100
      await axios.post(`${apiBaseUrl}/reset-redis`);
  
      // Mock the input payload
      const inputPayload = {
        serviceType: "voice",
        unit: 2,
      };
  
      // Function to perform the charge request sequentially
      async function chargeSequentially(index) {
        if (index >= numberOfChargeRequests) {
          return [];
        }
  
        try {
          const response = await axios.post(`${apiBaseUrl}/charge-request-redis`, inputPayload);
          const chargeResult = response.data;
          const remainingResults = await chargeSequentially(index + 1);
          return [chargeResult, ...remainingResults];
        } catch (error) {
          return [];
        }
      }
  
      // Perform the charge requests sequentially
      const chargeResults = await chargeSequentially(0);
      console.log(chargeResults);
  
      // Assert that isAuthorized=false for 10 transactions, and isAuthorized=true for the rest
      expect(chargeResults.filter((result) => result.isAuthorized).length).to.equal(10);
      expect(chargeResults.filter((result) => !result.isAuthorized).length).to.equal(8);
    });
  });

  // Test Case - Passing
  // =====================
//   kaustav@Anonymous-Air assignment % npm run test_sequential_charge

// > api-test@1.0.0 test_sequential_charge
// > mocha test_sequential_charge.js



//   Test Case: Sequential Changes - Charge Request Redis
// [
//   { remainingBalance: 90, charges: 10, isAuthorized: true },
//   { remainingBalance: 80, charges: 10, isAuthorized: true },
//   { remainingBalance: 70, charges: 10, isAuthorized: true },
//   { remainingBalance: 60, charges: 10, isAuthorized: true },
//   { remainingBalance: 50, charges: 10, isAuthorized: true },
//   { remainingBalance: 40, charges: 10, isAuthorized: true },
//   { remainingBalance: 30, charges: 10, isAuthorized: true },
//   { remainingBalance: 20, charges: 10, isAuthorized: true },
//   { remainingBalance: 10, charges: 10, isAuthorized: true },
//   { remainingBalance: 0, charges: 10, isAuthorized: true },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 },
//   { remainingBalance: 0, isAuthorized: false, charges: 0 }
// ]
//     ✔ should reflect the correct remaining balance using sequential transactions (1700ms)


//   1 passing (2s)
  