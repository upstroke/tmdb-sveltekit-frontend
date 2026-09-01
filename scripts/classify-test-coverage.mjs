#!/usr/bin/env node

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const testsRoot = path.join(root, 'tests');
const outputRoot = path.join(root, '.coverage-per-test');
const testFilePattern = /(?:\.test|\.spec)\.js$/u;
const args = new Map();

for (let index = 2; index < process.argv.length; index += 1) {
	const value = process.argv[index];
	if (value.startsWith('--')) args.set(value, process.argv[index + 1]);
}

const selectedFile = args.get('--file');
const start = Number(args.get('--start') ?? 0);
const limit = Number(args.get('--limit') ?? Number.POSITIVE_INFINITY);
const reset = process.argv.includes('--reset');

async function collectTestFiles(directory, result = []) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) await collectTestFiles(fullPath, result);
		else if (testFilePattern.test(entry.name)) result.push(fullPath);
	}
	return result;
}

function run(command, commandArgs) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, commandArgs, { cwd: root, stdio: 'inherit', shell: false });
		child.on('error', reject);
		child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Command exited with ${code}`))));
	});
}

function extractTests(source) {
	const tests = [];
	const matcher = /^\s*it\((['"`])([^'"`]+)\1\s*,/gmu;
	let match;
	while ((match = matcher.exec(source))) {
		tests.push({ name: match[2], line: source.slice(0, match.index).split('\n').length });
	}
	return tests;
}

async function main() {
	if (reset) {
		const { rm } = await import('node:fs/promises');
		await rm(outputRoot, { recursive: true, force: true });
	}
	await mkdir(outputRoot, { recursive: true });
	const allFiles = (await collectTestFiles(testsRoot)).sort();
	const files = selectedFile ? allFiles.filter((file) => path.relative(root, file) === selectedFile) : allFiles;
	if (selectedFile && files.length === 0) throw new Error(`Test file not found: ${selectedFile}`);

	const reportPath = path.join(outputRoot, 'report.json');
	let report = [];
	try {
		report = JSON.parse(await readFile(reportPath, 'utf8'));
	} catch {}

	const jobs = [];
	for (const file of files) {
		const relative = path.relative(root, file);
		const tests = extractTests(await readFile(file, 'utf8'));
		for (const test of tests) jobs.push({ file, relative, ...test });
	}

	const selectedJobs = jobs.slice(start, start + limit);
	for (const job of selectedJobs) {
		const safe = `${job.relative.replaceAll(/[^a-z0-9]+/giu, '_')}_${job.line}`;
		const outDir = path.join(outputRoot, safe);
		await mkdir(outDir, { recursive: true });
		try {
			await run('npx', [
				'vitest', 'run', job.relative, '-t', job.name,
				'--coverage', '--coverage.reporter=json',
				`--coverage.reportsDirectory=${outDir}`
			]);
			report = report.filter((entry) => !(entry.file === job.relative && entry.line === job.line));
			report.push({ file: job.relative, test: job.name, line: job.line, coverageDirectory: outDir });
		} catch (error) {
			report.push({ file: job.relative, test: job.name, line: job.line, error: error.message });
		}
		await writeFile(reportPath, JSON.stringify(report, null, 2));
	}

	console.log(`Processed ${selectedJobs.length} tests; report: ${path.relative(root, reportPath)}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
