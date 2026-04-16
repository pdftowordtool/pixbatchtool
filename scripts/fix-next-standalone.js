/*
  Netlify Next.js plugin expects `require('next')` to be resolvable from the standalone bundle.
  In some environments, Next's traced standalone output can omit `next/dist/server/next.js`.
  This script copies that file into `.next/standalone` if it is missing.
*/

const fs = require('fs');
const path = require('path');

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfMissing({ from, to }) {
  if (!exists(from)) {
    console.warn(`[fix-next-standalone] Source missing: ${from}`);
    return;
  }
  if (exists(to)) {
    return;
  }

  mkdirp(path.dirname(to));
  fs.copyFileSync(from, to);
  console.log(`[fix-next-standalone] Copied: ${path.relative(process.cwd(), to)}`);
}

(function main() {
  const projectRoot = process.cwd();

  const standaloneDir = path.join(projectRoot, '.next', 'standalone');
  if (!exists(standaloneDir)) {
    // Standalone output isn't always produced.
    return;
  }

  const fromNextMain = path.join(projectRoot, 'node_modules', 'next', 'dist', 'server', 'next.js');
  const toNextMain = path.join(standaloneDir, 'node_modules', 'next', 'dist', 'server', 'next.js');

  copyIfMissing({ from: fromNextMain, to: toNextMain });
})();
