const { expandCsvKeyObject } = require("../utils/matchUtils");

// === CONFIG KEY INFORMATION ===
// Define any config keys with info that will be displayed when the user hovers over that config key
// Format: { key: { 'any': 'info for any fileType', 'obj': 'obj specific info', 'loc, npc': 'loc and npc specific info' } }
// You can define different info for specific file types, or use 'any' to apply to all file types (unless already defined)
// Tip: you can use the same value for multiple file types using a key as a CSV (i.e. use 'obj, loc, npc' as a key)
const configKeyInfo = expandInfo({
  type: { 'varp': 'The data type of this player variable' },
  param: { 'any': 'A param value in the format paramName,value' },
  inputtype: { 'enum': 'The input data type for the enum' },
  outputtype: { 'enum': 'The output data type for the enum' },
  val: { 'enum': 'A data value for the enum in the format inputData,outputData' },
  scope: { 'varp': 'The lifetime of a player variable\n\nBy default it is temporary and reset on logout/login. You can make it persist by setting scope=perm' },
  protect: { 'varp': 'If the player variable should require protected access\n\nDefault value <b>true</b> (acceptable values: true/yes, false/no)\n\nProtected means a script can not <b>write</b> to it without sole access, but a varp can always be <b>read</b> regardless of the protection.' },
  clientcode: { 'all': 'Ties this to specific client-side code logic\n\nAcceptable value defined in client source, if you actually need this you should already know what to put.' },
  transmit: { 'varp': 'If a player variable should be transmitted to the client\n\nDefault value <b>false</b> (acceptable values: true/yes, false/no)\n\nThe main use for this property is in conjunction with interfaces.' },
});
function expandInfo(obj) {
  Object.keys(obj).forEach(key => obj[key] = expandCsvKeyObject(obj[key]));
  return obj;
}

// Find info for a given config key. If no fileType, will match config keys for 'any' type. Else, return null.
function matchConfigKeyInfo(key, fileType) {
  const info = configKeyInfo[key];
  if (info[fileType]) {
    return info[fileType];
  }
  return info.any;
}

module.exports = matchConfigKeyInfo;
