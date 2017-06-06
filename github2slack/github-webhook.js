'use strict';
const converter = require('./id-convert');

// ---------------------------------
// parse content
// ---------------------------------
module.exports.isIssue = (contents) =>
    contents.issue;

module.exports.action = (contents) =>
    contents.action;

module.exports.merged = (contents) =>
    contents.pull_request.merged;

module.exports.mergedBranch = (contents) =>
    contents.pull_request.head.ref;

module.exports.closeStatus = (contents) =>
    this.merged(contents) ? 'merged' : 'closed';

module.exports.repositoryUrl = (contents) =>
    contents.repository.clone_url;

module.exports.repositoryName = (contents) =>
    contents.repository.name;

module.exports.repositoryFullName = (contents) =>
    contents.repository.full_name;

module.exports.repositoryTitle = (contents) =>
    `【\<${contents.repository.html_url}|${this.repositoryName(contents)}>】`;

module.exports.pullRequestTitle = (contents) =>
    `${this.repositoryTitle(contents)}\<${contents.pull_request.html_url}|${contents.pull_request.title}>`;

module.exports.pullRequestBody = (contents) =>
    converter.replaceIds(contents.pull_request.body);

module.exports.issueTitle = (contents) =>
    `${this.repositoryTitle(contents)}\<${contents.issue.html_url}|${contents.issue.title}>`;

module.exports.sender = (contents) =>
    `\<${contents.sender.html_url}|${contents.sender.login}>`;

module.exports.assignee = (contents) =>
    converter.replaceId(`@${contents.assignee.login}`);

module.exports.reviewer = (contents) =>
    converter.replaceId(`@${contents.requested_reviewer.login}`);

module.exports.comment = (contents) =>
    contents.comment;

module.exports.issueCommentTitle = (contents) =>
    `${this.repositoryTitle(contents)}\<${contents.comment.html_url}|${contents.issue.title}>`;

module.exports.pullRequestCommentTitle = (contents) =>
    `${this.repositoryTitle(contents)}\<${contents.comment.html_url}|${contents.pull_request.title}>`;

module.exports.commentBody = (comment) =>
    converter.replaceIds(comment.body);

module.exports.reviewee = (contents) =>
    converter.replaceId(contents.pull_request.user.login);

module.exports.reviewState = (contents) =>
    contents.review.state;

module.exports.reviewBody = (contents) =>
    converter.replaceIds(contents.review.body);
