import { describe, it, expect, beforeEach } from "vitest";
import { Snowflake, EPOCH, InvalidTimestampError } from "../snowflake";

describe("Snowflake", () => {
    describe("constructor", () => {
        it("should create from string", () => {
            const inputId = "123456";
            const snowflake = new Snowflake(inputId);
            const expected = "123456";
            expect(snowflake.toString()).toBe(expected);
        });

        it("should handle null string", () => {
            const inputId = "null";
            const snowflake = new Snowflake(inputId);
            const expected = "0";
            expect(snowflake.toString()).toBe(expected);
        });

        it("should create from number", () => {
            const inputId = 123456;
            const snowflake = new Snowflake(inputId);
            const expected = "123456";
            expect(snowflake.toString()).toBe(expected);
        });

        it("should throw on invalid string", () => {
            const inputId = "invalid";
            expect(() => new Snowflake(inputId)).toThrow();
        });
    });

    describe("JSON serialization", () => {
        it("should serialize to JSON string", () => {
            const inputId = "123456";
            const snowflake = new Snowflake(inputId);
            const actual = JSON.stringify(snowflake);
            const expected = '"123456"';
            expect(actual).toBe(expected);
        });

        it("should handle zero value", () => {
            const inputId = 0;
            const snowflake = new Snowflake(inputId);
            const actual = JSON.stringify(snowflake);
            const expected = '"0"';
            expect(actual).toBe(expected);
        });
    });

    describe("timestamp operations", () => {
        it("should create from timestamp", () => {
            const inputDate = new Date("2024-11-01T00:00:00.000Z");
            const snowflake = Snowflake.fromTimestamp(inputDate);
            const actualTimestamp = snowflake.getTimestamp();
            expect(actualTimestamp.getTime()).toBe(inputDate.getTime());
        });

        it("should create from numeric timestamp", () => {
            const inputTimestamp = Date.now();
            const snowflake = Snowflake.fromTimestamp(inputTimestamp);
            const actualTimestamp = snowflake.getTimestamp();
            expect(actualTimestamp.getTime()).toBe(inputTimestamp);
        });

        it("should handle timestamps before epoch", () => {
            const inputDate = new Date(EPOCH - 1000); // 1 second before epoch
            expect(() => Snowflake.fromTimestamp(inputDate)).toThrow();
        });

        it("should throw InvalidTimestampError for timestamps before discord epoch", () => {
            const inputDate = new Date(EPOCH - 1000); // 1 second before epoch
            expect(() => Snowflake.fromTimestamp(inputDate)).toThrow(InvalidTimestampError);
            expect(() => Snowflake.fromTimestamp(inputDate)).toThrow(
                `Timestamp ${inputDate.getTime()} is before epoch (${EPOCH})`
            );
        });
    });

    describe("environment variable handling", () => {
        beforeEach(() => {
            process.env.TEST_SNOWFLAKE = "175928847299117063";
        });

        it("should create from environment variable", () => {
            const snowflake = Snowflake.fromEnv("TEST_SNOWFLAKE");
            expect(snowflake?.toString()).toBe("175928847299117063");
        });

        it("should return null for missing environment variable", () => {
            const snowflake = Snowflake.fromEnv("NONEXISTENT_VAR");
            expect(snowflake).toBeNull();
        });
    });

    describe("deconstruction", () => {
        it("should correctly deconstruct snowflake", () => {
            const inputId = "175928847299117063";
            const snowflake = new Snowflake(inputId);
            const deconstructed = snowflake.deconstruct();

            expect(deconstructed).toEqual(
                expect.objectContaining({
                    workerId: expect.any(Number),
                    processId: expect.any(Number),
                    sequence: expect.any(Number),
                    timestamp: expect.any(Date),
                })
            );
        });

        it("should maintain consistency in reconstructed values", () => {
            const inputDate = new Date("2024-11-01T00:00:00.000Z");
            const originalSnowflake = Snowflake.fromTimestamp(inputDate);
            const deconstructed = originalSnowflake.deconstruct();

            // Timestamp should match within 1ms due to potential rounding
            expect(Math.abs(deconstructed.timestamp.getTime() - inputDate.getTime())).toBeLessThan(1);
        });
    });

    describe("utility methods", () => {
        it("should get correct worker ID", () => {
            const snowflake = new Snowflake("175928847299117063");
            const workerId = snowflake.getWorkerId();
            expect(workerId).toBeGreaterThanOrEqual(0);
            expect(workerId).toBeLessThan(32);
        });

        it("should get correct process ID", () => {
            const snowflake = new Snowflake("175928847299117063");
            const processId = snowflake.getProcessId();
            expect(processId).toBeGreaterThanOrEqual(0);
            expect(processId).toBeLessThan(32);
        });

        it("should get correct sequence", () => {
            const snowflake = new Snowflake("175928847299117063");
            const sequence = snowflake.getSequence();
            expect(sequence).toBeGreaterThanOrEqual(0);
            expect(sequence).toBeLessThan(4096);
        });
    });

    describe("static parse method", () => {
        it("should parse valid snowflake string", () => {
            const inputId = "175928847299117063";
            const snowflake = Snowflake.parse(inputId);
            expect(snowflake.toString()).toBe(inputId);
        });

        it("should handle null string", () => {
            const snowflake = Snowflake.parse("null");
            expect(snowflake.toString()).toBe("0");
        });

        it("should throw on invalid string", () => {
            expect(() => Snowflake.parse("invalid")).toThrow();
        });
    });
});
