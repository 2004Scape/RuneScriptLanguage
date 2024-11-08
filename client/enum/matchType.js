const matchType = {
  UNKNOWN: {id: 'UNKNOWN'},
  LOCAL_VAR: {id: 'LOCAL_VAR', definitionFiles: ["rs2"], definitionFormat: '$NAME'},
  GLOBAL_VAR: {id: 'GLOBAL_VAR', definitionFiles: ["varp", "varn", "vars"], definitionFormat: '[NAME]', previewDeclaration: true},
  CONSTANT: {id: 'CONSTANT', definitionFiles: ["constant"], definitionFormat: '^NAME', previewDeclaration: true},
  LABEL: {id: 'LABEL', definitionFiles: ["rs2"], definitionFormat: '[label,NAME]', previewDeclaration: true},
  PROC: {id: 'PROC', definitionFiles: ["rs2"], definitionFormat: '[proc,NAME]', previewDeclaration: true},
  TIMER: {id: 'TIMER', definitionFiles: ["rs2"], definitionFormat: '[timer,NAME]'},
  SOFTTIMER: {id: 'SOFTTIMER', definitionFiles: ["rs2"], definitionFormat: '[softtimer,NAME]'},
  QUEUE: {id: 'QUEUE', definitionFiles: ["rs2"], definitionFormat: '[queue,NAME]', previewDeclaration: true},
  SEQ: {id: 'SEQ', definitionFiles: ["seq"], definitionFormat: '[NAME]'},
  SPOTANIM: {id: 'SPOTANIM', definitionFiles: ["spotanim"], definitionFormat: '[NAME]'},
  HUNT: {id: 'HUNT', definitionFiles: ["hunt"], definitionFormat: '[NAME]'},
  LOC: {id: 'LOC', definitionFiles: ["loc"], definitionFormat: '[NAME]'},
  NPC: {id: 'NPC', definitionFiles: ["npc"], definitionFormat: '[NAME]'},
  OBJ: {id: 'OBJ', definitionFiles: ["obj"], definitionFormat: '[NAME]'},
  INV: {id: 'INV', definitionFiles: ["inv"], definitionFormat: '[NAME]'},
  ENUM: {id: 'ENUM', definitionFiles: ["enum"], definitionFormat: '[NAME]', previewDeclaration: true},
  DBROW: {id: 'DBROW', definitionFiles: ["dbrow"], definitionFormat: '[NAME]', previewDeclaration: true},
  DBTABLE: {id: 'DBTABLE', definitionFiles: ["dbtable"], definitionFormat: '[NAME]', previewDeclaration: true},
  INTERFACE: {id: 'INTERFACE', definitionFiles: ["pack"], definitionFormat: 'NAME'},
  PARAM: {id: 'PARAM', definitionFiles: ["param"], definitionFormat: '[NAME]', previewDeclaration: true},
  COMMAND: {id: 'COMMAND', definitionFiles: ["rs2"], definitionFormat: '[command,NAME]'}
};

module.exports = matchType;
