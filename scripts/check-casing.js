const fs = require('fs');
const path = require('path');

let errors = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match import ... from "..." or require("...")
  const regex = /(?:from\s+['"]|require\(['"])([\.\/][^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1];
    resolveAndVerify(filePath, importPath);
  }

  // Also check @/ alias
  const aliasRegex = /(?:from\s+['"]|require\(['"])(@\/[^'"]+)['"]/g;
  while ((match = aliasRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolvedRel = importPath.replace(/^@\//, 'src/');
    const projectRoot = path.resolve(__dirname, '..');
    verifyPathCasing(projectRoot, resolvedRel.split('/'), filePath, importPath);
  }
}

function resolveAndVerify(fromFile, relPath) {
  const fromDir = path.dirname(fromFile);
  const segments = relPath.split('/');
  verifyPathCasing(fromDir, segments, fromFile, relPath);
}

function verifyPathCasing(baseDir, segments, fromFile, originalImport) {
  let currentDir = baseDir;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg === '.' || seg === '') continue;
    if (seg === '..') {
      currentDir = path.dirname(currentDir);
      continue;
    }

    const isLast = (i === segments.length - 1);
    const entries = fs.existsSync(currentDir) ? fs.readdirSync(currentDir) : [];
    
    if (isLast) {
      // Could be file with or without extension, or directory with index
      const exactMatch = entries.find(e => 
        e === seg || 
        e === seg + '.ts' || 
        e === seg + '.tsx' || 
        e === seg + '.js' || 
        e === seg + '.jsx' || 
        e === seg + '.json' || 
        e === seg + '.mjs' ||
        (e === seg && fs.statSync(path.join(currentDir, e)).isDirectory())
      );
      if (!exactMatch) {
        const caseInsensitiveMatch = entries.find(e => 
          e.toLowerCase() === seg.toLowerCase() || 
          e.toLowerCase() === (seg + '.ts').toLowerCase() || 
          e.toLowerCase() === (seg + '.tsx').toLowerCase() || 
          e.toLowerCase() === (seg + '.js').toLowerCase()
        );
        if (caseInsensitiveMatch) {
          console.error(`[CASING_MISMATCH] in ${path.relative(process.cwd(), fromFile)}: imported "${originalImport}", but disk has "${caseInsensitiveMatch}"!`);
          errors++;
        }
      }
    } else {
      const match = entries.find(e => e === seg);
      if (!match) {
        const ciMatch = entries.find(e => e.toLowerCase() === seg.toLowerCase());
        if (ciMatch) {
          console.error(`[DIR_CASING_MISMATCH] in ${path.relative(process.cwd(), fromFile)}: path segment "${seg}" vs disk "${ciMatch}"!`);
          errors++;
        }
      }
      currentDir = path.join(currentDir, seg);
    }
  }
}

console.log('Checking casing across src/ ...');
walk(path.join(__dirname, '..', 'src'));
console.log(`Casing check completed with ${errors} mismatch(es).`);
