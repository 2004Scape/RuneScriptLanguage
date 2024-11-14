const bodyFormat = require('../enum/BodyFormat');
const matchType = require('../enum/MatchType');
const stringUtils = require('../utils/stringUtils');
const search = require('../utils/searchUtils');
const identifierCache = require('../cache/identifierCache');

async function get(word, match, fileUri) {
  const cachedIdentifier = identifierCache.get(word, match);
  if (cachedIdentifier) {
    return cachedIdentifier;
  }

  const result = await search.findDefinition(word, match, fileUri);
  if (!result) {
    return null;
  }
  const identifier = parseDefinitionResult(word, match, result.text, result.location, result.desc);
  identifierCache.put(word, match, identifier);
  return identifier;
}

function parseDefinitionResult(word, match, text, location, desc) {
  switch(match.id) {
    case matchType.GLOBAL_VAR.id: return parseGlobalVar(word, text, location, desc); 
    default: return parseDefault(word, match, text, location, desc);
  }
}

function parseGlobalVar(word, text, location, desc) {
  const fileType = location.uri.path.split(/[#?]/)[0].split('.').pop().trim() || 'varp';
  return build(word, location, null, null, desc, fileType, text);
}

function parseDefault(word, match, text, location, desc) {
  const identifier = build(word, location, null, null, desc, null, null);
  if (match.declarationBodyFormat === bodyFormat.SIGNATURE || match.referenceBodyFormat === bodyFormat.SIGNATURE) {
    const { params, returns } = parseSignature(stringUtils.getLineText(text));
    identifier.params = params;
    identifier.paramsText = buildParamsText(params);
    identifier.returns = returns;
    if (match.id === matchType.QUEUE.id) {
      identifier.params.unshift({}, {}); // queue(name, delay, ...) => custom params start at index 2
    }
  }
  if (match.declarationBodyFormat === bodyFormat.BLOCK || match.referenceBodyFormat === bodyFormat.BLOCK) {
    identifier.block = text;
  }
  if (match.declarationBodyFormat === bodyFormat.VALUE || match.referenceBodyFormat === bodyFormat.VALUE) {
    identifier.value = stringUtils.getLineText(text);
  }
  return identifier;
}

function parseSignature(line) {
   // Parse input params
  const params = [];
  let openingIndex = line.indexOf('(');
  let closingIndex = line.indexOf(')');
  if (openingIndex >= 0 && closingIndex >= 0 && ++openingIndex !== closingIndex) {
    line.substring(openingIndex, closingIndex).split(',').forEach(param => {
      if (param.startsWith(' ')) param = param.substring(1);
      const split = param.split(' ');
      if (split.length === 2) {
        const match = Object.keys(matchType).filter(key => (matchType[key].types || []).includes(split[0]));
        params.push({type: split[0], name: split[1], matchType: match.length > 0 ? matchType[match[0]] : matchType.UNKNOWN});
      }
    });
  }

  // Parse response type
  let returns = '';
  line = line.substring(closingIndex + 1);
  openingIndex = line.indexOf('(');
  closingIndex = line.indexOf(')');
  if (openingIndex >= 0 && closingIndex >= 0 && ++openingIndex !== closingIndex) {
    returns = line.substring(openingIndex, closingIndex);
  }

  return { params: params, returns: returns };
}

function buildParamsText(params) {
  return (Array.isArray(params) && params.length > 0) ? params.map(param => `${param.type} ${param.name}`).join(', ') : '';
}

function build(name, location, params, returns, description, value, block) {
  return {
    name: name || '',
    location: location || null,
    params: params || [],
    paramsText: buildParamsText(params) || '',
    returns: returns || '',
    description: description || '',
    value: value || '',
    block: block || ''
  }
}

module.exports = { get, build, parseSignature };
