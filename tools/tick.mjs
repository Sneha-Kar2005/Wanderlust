import fs from 'node:fs/promises';

const FILE = '/Users/techsaswata/Downloads/Wanderlust/TODO.md';
const ids = process.argv.slice(2);
let text = await fs.readFile(FILE, 'utf8');

for (const id of ids) {
  const re = new RegExp(`^- \\[ \\] ${id.replace(/\./g, '\\.')}(?= )`, 'm');
  if (re.test(text)) text = text.replace(re, `- [x] ${id}`);
  else console.warn('  no match for', id);
}
await fs.writeFile(FILE, text);

const total = (text.match(/^- \[[ x]\]/gm) || []).length;
const done = (text.match(/^- \[x\]/gm) || []).length;
console.log(`progress: ${done}/${total} complete`);
console.log(text.split('\n').filter(l => /^- \[x\]/.test(l)).map(l => '  ' + l).join('\n'));
