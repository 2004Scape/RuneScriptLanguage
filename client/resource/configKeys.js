const matchType = require("../matching/matchType");

// === STATIC CONFIG KEY MATCHES ===
const configKeys = {
  table: { match: matchType.DBTABLE },
  huntmode: { match: matchType.HUNT },
}

// === REGEX CONFIG KEY MATCHES ===
const regexConfigKeys = [
  { match: matchType.OBJ, fileTypes: ["inv"], regex: /stock\d+/ },
  { match: matchType.SEQ, fileTypes: ["loc", "npc", "if", "spotanim"], regex: /\w*anim\w*/ },
]

module.exports = { configKeys, regexConfigKeys };
