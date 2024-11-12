const responseText = require("./responseText");

const bodyFormat = {
  NONE: {id: "NONE", text: responseText.NONE}, 
  LINE: {id: "LINE", text: responseText.LINE}, 
  SIGNATURE: {id: "SIGNATURE", text: responseText.LINE}, 
  BLOCK: {id: "BLOCK", text: responseText.BLOCK}, 
  VALUE: {id: "VALUE", text: responseText.LINE}
}

module.exports = bodyFormat;
