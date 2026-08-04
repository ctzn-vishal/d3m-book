// Pulls @types/mdx into the program so `import Article from './article.mdx'`
// type-checks in every app/<slug>/page.tsx.
//
// @types/mdx is purely ambient — it ships `declare module '*.mdx'` and no
// importable entry point ("main": ""), so nothing in the source tree resolves
// it by name. TypeScript 5 picked it up via automatic `node_modules/@types/*`
// inclusion; TypeScript 7 does not, which surfaced as TS2307 on every chapter
// page. This reference works on both.
/// <reference types="mdx" />
