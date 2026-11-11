const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src', 'components', 'AdminPortal.tsx');
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/import\s*\{[\s\S]*?\}\s*from\s*'lucide-react';/, `import { 
  Lock, 
  Search, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  RotateCcw,
  X,
  AlertTriangle
} from 'lucide-react';`);

c = c.replace(/}\s*catch\s*\(err\)\s*\{/, '} catch {');

fs.writeFileSync(p, c, 'utf8');
console.log('Cleaned lucide imports and catch in AdminPortal.tsx');

