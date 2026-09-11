import fs from 'fs';

const cssPath = 'resources/css/app.css';
const lines = fs.readFileSync(cssPath, 'utf8').split(/\r?\n/);
const keep = `${lines.slice(0, 501).join('\n')}\n\n@import "./dashboard-shells.css";\n`;
fs.writeFileSync(cssPath, keep);
console.log(`css truncated ${lines.length} -> ${keep.split('\n').length}`);
