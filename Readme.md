# Redis Elasticache Transactions with Lambda & API Gateway

This repository contains a cloudformation template consisting of a Lambda and an API Gateway for interacting with Redis Elasticache service in AWS. The Lambda is exposed via the API Gateway.

The test scripts are written in Node.js and use Mocha as the testing framework. Before running the tests, you will need to package the Lambda function and install the necessary dev dependencies. Below are the steps to do so:

## Steps to Package the Lambda Function

1. Clone the repository to your local machine using the following command:
    ```
    git clone <repository_url>
    ```

2. Navigate to the root of the project directory:
    ```
    cd <root_directory>
    ```

3. Install the required dependencies by running:
    ```
    npm install
    ```

4. Package the Lambda function by zipping the necessary files. The Lambda function code is already provided in the appropriate files. You can create a ZIP archive containing the required files and dependencies:

    **For Linux/Mac:**

        
        zip -r Redis-Elasticache-Transactions-with-Lambda.zip *


    **For Windows (using PowerShell):**


        Compress-Archive -Path * -DestinationPath Redis-Elasticache-Transactions-with-Lambda.zip


The `Redis-Elasticache-Transactions-with-Lambda.zip` file now contains the packaged Lambda function ready for deployment.

## Steps to Run the Tests

First, you need to make sure that the packaged  lambda from the previous step and the other related resources (IAM roles, ElasticCache, VPC, Subnet, etc.) are deployed in your AWS account. The deployment steps are not included here.

To run the tests locally, you need to install the development dependencies in your local. Here's how you can run the tests:

1. Navigate to the root of the project directory (if you haven't already):

    ```
    cd <root_directory>
    ```

2. Install the development dependencies by running:

    ```
    npm install --only=dev
    ```

3. Run the test suite using the Mocha testing framework. There are three test suites available for different scenarios:

- To run the test suite for the API endpoints:
  ```
  npm run testapi
  ```

- To run the test suite for concurrent charge requests:
  ```
  npm run test_concurrent_charge
  ```

- To run the test suite for sequential charge requests:
  ```
  npm run test_sequential_charge
  ```

Each test suite will provide feedback on the results of the tests, including any failed test cases.

That's it! You have now successfully packaged the Lambda function and executed the test suites to ensure the charging engine's API Gateway is functioning as expected.

Please note that you may need to configure the test files (test_api.js, test_concurrent_charge.js, test_sequential_charge.js) as per your specific use case and requirements.
