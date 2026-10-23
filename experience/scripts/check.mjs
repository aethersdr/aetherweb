// Data integrity: every cited source exists, every reference resolves.
import { personas, usecases, features, categories, scenarios, sources } from '../src/data/index.js';
const errs = [];
const ids = (l) => new Set(l.map((x) => x.id));
const P = ids(personas), U = ids(usecases), F = ids(features), C = ids(categories);
const cites = (str, where) => { for (const m of String(str).matchAll(/\[\[([^\]]+)\]\]/g)) for (const id of m[1].split(',')) if (!sources[id]) errs.push(`${where}: missing source ${id}`); };
const walk = (o, where) => { if (typeof o === 'string') cites(o, where); else if (Array.isArray(o)) o.forEach((x, i) => walk(x, where)); else if (o && typeof o === 'object') for (const k in o) walk(o[k], where + '.' + k); };
for (const p of personas) walk(p, 'persona ' + p.id);
for (const u of usecases) walk(u, 'usecase ' + u.id);
for (const f of features) { walk(f, 'feature ' + f.id); if (!C.has(f.category)) errs.push(`feature ${f.id}: bad category`); f.personas.forEach((p) => P.has(p) || errs.push(`feature ${f.id}: bad persona ${p}`)); }
for (const s of scenarios) {
  walk(s, 'scenario ' + s.id);
  if (!P.has(s.persona)) errs.push(`scenario ${s.id}: bad persona`);
  if (!U.has(s.usecase)) errs.push(`scenario ${s.id}: bad usecase ${s.usecase}`);
  s.features.forEach((f) => F.has(f) || errs.push(`scenario ${s.id}: bad feature ${f}`));
  s.without.links.forEach(([a, b]) => (a < s.without.tools.length && b < s.without.tools.length) || errs.push(`scenario ${s.id}: bad link`));
}
const used = new Set(scenarios.flatMap((s) => s.features));
const unused = features.filter((f) => !used.has(f.id)).map((f) => f.id);
const aetherUnused = features.filter((f) => f.aether && !used.has(f.id)).map((f) => f.id);
const scenNoPersona = personas.filter((p) => !scenarios.some((s) => s.persona === p.id)).map((p) => p.id);
const ucNoScen = usecases.filter((u) => !scenarios.some((s) => s.usecase === u.id || (s.usecases || []).includes(u.id))).map((u) => u.id);
console.log(`personas ${personas.length}, usecases ${usecases.length}, features ${features.length} (aether ${features.filter((f) => f.aether).length}), scenarios ${scenarios.length}, sources ${Object.keys(sources).length}`);
console.log('features in no scenario:', unused.join(', ') || 'none');
console.log('AETHER features in no scenario:', aetherUnused.join(', ') || 'none');
console.log('personas without scenario:', scenNoPersona.join(', ') || 'none', '| usecases without scenario:', ucNoScen.join(', ') || 'none');
console.log(errs.length ? errs.join('\n') : 'no reference errors');
process.exit(errs.length ? 1 : 0);
