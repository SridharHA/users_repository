/** 
 * Lambda Function that would do the following:
 * 1. Read the data from API gateway
 * 2. Fetch records from dynamodb based on roles
 * 3. Return the successful records or error codes to caller.
 */
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event, context) => {
    // 
    console.log(event.queryStringParameters.email);
    console.log(event.queryStringParameters.role);

    // Header for response method
    let headers = {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Credentials": true,
        "Accept": "*/"
    }

    // fetch the records from db with email address and role.
    var params = {
        TableName: 'user-table',
        KeyConditionExpression: "#partitionKey = :partitionKeyValue and #sortKey = :sortKeyValue",
        ExpressionAttributeNames: {
            "#partitionKey": "email_address",
            "#sortKey": "role"
        },
        ExpressionAttributeValues: {
            ":partitionKeyValue": event.queryStringParameters.email,
            ":sortKeyValue": event.queryStringParameters.role
        }
    }
    let getRecords = new Promise((resolve, reject) => {
        console.log("params", params)
        docClient.query(params, async function (err, data) {
            let status;
            if (err) {
                console.log(err.message); // an error occurred
                status = {
                    code: 500,
                    msg: err.message
                }
                resolve(status);
            }
            else {
                status = {
                    code: 200,
                    msg: data.Items
                }
                resolve(status);
            }
        });
    });
    let getRecordsResult = await getRecords;
    console.log("user result", getRecordsResult);

   /** 
 * 1. Check incoming role is matching role present in db
 * 2. if the role is general then send the records of that user
 * 3. if the role is admin then send the records of all users
 * 3. Return the successful records or error codes to caller.
 */
    if ((getRecordsResult.msg.length>0) && (event.queryStringParameters.role.toLowerCase() == getRecordsResult.msg[0].role.toLowerCase())) {
        if (event.queryStringParameters.role.toLowerCase() == 'general') {
            return {
                statusCode: getRecordsResult.code,
                headers: headers,
                body: JSON.stringify(
                    {
                        message: getRecordsResult.msg
                    },
                    null,
                    2
                ),
            };
        }

        else {


            var adminparams = {
                TableName: 'user-table'
            }
            let getAdminRecords = new Promise((resolve, reject) => {
                console.log("params", adminparams)
                docClient.scan(adminparams, async function (err, data) {
                    let status;
                    if (err) {
                        console.log(err.message); // an error occurred
                        status = {
                            code: 500,
                            msg: err.message
                        }
                        resolve(status);
                    }
                    else {
                        status = {
                            code: 200,
                            msg: data.Items
                        }
                        resolve(status);
                    }
                });
            });
            let getAdminRecordsResult = await getAdminRecords;
            console.log("Admin status result", getAdminRecordsResult);

            return {
                statusCode: getAdminRecordsResult.code,
                headers: headers,
                body: JSON.stringify(
                    {
                        message: getAdminRecordsResult.msg
                    },
                    null,
                    2
                ),
            };

        }
    }
    else {
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify(
                {
                    message: 'Role is not matching to the user'
                },
                null,
                2
            ),
        };

    }

}