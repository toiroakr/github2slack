"use strict";
const webhook = require('./github-webhook');
const slack = require('./slack');
const aws = require('aws-sdk');

module.exports.deleteBranch = (contents) => {
    const merged = webhook.mergedBranch(contents);
    if(merged === 'master' || merged === 'develop'){
        return;
    }

    const lambda = new aws.Lambda({apiVersion: '2015-03-31'});
    const payload = {
        "repositoryName": webhook.repositoryName(contents),
        "remoteUrl": webhook.repositoryUrl(contents),
        "branchName": merged
    };
    console.log(payload);
    const params = {
        FunctionName: "jGit",
        InvocationType: "Event",
        LogType: "Tail",
        Payload: JSON.stringify(payload, null, ' ')
    };
    lambda.invoke(params, (err, data) => {
        if (err) {
            console.log(err);
            slack.postNotification(`failed to delete branch: ${payload.branchName}`);
        }
        console.log(`end with response ${JSON.stringify(data)}`);
    });
};
