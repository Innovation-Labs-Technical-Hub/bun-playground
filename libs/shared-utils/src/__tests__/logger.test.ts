import { test, expect, describe, afterEach, mock } from "bun:test";
import { Logger, createLogger } from "../logger.ts";

describe("Logger", () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  let logCalls: string[];
  let errorCalls: string[];
  let warnCalls: string[];

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });

  function setupSpies() {
    logCalls = [];
    errorCalls = [];
    warnCalls = [];
    console.log = (...args: unknown[]) => { logCalls.push(args[0] as string); };
    console.error = (...args: unknown[]) => { errorCalls.push(args[0] as string); };
    console.warn = (...args: unknown[]) => { warnCalls.push(args[0] as string); };
  }

  test("logs info messages as JSON", () => {
    setupSpies();
    const logger = new Logger("test-svc");
    logger.info("hello");

    expect(logCalls).toHaveLength(1);
    const output = JSON.parse(logCalls[0]!);
    expect(output.level).toBe("info");
    expect(output.service).toBe("test-svc");
    expect(output.message).toBe("hello");
    expect(output.timestamp).toBeDefined();
  });

  test("logs error messages to console.error", () => {
    setupSpies();
    const logger = new Logger("test-svc");
    logger.error("something broke", { detail: "oops" });

    expect(errorCalls).toHaveLength(1);
    const output = JSON.parse(errorCalls[0]!);
    expect(output.level).toBe("error");
    expect(output.detail).toBe("oops");
  });

  test("logs warn messages to console.warn", () => {
    setupSpies();
    const logger = new Logger("test-svc");
    logger.warn("heads up");

    expect(warnCalls).toHaveLength(1);
  });

  test("respects minimum log level", () => {
    setupSpies();
    const logger = new Logger("test-svc", "warn");
    logger.debug("ignored");
    logger.info("also ignored");
    logger.warn("visible");

    expect(logCalls).toHaveLength(0);
    expect(warnCalls).toHaveLength(1);
  });

  test("includes metadata in output", () => {
    setupSpies();
    const logger = new Logger("test-svc", "debug");
    logger.debug("trace", { requestId: "req-1", traceId: "trace-1" });

    const output = JSON.parse(logCalls[0]!);
    expect(output.requestId).toBe("req-1");
    expect(output.traceId).toBe("trace-1");
  });
});

describe("createLogger", () => {
  test("creates a Logger instance", () => {
    const logger = createLogger("my-service");
    expect(logger).toBeInstanceOf(Logger);
  });

  test("respects LOG_LEVEL env var", () => {
    const original = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = "error";

    const logger = createLogger("svc");
    const calls: string[] = [];
    const origLog = console.log;
    console.log = (...args: unknown[]) => { calls.push(args[0] as string); };

    logger.info("should not appear");
    expect(calls).toHaveLength(0);

    console.log = origLog;
    process.env.LOG_LEVEL = original;
  });
});
