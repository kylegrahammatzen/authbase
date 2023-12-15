const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} = require("crypto");

interface Hash {
  iv: string;
  content: string;
  authTag: string;
}

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not defined");
}

const algorithm = "aes-256-gcm";
const secretKey = process.env.ENCRYPTION_KEY;
const key = hashKey(secretKey);
const iv = randomBytes(16);

function hashKey(secretKey: string): Buffer {
  const hash = createHash("sha256");
  hash.update(secretKey);
  return hash.digest();
}

function encrypt(text: string): string {
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  const jsonData = JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted,
    authTag,
  });
  const base64Data = Buffer.from(jsonData).toString("base64");
  return base64Data.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // Making it URL-safe
}

function isBase64(str: string) {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
  return base64Regex.test(str);
}

function decrypt(text: string): string {
  // Convert URL-safe Base64 to original Base64
  const normalizedBase64 =
    text.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (text.length % 4)) % 4);

  // Convert from Base64 to a JSON string
  const jsonString = Buffer.from(normalizedBase64, "base64").toString();

  // Convert JSON string to an object
  const hash = JSON.parse(jsonString);

  const decipher = createDecipheriv(
    algorithm,
    key,
    Buffer.from(hash.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(hash.authTag, "hex")); // Set authentication tag
  let decrypted = decipher.update(hash.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { encrypt, decrypt };
