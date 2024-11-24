const matchType = require("../matching/matchType");

const keywordToId = {};

Object.keys(matchType).forEach(matchTypeId => {
  for (let keyword of (matchType[matchTypeId].types || [])) {
    keywordToId[keyword] = matchTypeId;
  }
});

function dataTypeToMatchId(keyword) {
  return keywordToId[keyword] || matchType.UNKNOWN.id;
}

module.exports = dataTypeToMatchId;
