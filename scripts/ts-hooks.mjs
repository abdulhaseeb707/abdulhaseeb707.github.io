// Lets a plain Node script import the site's TypeScript (lib/*.ts, lib/cv/CvDocument.tsx) without a build:
// each .ts/.tsx file is compiled with the project's own TypeScript as it loads. Import this before those modules.
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const options = { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX };

registerHooks({
  resolve(specifier, context, next) {
    // '@/lib/x' is the repo root (tsconfig paths); 'lib/x' without an extension is lib/x.ts or lib/x.tsx
    const local = specifier.startsWith('@/') ? path.resolve(specifier.slice(2)) : specifier.startsWith('.') && context.parentURL ? path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier) : null;
    if (local && !path.extname(local)) {
      for (const ext of ['.ts', '.tsx']) if (existsSync(local + ext)) return next(pathToFileURL(local + ext).href, context);
    }
    return next(local && specifier.startsWith('@/') ? pathToFileURL(local).href : specifier, context);
  },
  load(url, context, next) {
    if (!/\.tsx?$/.test(url)) return next(url, context);
    const file = fileURLToPath(url);
    const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: options, fileName: file });
    return { format: 'module', source: outputText, shortCircuit: true };
  },
});
