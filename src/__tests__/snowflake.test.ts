import { describe, it, expect } from "vitest";
import { Snowflake } from "../snowflake";

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

    describe("timestamp operations", () => {
        it("should create from timestamp without worker ID", () => {
            const inputDate = new Date("2024-11-01T00:00:00.000Z");
            const snowflake = Snowflake.fromTimestamp(inputDate);
            const deconstructed = snowflake.deconstruct();
            expect(deconstructed.timestamp.getTime()).toBe(inputDate.getTime());
            expect(deconstructed.workerId).toBe(0);
        });

        it("should create from timestamp with worker ID", () => {
            const inputDate = new Date("2024-11-01T00:00:00.000Z");
            const workerId = 123;
            const snowflake = Snowflake.fromTimestamp(inputDate, workerId);
            const deconstructed = snowflake.deconstruct();
            expect(deconstructed.timestamp.getTime()).toBe(inputDate.getTime());
            expect(deconstructed.workerId).toBe(workerId);
        });

        it("should create from numeric timestamp without worker ID", () => {
            const inputTimestamp = Date.now();
            const snowflake = Snowflake.fromTimestamp(inputTimestamp);
            const deconstructed = snowflake.deconstruct();
            expect(deconstructed.timestamp.getTime()).toBe(inputTimestamp);
            expect(deconstructed.workerId).toBe(0);
        });

        it("should create from numeric timestamp with worker ID", () => {
            const inputTimestamp = Date.now();
            const workerId = 456;
            const snowflake = Snowflake.fromTimestamp(inputTimestamp, workerId);
            const deconstructed = snowflake.deconstruct();
            expect(deconstructed.timestamp.getTime()).toBe(inputTimestamp);
            expect(deconstructed.workerId).toBe(workerId);
        });

        it("should generate sequential IDs within same millisecond", () => {
            const timestamp = Date.now();
            const workerId = 123;
            const first = Snowflake.fromTimestamp(timestamp, workerId);
            const second = Snowflake.fromTimestamp(timestamp, workerId);
            
            expect(first.getTimestamp().getTime()).toBe(second.getTimestamp().getTime());
            expect(second.getSequence()).toBe(first.getSequence() + 1);
            expect(second.getSequence()).toBeLessThan(1024);
        });

        it("should reset sequence on new millisecond", () => {
            const workerId = 123;
            const first = Snowflake.fromTimestamp(Date.now(), workerId);
            // Wait for next millisecond
            const timestamp = first.getTimestamp().getTime() + 1;
            const second = Snowflake.fromTimestamp(timestamp, workerId);
            
            expect(second.getSequence()).toBe(0);
        });

        it("should handle maximum sequence within millisecond", () => {
            const timestamp = Date.now();
            const workerId = 123;
            let lastSnowflake = Snowflake.fromTimestamp(timestamp, workerId);
            
            // Generate 1023 more snowflakes (for total of 1024)
            for (let i = 0; i < 1023; i++) {
                lastSnowflake = Snowflake.fromTimestamp(timestamp, workerId);
            }
            
            expect(lastSnowflake.getSequence()).toBe(1023);
        });
    });

    describe("deconstruction", () => {
        it("should correctly deconstruct snowflake", () => {
            const timestamp = Date.now();
            const workerId = 123;
            const snowflake = Snowflake.fromTimestamp(timestamp, workerId);
            const deconstructed = snowflake.deconstruct();

            expect(deconstructed).toEqual({
                timestamp: expect.any(Date),
                workerId: workerId,
                sequence: expect.any(Number)
            });
            expect(deconstructed.sequence).toBeLessThan(1024);
            expect(deconstructed.workerId).toBeLessThan(2048);
        });
    });

    describe("utility methods", () => {
        it("should get correct worker ID", () => {
            const timestamp = Date.now();
            const workerId = 123;
            const snowflake = Snowflake.fromTimestamp(timestamp, workerId);
            expect(snowflake.getWorkerId()).toBe(workerId);
        });

        it("should get correct sequence", () => {
            const timestamp = Date.now();
            const workerId = 123;
            const snowflake = Snowflake.fromTimestamp(timestamp, workerId);
            const sequence = snowflake.getSequence();
            expect(sequence).toBeGreaterThanOrEqual(0);
            expect(sequence).toBeLessThan(1024);
        });

        it("should handle maximum worker ID", () => {
            const timestamp = Date.now();
            const maxWorkerId = 2047;
            const snowflake = Snowflake.fromTimestamp(timestamp, maxWorkerId);
            expect(snowflake.getWorkerId()).toBe(maxWorkerId);
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
