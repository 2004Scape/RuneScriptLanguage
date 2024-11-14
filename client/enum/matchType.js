const bodyFormat = require("./BodyFormat");

const matchType = {
  UNKNOWN: build('UNKNOWN'),
  LOCAL_VAR: build('LOCAL_VAR', [], null, ["rs2"], '$NAME', "runescript"),
  GLOBAL_VAR: build('GLOBAL_VAR', [], null, ["varp", "varn", "vars"], '[NAME]', "varpconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  CONSTANT: build('CONSTANT', [], null, ["constant"], '^NAME', "constants", bodyFormat.VALUE, bodyFormat.NONE),
  LABEL: build('LABEL', ["label"], null, ["rs2"], '[label,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  PROC: build('PROC', ["proc"], null, ["rs2"], '[proc,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  TIMER: build('TIMER', ["timer"], null, ["rs2"], '[timer,NAME]', "runescript", bodyFormat.NONE, bodyFormat.NONE),
  SOFTTIMER: build('SOFTTIMER', ["softtimer"], null, ["rs2"], '[softtimer,NAME]', "runescript", bodyFormat.NONE, bodyFormat.NONE),
  QUEUE: build('QUEUE', ["queue"], null, ["rs2"], '[queue,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  SEQ: build('SEQ', ["seq"], null, ["seq"], '[NAME]', "seqconfig", bodyFormat.NONE, bodyFormat.NONE),
  SPOTANIM: build('SPOTANIM', ["spotanim"], null, ["spotanim"], '[NAME]', "spotanimconfig", bodyFormat.NONE, bodyFormat.NONE),
  HUNT: build('HUNT', ["hunt"], null, ["hunt"], '[NAME]', "huntconfig", bodyFormat.NONE, bodyFormat.NONE),
  LOC: build('LOC', ["loc"], null, ["loc"], '[NAME]', "locconfig", bodyFormat.NONE, bodyFormat.NONE),
  NPC: build('NPC', ["npc"], null, ["npc"], '[NAME]', "npcconfig", bodyFormat.NONE, bodyFormat.NONE),
  OBJ: build('OBJ', ["namedobj", "obj"], null, ["obj"], '[NAME]', "objconfig", bodyFormat.NONE, bodyFormat.NONE),
  INV: build('INV', ["inv"], null, ["inv"], '[NAME]', "invconfig", bodyFormat.NONE, bodyFormat.NONE),
  ENUM: build('ENUM', ["enum"], null, ["enum"], '[NAME]', "enumconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  DBROW: build('DBROW', ["dbrow"], null, ["dbrow"], '[NAME]', "dbrowconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  DBTABLE: build('DBTABLE', ["dbtable"], null, ["dbtable"], '[NAME]', "dbtableconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  INTERFACE: build('INTERFACE', ["interface"], "interface.pack", ["pack"], 'NAME', "interface", bodyFormat.NONE, bodyFormat.NONE),
  PARAM: build('PARAM', ["param"], null, ["param"], '[NAME]', "paramconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  COMMAND: build('COMMAND', [], "engine.rs2", ["rs2"], '[command,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.NONE),
  SYNTH: build('SOUND_SYNTH', ["synth"], "sound.pack", ["synth"], 'NAME', "runescript", bodyFormat.NONE, bodyFormat.NONE),
  WALKTRIGGER: build('WALKTRIGGER', ["walktrigger"], null, ["rs2"], '[walktrigger,NAME]', "runescript", bodyFormat.NONE, bodyFormat.NONE),
  IDK: build('IDK', ["idk", "idkit"], null, ["idk"], '[NAME]', "idkconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  MESANIM: build('MESANIM', ["mesanim"], null, ["mesanim"], '[NAME]', "mesanimconfig", bodyFormat.NONE, bodyFormat.NONE),
};

function build(id, types, file, fileTypes, format, language, refBodyFormat = bodyFormat.NONE, decBodyFormat = bodyFormat.NONE) {
  return {
    id: id,
    types: types, 
    definitionFile: file,
    definitionFiles: fileTypes,
    definitionFormat: format,
    language: language,
    referenceBodyFormat: refBodyFormat,
    declarationBodyFormat: decBodyFormat,
    responseText: determineRequiredResponseText(refBodyFormat, decBodyFormat)
  }
}

function determineRequiredResponseText(bodyFormat1, bodyFormat2) {
  return Math.max(bodyFormat1.text, bodyFormat2.text);
}

module.exports = matchType;
