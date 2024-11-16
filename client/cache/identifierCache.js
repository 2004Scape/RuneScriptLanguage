const { LRUCache } = require('./LRUCache');

const cachedItemLimit = 250;

const identifierCache = new LRUCache(cachedItemLimit);
const fileToIdentifierMap = {};

function get(name, match) {
  const key = resolveKey(name, match);
  return (!key) ? null : identifierCache.get(key);
}

function put(name, match, identifier) {
  const key = resolveKey(name, match);
  const fileKey = resolveFileKey(identifier.location.uri);
  if (!key || !fileKey) {
    return null;
  }
  addToFileMap(fileKey, key);
  const evicted = identifierCache.put(key, identifier);
  if (evicted) {
    removeFromFileMap(resolveFileKey(evicted.value.location.uri), evicted.key);
  }
}

function clear() {
  identifierCache.clear();
  fileToIdentifierMap = {};
}

function clearIdentifiersInFile(fileUri) {
  const fileKey = resolveFileKey(fileUri);
  const identifiersInFile = fileToIdentifierMap[fileKey] || new Set();
  identifiersInFile.forEach(key => identifierCache.delete(key));
  delete fileToIdentifierMap[fileKey];
}

function resolveKey(name, match) {
  return (!name || !match) ? null : name + match.id;
}

function resolveFileKey(uri) {
  return (uri) ? uri.path : null;
}

function addToFileMap(fileKey, identifierKey) {
  const identifiersInFile = fileToIdentifierMap[fileKey] || new Set();
  identifiersInFile.add(identifierKey);
  fileToIdentifierMap[fileKey] = identifiersInFile;
}

function removeFromFileMap(fileKey, identifierKey) {
  const identifiersInFile = fileToIdentifierMap[fileKey] || new Set();
  identifiersInFile.delete(identifierKey);
  if (identifiersInFile.size === 0) {
    delete fileToIdentifierMap[fileKey];
  } else {
    fileToIdentifierMap[fileKey] = identifiersInFile;
  }
}

module.exports = { get, put, clear, clearIdentifiersInFile };
