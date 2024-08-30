const enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    NONE = 'none'
}

const logValue: {[value: string]: number} = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4
}


export class Logger {

    private static _level: LogLevel = LogLevel.INFO;

    constructor(level?: string) {
        if (level) {
            Logger._level = level as LogLevel;
        }
    }

    _log(_level: string, message: string, value?: unknown) {
        if (Logger._level === LogLevel.NONE) {
            return;
        }

        if (logValue[_level] >= logValue[Logger._level]) {
            console.log(`[${_level}] ${message}: ${value}`);
        }
    }

    error(message: string, value?: unknown) {
        this._log(LogLevel.ERROR, message, value);

    }

    warn(message: string, value?: unknown) {
        this._log(LogLevel.WARN, message, value);
    }

    info(message: string, value?: unknown) {
        this._log(LogLevel.INFO, message, value);
    }


    debug(message: string, value?: unknown) {
        this._log(LogLevel.DEBUG, message, value);
    }
}