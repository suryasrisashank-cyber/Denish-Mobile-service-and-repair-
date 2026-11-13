// Secure script to sync required production environment variables to linked Vercel project
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function parseEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        env[key] = val;
      }
    }
  }
  return env;
}

function setVercelEnv(name, value, targets = "production,preview") {
  return new Promise((resolve, reject) => {
    console.log(`Setting Vercel env var: ${name} (targets: ${targets})...`);
    const proc = spawn("npx.cmd", [
      "vercel",
      "env",
      "add",
      name,
      targets,
      "--force",
      "--yes"
    ], {
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    });

    proc.stdin.write(value + "\n");
    proc.stdin.end();

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`✓ Set ${name} successfully!`);
        resolve();
      } else {
        reject(new Error(`Failed to set ${name}, exit code: ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  const localEnv = parseEnv(path.join(__dirname, "..", ".env.local"));

  const varsToSet = {
    DATABASE_URL: localEnv.DATABASE_URL,
    DATABASE_URL_UNPOOLED: localEnv.DATABASE_URL_UNPOOLED || localEnv.DATABASE_URL,
    ADMIN_JWT_SECRET: localEnv.JWT_SECRET || localEnv.ADMIN_JWT_SECRET || "87f3c1a9e8b2d4f6a1c3e5b7d9f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8",
    JWT_SECRET: localEnv.JWT_SECRET || localEnv.ADMIN_JWT_SECRET || "87f3c1a9e8b2d4f6a1c3e5b7d9f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8",
    COOKIE_SECURE: "true",
    NEXT_PUBLIC_SITE_URL: "https://denish-mobile-service-and-repair-pu.vercel.app",
  };

  if (localEnv.WHATSAPP_API_TOKEN) varsToSet.WHATSAPP_API_TOKEN = localEnv.WHATSAPP_API_TOKEN;
  if (localEnv.WHATSAPP_PHONE_NUMBER_ID) varsToSet.WHATSAPP_PHONE_NUMBER_ID = localEnv.WHATSAPP_PHONE_NUMBER_ID;
  if (localEnv.WHATSAPP_PHONE_NUMBER) varsToSet.WHATSAPP_PHONE_NUMBER = localEnv.WHATSAPP_PHONE_NUMBER;
  if (localEnv.WHATSAPP_WEBHOOK_VERIFY_TOKEN) varsToSet.WHATSAPP_WEBHOOK_VERIFY_TOKEN = localEnv.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (localEnv.WHATSAPP_APP_SECRET) varsToSet.WHATSAPP_APP_SECRET = localEnv.WHATSAPP_APP_SECRET;

  console.log("Configuring variables on existing Vercel project...");
  for (const [key, val] of Object.entries(varsToSet)) {
    if (!val) {
      console.warn(`Skipping ${key} (no value found).`);
      continue;
    }
    await setVercelEnv(key, val);
  }

  console.log("\n=== ALL VERCEL ENVIRONMENT VARIABLES CONFIGURED ===");
}

main().catch((err) => {
  console.error("Failed to sync env vars:", err);
  process.exit(1);
});
