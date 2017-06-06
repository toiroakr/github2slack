'use strict';
const idPairs = require('./config.json').accounts;

// ---------------------------------
// replace id from Github to Slack
// ---------------------------------
module.exports.replaceId = (target) => {
    idPairs.some(account => {
        if (target.match(new RegExp(account.github, "m"))) {
            target = `@${account.slack}`;
            return true;
        }
    });
    return target;
};

module.exports.replaceIds = (target) => {
    idPairs.forEach(account => {
        target = target.replace(new RegExp(`@${account.github}`, 'gm'), `@${account.slack}`);
    });
    return target.replace(/#+ ([^\r\n]*)/g, "*$1* ");
};
