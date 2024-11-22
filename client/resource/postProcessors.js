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

module.exports = { queuePostProcessor, coordPostProcessor };
