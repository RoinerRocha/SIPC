"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exceptionMiddleware = void 0;
const logger_1 = require("../util/logger");
const exceptionMiddleware = (err, req, res, next) => {
    logger_1.logger.error(err.stack); // Registra el error
    res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        error: req.app.get('env') === 'development' ? err.stack : undefined
    });
};
exports.exceptionMiddleware = exceptionMiddleware;
