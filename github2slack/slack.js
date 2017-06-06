'use strict';
const webhook = require("./github-webhook");
const Slack = require('slack-node');

// ---------------------------------
// variables
// ---------------------------------
let slack;
let notification_ch;
let comment_ch;

module.exports.init = (repositoryFullName) => {
    const repositories = require('./config.json').repositories;
    repositories.some((repository) => {
        if (repositoryFullName.match(new RegExp(repository.name))) {
            slack = new Slack(process.env[repository.token_id]);
            notification_ch = repository.notification;
            comment_ch = repository.comment;
            return true;
        }
    });
};

// ---------------------------------
// post message to Slack
// ---------------------------------
const post = (channel, message, attach_title, attach_text) => {
    const content = {
        channel: channel,
        icon_emoji: ':octocat:',
        username: 'github',
        link_names: 1,
        text: message,
        attachments: attach_text ? JSON.stringify([{
            title: attach_title,
            text: attach_text,
            mrkdwn_in: ["text"]
        }]) : null,
    };
    console.log(JSON.stringify(content));
    slack.api(
        'chat.postMessage',
        content,
        (err, response) => {
            console.log(err);
            console.log(response);
        }
    )
};

module.exports.postNotification = (message) => {
    post(notification_ch, message, null, null);
};

module.exports.postOpenEvent = (message, attach_title, attach_text) => {
    return post(notification_ch, message, attach_title, attach_text);
};

module.exports.postComment = (sender, title, comment) => {
    comment ? post(comment_ch, `${sender} commented;`, title, webhook.commentBody(comment)) : null;
};

module.exports.postReview = (sender, state, body, title, reviewee) => {
    let message;
    switch (state) {
        case 'commented':
            message = `${sender} posted review on ${title};`;
            break;
        case 'approved':
            message = `${sender} approved pull request: ${title};`;
            break;
        case 'changes_requested':
            message = `${sender} requested ${reviewee} to change pull request: ${title};`;
            break;
        default:
            return
    }
    post(
        comment_ch,
        message,
        title,
        body
    );
};
