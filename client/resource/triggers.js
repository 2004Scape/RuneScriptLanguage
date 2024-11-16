const matchType = require("../enum/MatchType");

const runescriptTrigger = {
  PROC: build(matchType.PROC, true),
  LABEL: build(matchType.LABEL, true),
  QUEUE: build(matchType.QUEUE, true),
  SOFTTIMER: build(matchType.SOFTTIMER, true),
  TIMER: build(matchType.TIMER, true),
  AI_TIMER: build(matchType.NPC, false),
  IF_BUTTON: build(matchType.INTERFACE, false),
  IF_CLOSE: build(matchType.INTERFACE, false),
  WALKTRIGGER: build(matchType.WALKTRIGGER, true),
  AI_WALKTRIGGER: build(matchType.NPC, false),
  DEBUGPROC: build(matchType.UNKNOWN, true),
  LOGIN: build(matchType.UNKNOWN, true),
  LOGOUT: build(matchType.UNKNOWN, true),
  TUTORIAL: build(matchType.UNKNOWN, true),
  ADVANCESTAT: build(matchType.UNKNOWN, true),
  MAPZONE: build(matchType.UNKNOWN, true),
  MAPZONEEXIT: build(matchType.UNKNOWN, true),
  ZONE: build(matchType.UNKNOWN, true),
  ZONEEXIT: build(matchType.UNKNOWN, true)
}

const configDuplicates = [
  {startsWith: 'OPNPC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.NPC},
  {startsWith: 'APNPC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.NPC},
  {startsWith: 'AI_APNPC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.NPC},
  {startsWith: 'AI_OPNPC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.NPC},
  {startsWith: 'OPOBJ', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.OBJ},
  {startsWith: 'APOBJ', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.OBJ},
  {startsWith: 'AI_APOBJ', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.OBJ},
  {startsWith: 'AI_OPOBJ', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.OBJ},
  {startsWith: 'OPLOC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.LOC},
  {startsWith: 'APLOC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.LOC},
  {startsWith: 'AI_APLOC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.LOC},
  {startsWith: 'AI_OPLOC', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.LOC},
  {startsWith: 'OPPLAYER', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.UNKNOWN},
  {startsWith: 'APPLAYER', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.UNKNOWN},
  {startsWith: 'AI_APPLAYER', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.UNKNOWN},
  {startsWith: 'AI_OPPLAYER', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.UNKNOWN},
  {startsWith: 'AI_QUEUE', upToNum: 20, includeU: false, includeT: false, defaultMatch: matchType.NPC},
  {startsWith: 'OPHELD', upToNum: 5, includeU: true, includeT: true, includeD: false, defaultMatch: matchType.OBJ},
  {startsWith: 'INV_BUTTON', upToNum: 5, includeU: false, includeT: false, includeD: true, defaultMatch: matchType.INTERFACE},
];

configDuplicates.forEach(dupeDef => {
  for (let i = 1; i <= dupeDef.upToNum; i++) {
    runescriptTrigger[`${dupeDef.startsWith}${i}`] = build(dupeDef.defaultMatch, false);
  }
  if (dupeDef.includeU) runescriptTrigger[`${dupeDef.startsWith}U`] = build(dupeDef.defaultMatch, false);
  if (dupeDef.includeT) runescriptTrigger[`${dupeDef.startsWith}T`] = build(matchType.INTERFACE, false);
  if (dupeDef.includeD) runescriptTrigger[`${dupeDef.startsWith}D`] = build(dupeDef.defaultMatch, false);
});

function build(match, declaration) {
  return {match: match, declaration};
}

module.exports = runescriptTrigger;
