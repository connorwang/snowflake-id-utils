/**
 * Epoch in milliseconds (2023-01-01T00:00:00.000Z)
 * Adjusted to be divisible by 10 for clean 1ms units
 */
export const EPOCH = 1672502400000;
/**
 * Configuration for allowing unquoted snowflake IDs in JSON
 */
export let allowUnquoted = false;

/**
 * Represents a Snowflake ID with utility methods
 */
export class Snowflake {
    private readonly id: bigint;
    private static lastTimestamp = -1n;
    private static sequence = 0;
    private static readonly MAX_SEQUENCE = 1023; // 10 bits max value

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
     * Creates a new Snowflake from a timestamp with specific worker ID
     * @param timestamp - Date object or timestamp in milliseconds
     * @param workerId - Worker ID (0-2047)
     */
    static fromTimestamp(timestamp: Date | number, workerId: number = 0): Snowflake {
        const ms = typeof timestamp === "number" ? timestamp : timestamp.getTime();
        const currentTimestamp = BigInt(ms - EPOCH);

        // If we're still in the same millisecond
        if (currentTimestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1) & this.MAX_SEQUENCE;
            // Sequence overflow - wait for next millisecond
            if (this.sequence === 0) {
                // Wait until next millisecond
                while (BigInt(Date.now() - EPOCH) <= this.lastTimestamp) {
                    // busy wait
                }
            }
        } else {
            // New millisecond - reset sequence
            this.sequence = 0;
        }
        this.lastTimestamp = currentTimestamp;

        // Compose the snowflake
        // timestamp: 42 bits | worker: 11 bits | sequence: 10 bits
        const timestampBits = currentTimestamp << BigInt(21);  // shift left by 11 + 10 bits
        const workerBits = BigInt(workerId) << BigInt(10);    // shift left by 10 bits
        const sequenceBits = BigInt(this.sequence);           // no shift needed
        
        return new Snowflake(timestampBits | workerBits | sequenceBits);
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
    static parse(value: string): Snowflake {
        return new Snowflake(value);
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
        const timestamp = Number(this.id >> BigInt(21)) + EPOCH;
        return new Date(timestamp);
    }

    /**
     * Get the worker ID from this Snowflake
     */
    getWorkerId(): number {
        return Number((this.id >> BigInt(10)) & BigInt(0x7FF));  // 11 bits mask
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
        return Number(this.id & BigInt(0x3FF));  // 10 bits mask
    }

    /**
     * Deconstruct the Snowflake into its components
     */
    deconstruct(): DeconstructedSnowflake {
        return {
            timestamp: this.getTimestamp(),
            workerId: this.getWorkerId(),
            sequence: this.getSequence()
        };
    }
}

/**
 * Interface representing deconstructed Snowflake components
 */
export interface DeconstructedSnowflake {
    timestamp: Date;
    workerId: number;
    sequence: number;
}
