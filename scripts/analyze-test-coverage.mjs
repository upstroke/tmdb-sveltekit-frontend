#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportPath = path.join(root, '.coverage-per-test', 'report.json');
const outputPath = path.join(root, '.coverage-per-test', 'analysis.json');

const report = JSON.parse(await readFile(reportPath, 'utf8'));
const entries = [];

function coveredIds(data, mapName, countName) {
	return new Set(Object.entries(data[mapName] ?? {}).filter(([id]) => (data[countName]?.[id] ?? 0) > 0).map(([id]) => id));
}

for (const item of report) {
	if (item.error) {
		entries.push({ ...item, status: 'error' });
		continue;
	}
	const files = JSON.parse(await readFile(path.join(item.coverageDirectory, 'coverage-final.json'), 'utf8'));
	let statements = new Set();
	let branches = new Set();
	for (const file of Object.values(files)) {
		for (const id of coveredIds(file, 'statementMap', 's')) statements.add(`${file.path}:statement:${id}`);
		for (const id of coveredIds(file, 'branchMap', 'b')) branches.add(`${file.path}:branch:${id}`);
	}
	entries.push({ ...item, status: 'ok', statementCount: statements.size, branchCount: branches.size, statements: [...statements], branches: [...branches] });
}

const ordered = [...entries].sort((a, b) => {
	const fileOrder = a.file.localeCompare(b.file);
	return fileOrder || a.line - b.line;
});
let seenStatements = new Set();
const analyzed = ordered.map((item) => {
	if (item.status !== 'ok') return { ...item, classification: 'unavailable' };
	const newStatements = item.statements.filter((id) => !seenStatements.has(id));
	seenStatements = new Set([...seenStatements, ...item.statements]);
	return { ...item, newStatementCount: newStatements.length, classification: newStatements.length > 0 ? 'Anweisungsüberdeckung' : 'Zweigüberdeckung' };
});

await writeFile(outputPath, JSON.stringify(analyzed, null, 2));
console.log(`Wrote ${analyzed.length} classifications to ${path.relative(root, outputPath)}`);
