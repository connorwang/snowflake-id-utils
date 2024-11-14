# Snowflake ID Generator

A TypeScript utility for working with Snowflake IDs with Cloudflare Workers compatibility. This package provides a clean, type-safe way to parse, create, and deconstruct Snowflake IDs with zero dependencies.

## Features

-   🎯 Full TypeScript support
-   🚀 Zero dependencies
-   💪 Proper BigInt handling for ID operations
-   🔒 Type-safe API
-   ✨ Cloudflare Worker Support
-   📦 Small bundle size

## Installation

```bash
npm install snowflake-id-utils
```

## Quick Start

```typescript
import { Snowflake } from "snowflake-id-utils";

// Create from an existing ID
const snowflake = new Snowflake("175928847299117063");

// Get creation timestamp
const timestamp = snowflake.getTimestamp();
console.log(timestamp); // -> Date object

// Get all components
const { timestamp, workerId, sequence } = snowflake.deconstruct();
```

## API Reference

### Creating Snowflakes

```typescript
// From string ID
const snowflake = new Snowflake("175928847299117063");

// From timestamp, this sets the worker ID to 0
const fromTime = Snowflake.fromTimestamp(new Date());

// From timestamp, this sets the worker ID to 123
const fromTimeWithWorker = Snowflake.fromTimestamp(new Date(), 123);

// From environment variable
const fromEnv = Snowflake.fromEnv("ENV_VAR");

// Parse from string (with null handling)
const parsed = Snowflake.parse("175928847299117063");
```

### Instance Methods

```typescript
const snowflake = new Snowflake("175928847299117063");

// Get creation timestamp
const timestamp = snowflake.getTimestamp();

// Get worker ID (0-8191)
const workerId = snowflake.getWorkerId();

// Get sequence number (0-511)
const sequence = snowflake.getSequence();

// Get all components at once
const deconstructed = snowflake.deconstruct();

// Convert to string
const str = snowflake.toString();

// JSON serialization is handled automatically
const json = JSON.stringify(snowflake);
```

### Types

```typescript
interface DeconstructedSnowflake {
    timestamp: Date;
    workerId: number;
    processId: number;
    sequence: number;
}
```

## Examples

### Working with Snowflake IDs

```typescript
import { Snowflake } from "snowflake-id-utils";

// Create from ID
const id = new Snowflake("175928847299117063");

// Get creation time
const createdAt = id.getTimestamp();
console.log(`ID was created at: ${createdAt}`);

// Check if ID was created before a certain date
const isOld = createdAt < new Date("2024-01-01");
```

### Creating New Snowflakes

```typescript
import { Snowflake } from "snowflake-id-utils";

// Create a snowflake for the current timestamp
const now = Snowflake.fromTimestamp(Date.now());

// Create a snowflake for a specific date
const specific = Snowflake.fromTimestamp(new Date("2023-01-01T00:00:00Z"));
```

### Environment Variables

```typescript
import { Snowflake } from "snowflake-id-utils";

// process.env.ENV_VAR = '175928847299117063'
const id = Snowflake.fromEnv("ENV_VAR");

if (id) {
    console.log(`ID created at: ${id.getTimestamp()}`);
} else {
    console.log("ID not found in environment");
}
```

## Technical Details

### Snowflake Structure

This particular implementation of Snowflake ID is a 64-bit integer with the following structure:

```
111111111111111111111111111111111111111111 111111111111 1111111111
64                                         22           10         0
```

-   Timestamp (42 bits): Milliseconds since Epoch (2024-01-01)
-   Worker ID (12 bits): Worker ID (0-4095)
-   Sequence (10 bits): Sequence number (0-1023)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
