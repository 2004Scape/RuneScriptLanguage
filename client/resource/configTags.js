const matchType = require("../enum/MatchType");

const configTags = {
  PARAM: build(matchType.PARAM),
  TABLE: build(matchType.DBTABLE),
  HUNTMODE: build(matchType.HUNT),
}

// the tag will be converted toUpperCase, so consider that when making the regex
const regexTags = [
  build(matchType.OBJ, ["inv"], /STOCK\d+/),
  build(matchType.SEQ, ["loc", "npc", "if", "spotanim"], /\w*ANIM\w*/),
]

function build(match, fileTypes = [], regex) {
  return {match: match, fileTypes: fileTypes, regex: regex};
}

module.exports = { configTags, regexTags };
