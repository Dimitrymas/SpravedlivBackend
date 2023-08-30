const ApiError = require('../api_response/ApiError')
const ApiSuccess = require('../api_response/ApiSuccess')


module.exports = function (resObj, req, res, next) {
    if (resObj instanceof ApiSuccess) {
        res.status(200).json({success: true, response:resObj.response})
    }

    else if (resObj instanceof ApiError) {
        res.status(resObj.status).json({success: false, response: {error: resObj.message}})
    }
    else {
        return res.status(500).json({success: false, response: {error: 'Непредвиденная ошибка'}})
    }
}
