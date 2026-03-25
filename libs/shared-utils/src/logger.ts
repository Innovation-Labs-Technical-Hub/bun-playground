type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string;
  traceId?: string;
  spanId?: string;
  [key: string]: unknown;
}

export class Logger {
  private service: string;
  private minLevel: number;

  constructor(service: string, level: LogLevel = "info") {
    this.service = service;
    this.minLevel = LOG_LEVELS[level];
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...meta,
    };

    const output = JSON.stringify(entry);

    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log("error", message, meta);
  }
}

export function createLogger(service: string, level?: LogLevel): Logger {
  return new Logger(service, level ?? (process.env.LOG_LEVEL as LogLevel) ?? "info");
}
