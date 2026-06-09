const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const cwd = process.cwd();
    const localDbPath = path.resolve(cwd, 'database.sqlite');

    // Prefer explicit DATABASE_FILE if provided, otherwise use RENDER_DATA_DIR
    let destPath = null;
    if (process.env.DATABASE_FILE) {
      destPath = path.isAbsolute(process.env.DATABASE_FILE)
        ? process.env.DATABASE_FILE
        : path.resolve(cwd, process.env.DATABASE_FILE);
    } else if (process.env.RENDER_DATA_DIR) {
      destPath = path.resolve(process.env.RENDER_DATA_DIR, 'database.sqlite');
    }

    if (!destPath) {
      console.log('[prepare-db] No persistent destination configured (DATABASE_FILE or RENDER_DATA_DIR).');
      return;
    }

    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });

    if (!fs.existsSync(localDbPath)) {
      console.log('[prepare-db] No local database.sqlite found to copy.');
      return;
    }

    if (fs.existsSync(destPath)) {
      console.log('[prepare-db] Destination database already exists, skipping copy:', destPath);
      return;
    }

    fs.copyFileSync(localDbPath, destPath);
    console.log('[prepare-db] Copied database.sqlite to', destPath);
  } catch (err) {
    console.error('[prepare-db] Error preparing database:', err);
    process.exit(1);
  }
})();
