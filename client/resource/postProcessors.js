const matchConfigKeyInfo = require('../info/configKeyInfo');
const matchTriggerInfo = require('../info/triggerInfo');
const { getLineText } = require('../utils/stringUtils');

// Post processors are used for any additional post modification needed for a matchType, after an identifier has been built  
// postProcessors must be a function which takes indentifier as an input, and directly modifies that identifier as necessary 

const queuePostProcessor = function(identifier) {
  identifier.signature.params.unshift({}, {}); // Custom queue params start at index 2
}

const coordPostProcessor = function(identifier) {
  const coordinates = identifier.name.split('_');
  const xCoord = Number(coordinates[1] << 6) + Number(coordinates[3]);
  const zCoord = Number(coordinates[2] << 6) + Number(coordinates[4]);
  identifier.value = `Absolute coordinates: (${xCoord}, ${zCoord})`;
}

const enumPostProcessor = function(identifier) {
  const inputtypeLine = getLineText(identifier.block.substring(identifier.block.indexOf("inputtype=")));
  const outputtypeLine = getLineText(identifier.block.substring(identifier.block.indexOf("outputtype=")));
  identifier.extraData = {inputType: inputtypeLine.substring(10), outputType: outputtypeLine.substring(11)};
}

const paramPostProcessor = function(identifier) {
  const typeLine = getLineText(identifier.block.substring(identifier.block.indexOf("type=")));
  identifier.extraData = {dataType: typeLine.substring(5)};
}

const configKeyPostProcessor = function(identifier) {
  const info = matchConfigKeyInfo(identifier.name, identifier.fileType);
  info ? identifier.info = info : identifier.hideDisplay = true;
}

const triggerPostProcessor = function(identifier) {
  const info = matchTriggerInfo(identifier.name, identifier.extraData.triggerName);
  if (info) identifier.info = info;
}

const categoryTriggerPostProcessor = function(identifier) {
  const extraData = identifier.extraData;
  if (extraData && extraData.matchId && extraData.categoryName) {
    identifier.value = `This script applies to all <b>${identifier.extraData.matchId}</b> with \`category=${identifier.extraData.categoryName}\``;
  }
}

module.exports = { 
  queuePostProcessor, coordPostProcessor, enumPostProcessor, paramPostProcessor, configKeyPostProcessor, 
  triggerPostProcessor, categoryTriggerPostProcessor
};
