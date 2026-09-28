// Draait `astro sync` en laat de build falen bij een ongeldige reference().
//
// Sinds de overstap naar Zod 4 controleert Astro references pas na het laden
// van alle collecties, en logt het een verwijzing naar een niet-bestaande entry
// alleen als fout zonder de build te stoppen. Het bouwplan eist dat de build
// dan faalt; dit script maakt dat hard.
import { spawn } from 'node:child_process';

const child = spawn('npx', ['astro', 'sync'], { stdio: ['inherit', 'pipe', 'pipe'] });

let output = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    output += chunk;
    (stream === child.stdout ? process.stdout : process.stderr).write(chunk);
  });
}

child.on('close', (code) => {
  if (code !== 0) process.exit(code ?? 1);
  if (output.includes('Invalid content reference')) {
    console.error('\nBuild gestopt: er verwijst content naar een entry die niet bestaat (zie hierboven).');
    process.exit(1);
  }
});
