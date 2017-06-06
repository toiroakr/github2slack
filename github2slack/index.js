'use strict';
const slack = require('./slack');
const webhook = require('./github-webhook');
const lambda = require('./lambda');

// ---------------------------------
// main process
// ---------------------------------
const postPullRequestEvent = (contents) => {
    const title = webhook.pullRequestTitle(contents);
    const sender = webhook.sender(contents);

    switch (contents.action) {
        case 'opened':
            return slack.postOpenEvent(
                `Pull request opened by ${sender} in ${webhook.repositoryTitle(contents)}`,
                title,
                webhook.pullRequestBody(contents)
            );
        case 'closed':
            slack.postNotification(`Pull request: ${title} ${webhook.closeStatus(contents)} by ${sender}`);
            lambda.deleteBranch(contents);
            return;
        case 'assigned':
            return slack.postNotification(`${webhook.assignee(contents)} assigned to pull request: ${title} by ${sender}`);
        case 'review_requested':
            return slack.postNotification(`${webhook.reviewer(contents)} is requested to review pull request: ${title} by ${sender}`);
        case 'created':
            return slack.postComment(
                sender,
                webhook.pullRequestCommentTitle(contents),
                webhook.comment(contents)
            );
        case 'submitted':
            return slack.postReview(
                sender,
                webhook.reviewState(contents),
                webhook.reviewBody(contents),
                title,
                webhook.reviewee(contents)
            );
        default:
            return
    }
};

const postIssueEvent = (contents) => {
    const title = webhook.issueTitle(contents);
    const sender = webhook.sender(contents);
    switch (webhook.action(contents)) {
        case 'opened':
            return slack.postNotification(`Issue: ${title} reported by ${sender}`);
        case 'closed':
            return slack.postNotification(`Issue: ${title} closed by ${sender}`);
        case 'assigned':
            return slack.postNotification(`${webhook.assignee(contents)} assigned to issue: ${title} by ${sender}`);
        case 'created':
            return slack.postComment(
                sender,
                webhook.issueCommentTitle(contents),
                webhook.comment(contents)
            );
        default:
            return
    }
};

// ---------------------------------
// catch request
// ---------------------------------
exports.handler = function (event, context) {
    console.log(JSON.stringify(event));

    slack.init(webhook.repositoryFullName(event));
    if (webhook.isIssue(event)) {
        postIssueEvent(event);
    } else {
        postPullRequestEvent(event);
    }
};
