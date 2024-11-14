/**
 * Epoch in milliseconds (2024-01-01T00:00:00.000Z)
 */
export const EPOCH = 1714857600000;

/**
 * Configuration for allowing unquoted snowflake IDs in JSON
 */
export let allowUnquoted = false;

/**
 * Error thrown when timestamp is before Discord epoch
 */
export class InvalidTimestampError extends Error {
    constructor(timestamp: number) {
        super(`Timestamp ${timestamp} is before epoch (${EPOCH})`);
        this.name = "InvalidTimestampError";
    }
}

/**
 * Represents a Snowflake ID with utility methods
 */
export class Snowflake {
    private readonly id: bigint;

    /**
     * Creates a new Snowflake instance
     * @param value - Snowflake ID as string or bigint
     */
    constructor(value: string | bigint | number) {
        if (typeof value === "string") {
            if (value === "null") {
                this.id = BigInt(0);
                return;
            }
            this.id = BigInt(value);
        } else {
            this.id = BigInt(value);
        }
    }

    /**
     * Creates a new Snowflake from a timestamp
     * @param timestamp - Date object or timestamp in milliseconds
     * @throws {InvalidTimestampError} If timestamp is before epoch
     */
    static fromTimestamp(timestamp: Date | number): Snowflake {
        const ms = typeof timestamp === "number" ? timestamp : timestamp.getTime();

        if (ms < EPOCH) {
            throw new InvalidTimestampError(ms);
        }

        return new Snowflake(BigInt(ms - EPOCH) << BigInt(22));
    }

    /**
     * Creates a Snowflake from an environment variable
     * @param key - Environment variable name
     * @returns Snowflake instance or null if env var is not set
     */
    static fromEnv(key: string): Snowflake | null {
        const value = process.env[key];
        return value ? new Snowflake(value) : null;
    }

    /**
     * Parse a string into a Snowflake
     * @param str - String to parse
     */
    static parse(str: string): Snowflake {
        return new Snowflake(str);
    }

    /**
     * Convert Snowflake to JSON
     */
    toJSON(): string {
        return this.toString();
    }

    /**
     * Convert Snowflake to string
     */
    toString(): string {
        return this.id.toString();
    }

    /**
     * Get the timestamp when this Snowflake was created
     */
    getTimestamp(): Date {
        return new Date(Number(this.id >> BigInt(22)) + EPOCH);
    }

    /**
     * Get the worker ID from this Snowflake
     */
    getWorkerId(): number {
        return Number((this.id & BigInt(0x3e0000)) >> BigInt(17));
    }

    /**
     * Get the process ID from this Snowflake
     */
    getProcessId(): number {
        return Number((this.id & BigInt(0x1f000)) >> BigInt(12));
    }

    /**
     * Get the increment sequence from this Snowflake
     */
    getSequence(): number {
        return Number(this.id & BigInt(0xfff));
    }

    /**
     * Deconstruct the Snowflake into its components
     */
    deconstruct(): DeconstructedSnowflake {
        return {
            timestamp: this.getTimestamp(),
            workerId: this.getWorkerId(),
            processId: this.getProcessId(),
            sequence: this.getSequence(),
        };
    }
}

/**
 * Interface representing deconstructed Snowflake components
 */
export interface DeconstructedSnowflake {
    timestamp: Date;
    workerId: number;
    processId: number;
    sequence: number;
}
