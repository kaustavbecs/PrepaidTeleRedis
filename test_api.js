const axios = require("axios");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const apiBaseUrl = "https://r7z0hdwnh5.execute-api.us-east-1.amazonaws.com/prod";

// Describe the test suite
describe("API Gateway Test Suite", function () {

  // Test the resetRedis endpoint
  describe("resetRedis", function () {
    it("should reset the balance to $100", async function () {
      // Invoke the resetRedis endpoint
      const response = await axios.post(`${apiBaseUrl}/reset-redis`);

      // Assert the reset value
      expect(response.data).to.equal(100);
    });

    // Add more test cases as needed
  });

  // Test the chargeRequestRedis endpoint
  describe("chargeRequestRedis", function () {
    it("when authorized - should return remaining balance, charges, and authorization status", async function () {
      // Mock the input payload
      const inputPayload = {
        serviceType: "voice",
        unit: 10,
      };

      // Invoke the chargeRequestRedis endpoint with the input payload
      const response = await axios.post(`${apiBaseUrl}/charge-request-redis`, inputPayload);

      // Assert the response properties
      expect(response.data).to.have.property("remainingBalance");
      expect(response.data).to.have.property("charges");
      expect(response.data).to.have.property("isAuthorized").to.be.true;
      expect(response.data.remainingBalance).to.equal(50);
    });

    it("when not authorized - should return remaining balance, charges, and authorization status", async function () {
      // Mock the input payload
      const inputPayload = {
        serviceType: "data",
        unit: 1000,
      };

      // Invoke the chargeRequestRedis endpoint with the input payload
      const response = await axios.post(`${apiBaseUrl}/charge-request-redis`, inputPayload);

      // Assert the response properties
      expect(response.data).to.have.property("remainingBalance");
      expect(response.data).to.have.property("charges").to.equal(0);
      expect(response.data).to.have.property("isAuthorized").to.be.false;
    });
    
  });

  
});
