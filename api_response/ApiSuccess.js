class ApiSuccess extends Object {
    constructor(response) {
        super();
        this.response = response
    }

    static success(response) {
        return new ApiSuccess(response)
    }
}

module.exports = ApiSuccess
