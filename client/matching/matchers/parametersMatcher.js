const { commands } = require('../../resource/engineCommands');
const matchType = require('../matchType');
const identifierSvc = require('../../service/identifierSvc');
const { reference, getWordAtIndex } = require("../../utils/matchUtils");

// Looks for matches of values inside of parenthesis
// This includes engine command parameters, proc parameters, label parameters, and queue parameters
async function parametersMatcher(context) {
  if (context.fileType !== 'rs2') {
    return null;
  }
  const { identifierName, paramIndex } = parseForIdentifierNameAndParamIndex(context);
  if (!identifierName) {
    return null;
  }
  const name = identifierName.value;
  const prev = context.line.charAt(identifierName.start - 1);
  let identifier;
  if (name === 'queue') {
    if (paramIndex === 0) return reference(matchType.QUEUE);
    if (paramIndex === 1) return matchType.UNKNOWN;
    const queueName = getWordAtIndex(context.words, identifierName.end + 2);
    if (!queueName) return matchType.UNKNOWN;
    identifier = await identifierSvc.get(queueName.value, matchType.QUEUE);
  } else if (prev === '@') {
    identifier = await identifierSvc.get(name, matchType.LABEL);
  } else if (prev === '~') {
    identifier = await identifierSvc.get(name, matchType.PROC);
  } else {
    identifier = commands[name];
  }
  if (!identifier || !identifier.signature || identifier.signature.params.length <= paramIndex) {
    return null;
  }
  return reference(matchType[identifier.signature.params[paramIndex].matchTypeId]);
}

function parseForIdentifierNameAndParamIndex(context) {
  const str = context.line;
  let isInString = false;
  let isInParams = false;
  let paramIndex = 0;
  for (let i = context.index; i >= 0; i--) {
    if (isInString) {
      if (str.charAt(i) === '"') isInString = false;
      continue;
    }
    else if (str.charAt(i) === '"') {
      isInString = true;
      continue;
    }

    if (isInParams) {
      if (str.charAt(i) === '(') isInParams = false;
      continue;
    }
    else if (str.charAt(i) === ')') {
      isInParams = true;
      continue;
    }

    if (str.charAt(i) === ',') {
      paramIndex++;
    } else if (str.charAt(i) === '(') {
      return {identifierName: getWordAtIndex(context.words, i - 1), paramIndex: paramIndex};
    }
  }
  return null;
}

module.exports = parametersMatcher;
