const EPOCH = BigInt("1577836800000"); // Custom Epoch (e.g., January 1, 2020, in milliseconds)
const SEQUENCE_BITS = BigInt(12);
const MACHINE_ID_BITS = BigInt(5);
const MAX_SEQUENCE = BigInt(-1) ^ (BigInt(-1) << SEQUENCE_BITS);
const MAX_MACHINE_ID = BigInt(-1) ^ (BigInt(-1) << MACHINE_ID_BITS);

let lastTimestamp = BigInt(-1);
let sequence = BigInt(0);
let machineId = BigInt(0);

function generateSnowflakeId(): Promise<bigint> {
  return new Promise((resolve, reject) => {
    if (machineId < BigInt(0) || machineId >= MAX_MACHINE_ID) {
      reject(new Error(`Machine ID must be in the range 0-${MAX_MACHINE_ID}`));
      return;
    }

    let timestamp = BigInt(Date.now());

    if (timestamp === lastTimestamp) {
      sequence = (sequence + BigInt(1)) & MAX_SEQUENCE;
      if (sequence === BigInt(0)) {
        timestamp = waitNextMillis(timestamp);
      }
    } else {
      sequence = BigInt(0);
    }

    if (timestamp < lastTimestamp) {
      reject(new Error("Clock moved backwards. Refusing to generate id."));
      return;
    }

    lastTimestamp = timestamp;

    const id =
      ((timestamp - EPOCH) << (MACHINE_ID_BITS + SEQUENCE_BITS)) |
      (machineId << SEQUENCE_BITS) |
      sequence;

    resolve(id);
  });
}

function waitNextMillis(timestamp: bigint): bigint {
  while (timestamp === lastTimestamp) {
    timestamp = BigInt(Date.now());
  }
  return timestamp;
}

export { generateSnowflakeId };
