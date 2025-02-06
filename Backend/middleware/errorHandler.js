const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            res.status(constants.VALIDATION_ERROR).json({
                title: "VALIDATION FAILED",
                message: err.message,
                stackTrace: err.stack,
            });
            break;

        case constants.NOT_FOUND:
            res.status(constants.NOT_FOUND).json({
                title: "NOT FOUND",
                message: err.message,
                stackTrace: err.stack,
            });
            break;

        case constants.UNAUTHORIZED:
            res.status(constants.UNAUTHORIZED).json({
                title: "UNAUTHORIZED",
                message: err.message,
                stackTrace: err.stack,
            });
            break;

        case constants.FORBIDDEN:
            res.status(constants.FORBIDDEN).json({
                title: "FORBIDDEN",
                message: err.message,
                stackTrace: err.stack,
            });
            break;

        default:
            res.status(constants.SERVER_ERROR).json({
                title: "SERVER ERROR",
                message: err.message || "An unexpected error occurred",
                stackTrace: err.stack,
            });
            break;
    }
};

module.exports = errorHandler;
