/* 
Imports
*/
    const appRoot = require('app-root-path');
    const winston = require('winston');
    require('winston-loggly-bulk');
//

/* 
Options
*/    
    // File log options
    const fileOption = {
        level: 'info',
        filename: `${appRoot}/logs/server.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    };

    // Console log options
    const consoleOption = {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    };
//


/* 
Definition
*/
    // Instantiate a new Winston Logger
    const logger = new winston.createLogger({
        transports: [
            new winston.transports.File(fileOption),
            // new winston.transports.Console(consoleOption)
        ],
        exitOnError: false, // do not exit on handled exceptions
    });

    // Create stream object to write log
    logger.stream = {
        write: (message, encoding) => {
            // Send log
            logger.info(`>HTTP : ${message.trim()}`);
        },
    };
//


/* 
Export
*/
    module.exports = logger;
//