const bodyFormat = require("./BodyFormat");

const matchType = {
  UNKNOWN: build('UNKNOWN'),
  LOCAL_VAR: build('LOCAL_VAR', [], null, ["rs2"], '$NAME', "runescript"),
  GLOBAL_VAR: build('GLOBAL_VAR', [], null, ["varp", "varn", "vars"], '[NAME]', "varpconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  CONSTANT: build('CONSTANT', [], null, ["constant"], '^NAME', "constants", bodyFormat.VALUE, bodyFormat.NONE),
  LABEL: build('LABEL', ["label"], null, ["rs2"], '[label,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  PROC: build('PROC', ["proc"], null, ["rs2"], '[proc,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  TIMER: build('TIMER', ["timer"], null, ["rs2"], '[timer,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  SOFTTIMER: build('SOFTTIMER', ["softtimer"], null, ["rs2"], '[softtimer,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  QUEUE: build('QUEUE', ["queue"], null, ["rs2"], '[queue,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  SEQ: build('SEQ', ["seq"], null, ["seq"], '[NAME]', "seqconfig", bodyFormat.NONE, bodyFormat.NONE),
  SPOTANIM: build('SPOTANIM', ["spotanim"], null, ["spotanim"], '[NAME]', "spotanimconfig", bodyFormat.BLOCK, bodyFormat.NONE, ["model", "anim"]),
  HUNT: build('HUNT', ["hunt"], null, ["hunt"], '[NAME]', "huntconfig", bodyFormat.BLOCK, bodyFormat.NONE, ["type"]),
  LOC: build('LOC', ["loc"], null, ["loc"], '[NAME]', "locconfig", bodyFormat.BLOCK, bodyFormat.NONE, ["name", "desc", "category"]),
  NPC: build('NPC', ["npc"], null, ["npc"], '[NAME]', "npcconfig", bodyFormat.BLOCK, bodyFormat.NONE, ["name", "desc", "category"]),
  OBJ: build('OBJ', ["namedobj", "obj"], null, ["obj"], '[NAME]', "objconfig", bodyFormat.BLOCK, bodyFormat.NONE, ["name", "desc", "category"]),
  INV: build('INV', ["inv"], null, ["inv"], '[NAME]', "invconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  ENUM: build('ENUM', ["enum"], null, ["enum"], '[NAME]', "enumconfig", bodyFormat.BLOCK, bodyFormat.NONE, ["inputtype", "outputtype"]),
  DBROW: build('DBROW', ["dbrow"], null, ["dbrow"], '[NAME]', "dbrowconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  DBTABLE: build('DBTABLE', ["dbtable"], null, ["dbtable"], '[NAME]', "dbtableconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  INTERFACE: build('INTERFACE', ["interface"], "interface.pack", ["pack"], 'NAME', "interface", bodyFormat.NONE, bodyFormat.NONE),
  PARAM: build('PARAM', ["param"], null, ["param"], '[NAME]', "paramconfig", bodyFormat.BLOCK, bodyFormat.NONE),
  COMMAND: build('COMMAND', [], "engine.rs2", ["rs2"], '[command,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.NONE),
  SYNTH: build('SOUND_SYNTH', ["synth"], "sound.pack", ["synth"], 'NAME', "runescript", bodyFormat.NONE, bodyFormat.NONE),
  WALKTRIGGER: build('WALKTRIGGER', ["walktrigger"], null, ["rs2"], '[walktrigger,NAME]', "runescript", bodyFormat.SIGNATURE, bodyFormat.SIGNATURE),
  IDK: build('IDK', ["idk", "idkit"], null, ["idk"], '[NAME]', "idkconfig", bodyFormat.BLOCK, bodyFormat.NONE, ["type"]),
  MESANIM: build('MESANIM', ["mesanim"], null, ["mesanim"], '[NAME]', "mesanimconfig", bodyFormat.NONE, bodyFormat.NONE),
};

function build(id, types, file, fileTypes, format, language, refBodyFormat = bodyFormat.NONE, decBodyFormat = bodyFormat.NONE, blockInclusionData = []) {
  return {
    id: id,                                 // the ID for this matchType
    types: types,                           // the types corresponding to this matchType (i.e. named_obj, obj => OBJ)
    definitionFile: file,                   // the (single) possible file in which this identifier can be declared
    definitionFiles: fileTypes,             // the possible file types where this identifier can be declared in
    definitionFormat: format,               // the text format for this identifier's declarations
    language: language,                     // what language the match type corresponds to
    blockInclusionData: blockInclusionData, // which data fields will show up in the preview hover text
    referenceBodyFormat: refBodyFormat,     // what hover text format will show up for identifier references
    declarationBodyFormat: decBodyFormat,   // what hover text format will show up for identifier declarations
    responseText: determineRequiredResponseText(refBodyFormat, decBodyFormat) // The responseText needed to build the identifier data
  }
}

function determineRequiredResponseText(bodyFormat1, bodyFormat2) {
  return Math.max(bodyFormat1.text, bodyFormat2.text);
}

module.exports = matchType;
