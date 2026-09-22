// Liest die Codebloecke aus den Lab-Seiten aus.
//
// Jeder Block steht als
//   <div class="codeblock" data-kind="run|concept|diagram" data-name="NAME" …>
//     <pre class="code-block" lang="de">…</pre><pre class="code-block" lang="en">…</pre>
//   </div>
// Ein Block ohne Sprachfassungen traegt ein einzelnes <pre class="code-block">.
//
// Aufruf:  node tools/extract_code.js <lab.html>
// Ausgabe: JSON-Liste [{ name, kind, code }] - der Name traegt die Sprache als
//          Suffix (NAME[de] / NAME[en]); sprachneutrale Bloecke heissen NAME.

const fs = require('fs');

const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&');

const out = [];
const blockRe = /<div\s+class="codeblock[^"]*"([^>]*)>([\s\S]*?)<\/div>/g;
for (const m of src.matchAll(blockRe)) {
  const attrs = m[1];
  const kind = (attrs.match(/data-kind="([^"]+)"/) || [])[1];
  const name = (attrs.match(/data-name="([^"]+)"/) || [])[1];
  if (!kind || !name) continue;
  const pres = [...m[2].matchAll(/<pre\s+class="code-block"([^>]*)>([\s\S]*?)<\/pre>/g)];
  for (const p of pres) {
    const lang = (p[1].match(/\blang="(de|en)"/) || [])[1];
    out.push({ name: lang ? `${name}[${lang}]` : name, kind, code: decode(p[2]) });
  }
}

process.stdout.write(JSON.stringify(out, null, 1));
