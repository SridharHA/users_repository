const AWS = require('aws-sdk-mock');
const assert = require('chai').assert;
const app = require('../index');

describe("Get Users Data", function () {
    it("test case for db query success for specific user", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",role: "General"}};

        let response = {
            Items: [{ name: "Sridhar", role: "General", created_date:"12/02/2021",email_address:"abc@gmail.com"}]
        }

        AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
            callback(null, response);
        });
        const result = await app.handler(data);
        assert.equal(result.statusCode, 200)
        AWS.restore('DynamoDB.DocumentClient');
    })

    it("test case for db query failure for specific user", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",role: "General"}};

        let response = {
            message: []
        }

        AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
            callback(response,null);
        });
        const result = await app.handler(data);
        assert.equal(result.statusCode, 500)
        AWS.restore('DynamoDB.DocumentClient');
    })

    it("test case for db query success but invalid role", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",role: "General"}};

        let response = {
            Items: [{ name: "Sridhar", role: "Admin", created_date:"12/02/2021",email_address:"abc@gmail.com"}]
        }

        AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
            callback(null, response);
        });
        const result = await app.handler(data);
        assert.equal(result.statusCode, 500)
        AWS.restore('DynamoDB.DocumentClient');
    })


    
    it("test case for db scan success for admin", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",role: "Admin"}};

        let response = {
            Items: [{ name: "Sridhar", role: "Admin", created_date:"12/02/2021",email_address:"abc@gmail.com"}]
        }

        let responseForAdmin = {
            Items: [{ name: "Sridhar", role: "Admin", created_date:"12/02/2021",email_address:"abc@gmail.com"},
            { name: "Sridhar H A", role: "General", created_date:"12/03/2021",email_address:"sridhar@gmail.com"}]
        }

        AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
            callback(null, response);
        });

        AWS.mock('DynamoDB.DocumentClient', 'scan', function (params, callback) {
            callback(null, responseForAdmin);
        });
        const result = await app.handler(data);
        assert.equal(result.statusCode, 200)
        AWS.restore('DynamoDB.DocumentClient');
    })

    it("test case for db scan failure for admin", async () => {
        let data = { queryStringParameters: { email: "abc@gmail.com",role: "Admin"}};

        let response = {
            Items: [{ name: "Sridhar", role: "Admin", created_date:"12/02/2021",email_address:"abc@gmail.com"}]
        }

        let responseForAdmin = {
                message: []
        }

        AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback) {
            callback(null, response);
        });

        AWS.mock('DynamoDB.DocumentClient', 'scan', function (params, callback) {
            callback(responseForAdmin,null);
        });
        const result = await app.handler(data);
        assert.equal(result.statusCode, 500)
        AWS.restore('DynamoDB.DocumentClient');
    })
})