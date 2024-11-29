const matchType = require('../matching/matchType');
const search = require('./searchSvc');
const identifierCache = require('../cache/identifierCache');
const engineCommands = require('../resource/engineCommands');
const identifierFactory = require('../resource/identifierFactory');

async function get(word, match, fileUri) {
  if (match.id === matchType.COMMAND.id) {
    if (engineCommands.commands[word] && !engineCommands.commands[word].location) {
      const commandWithLocation = await search.findDeclaration(word, match, fileUri);
      if (commandWithLocation) engineCommands.addLocation(commandWithLocation.location.uri);
    }
    return engineCommands.commands[word];
  }

  const cachedIdentifier = identifierCache.get(word, match);
  if (cachedIdentifier) {
    return cachedIdentifier;
  }

  const result = await search.findDeclaration(word, match, fileUri);
  if (!result) {
    return null;
  }
  
  const identifier = identifierFactory.build(word, match, result.location, result.info, result.text);
  identifierCache.put(word, match, identifier);
  return identifier;
}

module.exports = { get };
