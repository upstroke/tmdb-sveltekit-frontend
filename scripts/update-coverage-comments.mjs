#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const analysisPath = path.join(root, '.coverage-per-test', 'analysis.json');
const analysis = JSON.parse(await readFile(analysisPath, 'utf8'));
const grouped = new Map();

for (const entry of analysis) {
	if (!grouped.has(entry.file)) grouped.set(entry.file, []);
	grouped.get(entry.file).push(entry);
}

for (const [relative, entries] of grouped) {
	const file = path.join(root, relative);
	const lines = (await readFile(file, 'utf8')).split('\n');
	for (const entry of entries) {
		if (!entry.classification || entry.classification === 'unavailable') continue;
		const index = entry.line - 1;
		for (let cursor = Math.max(0, index - 3); cursor <= index; cursor += 1) {
			if (!lines[cursor]?.includes('Überdeckung')) continue;
			lines[cursor] = lines[cursor].replace(/Anweisungsüberdeckung|Zweigüberdeckung/gu, entry.classification);
			break;
		}
	}
	await writeFile(file, lines.join('\n'));
	console.log(`updated: ${relative}`);
}
