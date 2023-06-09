var UID = require("../utils/UID");
var IValidator = require("./interfaces/IValidator");

class IDValidator extends IValidator {
    constructor() {
        super();
    }

    validate(params) {
        if (!params.hasOwnProperty("id") || !UID.isValid(params.id)) {
            var error = new Error("No valid uid passed to URI");
            error.status = 500;
            throw error;
        }
        return params;
    }
}

module.exports = IDValidator;
