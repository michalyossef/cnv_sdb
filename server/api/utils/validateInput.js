function validateInput (inText) {
    //var match = inText.match(/^[^\?\!\@]*$/)
    var matchValid = inText.match(/^[a-zA-Z0-9\_\-\|\.\;]*$/)
    var length = inText.length
    var isString = typeof inText === 'string'
    if (isString && matchValid && length < 10000) {
        return inText
    } else {
        return null
    }
}
module.exports = validateInput;

//export const utils = new utilsClass()