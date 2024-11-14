const bodyFormat = require("./BodyFormat");

const matchType = {
  UNKNOWN: build('UNKNOWN'),
  LOCAL_VAR: build('LOCAL_VAR', [], null, ["rs2"], '$NAME'),
  GLOBAL_VAR: build('GLOBAL_VAR', [], null, ["varp", "varn", "vars"], '[NAME]', bodyFormat.BLOCK, bodyFormat.NONE),
  CONSTANT: build('CONSTANT', [], null, ["constant"], '^NAME', bodyFormat.VALUE, bodyFormat.NONE),
  LABEL: build('LABEL', ["label"], null, ["rs2"], '[label,NAME]', bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  PROC: build('PROC', ["proc"], null, ["rs2"], '[proc,NAME]', bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  TIMER: build('TIMER', ["timer"], null, ["rs2"], '[timer,NAME]', bodyFormat.NONE, bodyFormat.NONE),
  SOFTTIMER: build('SOFTTIMER', ["softtimer"], null, ["rs2"], '[softtimer,NAME]', bodyFormat.NONE, bodyFormat.NONE),
  QUEUE: build('QUEUE', ["queue"], null, ["rs2"], '[queue,NAME]', bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  SEQ: build('SEQ', ["seq"], null, ["seq"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
  SPOTANIM: build('SPOTANIM', ["spotanim"], null, ["spotanim"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
  HUNT: build('HUNT', ["hunt"], null, ["hunt"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
  LOC: build('LOC', ["loc"], null, ["loc"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
  NPC: build('NPC', ["npc"], null, ["npc"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
  OBJ: build('OBJ', ["namedobj", "obj"], null, ["obj"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
  INV: build('INV', ["inv"], null, ["inv"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
  ENUM: build('ENUM', ["enum"], null, ["enum"], '[NAME]', bodyFormat.BLOCK, bodyFormat.NONE),
  DBROW: build('DBROW', ["dbrow"], null, ["dbrow"], '[NAME]', bodyFormat.BLOCK, bodyFormat.NONE),
  DBTABLE: build('DBTABLE', ["dbtable"], null, ["dbtable"], '[NAME]', bodyFormat.BLOCK, bodyFormat.NONE),
  INTERFACE: build('INTERFACE', ["interface"], "interface.pack", ["pack"], 'NAME', bodyFormat.NONE, bodyFormat.NONE),
  PARAM: build('PARAM', ["param"], null, ["param"], '[NAME]', bodyFormat.BLOCK, bodyFormat.NONE),
  COMMAND: build('COMMAND', [], "engine.rs2", ["rs2"], '[command,NAME]', bodyFormat.SIGNATURE, bodyFormat.NONE),
  SYNTH: build('SOUND_SYNTH', ["synth"], "sound.pack", ["synth"], 'NAME', bodyFormat.NONE, bodyFormat.NONE),
  WALKTRIGGER: build('WALKTRIGGER', ["walktrigger"], null, ["rs2"], '[walktrigger,NAME]', bodyFormat.NONE, bodyFormat.NONE),
  IDK: build('IDK', ["idk", "idkit"], null, ["idk"], '[NAME]', bodyFormat.BLOCK, bodyFormat.NONE),
  MESANIM: build('MESANIM', ["mesanim"], null, ["mesanim"], '[NAME]', bodyFormat.NONE, bodyFormat.NONE),
};

function build(id, types, file, fileTypes, format, refBodyFormat = bodyFormat.NONE, decBodyFormat = bodyFormat.NONE) {
  return {
    id: id,
    types: types, 
    definitionFile: file,
    definitionFiles: fileTypes,
    definitionFormat: format,
    referenceBodyFormat: refBodyFormat,
    declarationBodyFormat: decBodyFormat,
    responseText: determineRequiredResponseText(refBodyFormat, decBodyFormat)
  }
}

function determineRequiredResponseText(bodyFormat1, bodyFormat2) {
  return Math.max(bodyFormat1.text, bodyFormat2.text);
}

module.exports = matchType;
