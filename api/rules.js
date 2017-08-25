

var noCaseSyntax = /NC/;
var lastSyntax = /L/;
var redirectSyntax = /R=?(\d+)?/;
var forbiddenSyntax = /F/;
var goneSyntax = /G/;
var hostSyntax =  /H=([^,]+)/;
var flagSyntax = /\[([^\]]+)]$/;
var partsSyntax = /\s+|\t+/g;
var querySyntax = /\?(.*)/;

/**
 * Get flags from rule rules
 *
 * @param {Array.<rules>} rules
 * @return {Object}
 * @api private
 */
const parseRules = function(unparsedRules) {
    return (unparsedRules || []).map(function (rule) {
      // Reset all regular expression indexes
      lastSyntax.lastIndex = 0;
      redirectSyntax.lastIndex = 0;
      forbiddenSyntax.lastIndex = 0;
      goneSyntax.lastIndex = 0;
      hostSyntax.lastIndex = 0;

      var parts = rule.replace(partsSyntax, ' ').split(' '), flags = '';
  
      if (flagSyntax.test(rule)) {
        flags = flagSyntax.exec(rule)[1];
      }
  
      // Check inverted urls
      var inverted = parts[0].substr(0, 1) === '!';
      if (inverted) {
        parts[0] = parts[0].substr(1);
      }
  
      var redirectValue = redirectSyntax.exec(flags);
      var hostValue = hostSyntax.exec(flags);

      return {
        regexp: typeof parts[2] !== 'undefined' && noCaseSyntax.test(flags) ? new RegExp(parts[0], 'i') : new RegExp(parts[0]),
        replace: parts[1],
        inverted: inverted,
        last: lastSyntax.test(flags),
        redirect: redirectValue ? (typeof redirectValue[1] !== 'undefined' ? redirectValue[1] : 301) : false,
        forbidden: forbiddenSyntax.test(flags),
        gone: goneSyntax.test(flags),
        host: hostValue ? new RegExp(hostValue[1]) : false
      };
    });
  };
  module.exports.parseRules = parseRules;
  
  const loadRules = function() {
    console.log("Loading rules");
    return require('../rules.json');
  }
  module.exports.loadRules = loadRules;
  