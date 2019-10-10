'use strict';

const RuleSet = require('./api/rules.js');

let ruleSet = new RuleSet();

module.exports.handler = (e, ctx, cb) => {
  return ruleSet
    .loadRules()
    .then(() => {
      cb(null,ruleSet.applyRules(e).res);
    });
};

// Testing with serverless offline
// module.exports.test = (e, context, callback) => {
//   ruleSet.loadRules()
//     .then(() => {
//       callback(null,{
//         "statusCode": 200,
//         "body": JSON.stringify(ruleSet.applyRules(JSON.parse(e.body)).res)
//       }); 
//   });
// };