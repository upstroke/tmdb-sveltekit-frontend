import { describe, expect, it } from 'vitest';
import { formatHomepageLabel } from '$lib/utils/formatHomepageLabel';

/**
 * Teststrategie: Anweisungs- und Zweigüberdeckung.
 * Die Tests decken fehlende URLs, beide Protokolle sowie URLs
 * mit Pfad, Query und Fragment ab.
 */
describe('formatHomepageLabel', () => {
	// Anweisungsüberdeckung: Fehlende Eingaben liefern einen leeren String.
	it('liefert bei fehlender URL einen leeren String zurück', () => {
		expect(formatHomepageLabel()).toBe('');
	});

	// Anweisungs- und Zweigüberdeckung: HTTPS wird aus der Anzeige entfernt.
	it('entfernt das https-Protokoll', () => {
		expect(formatHomepageLabel('https://example.com')).toBe('example.com');
	});

	// Anweisungs- und Zweigüberdeckung: HTTP wird aus der Anzeige entfernt.
	// Anweisungsüberdeckung: Auch HTTP-URLs laufen durch den Protokoll-Entfernungszweig.
	it('entfernt das http-Protokoll', () => {
		expect(formatHomepageLabel('http://example.com')).toBe('example.com');
	});

	// Zweigüberdeckung: Nur das führende Protokoll wird entfernt, Rest bleibt erhalten.
	it('entfernt nur das führende Protokoll und erhält den restlichen Pfad', () => {
		expect(formatHomepageLabel('https://example.com/films?id=42#details')).toBe(
			'example.com/films?id=42#details'
		);
	});

	// Zweigüberdeckung: URLs ohne Protokoll bleiben unverändert.
	it('lässt URLs ohne http- oder https-Protokoll unverändert', () => {
		expect(formatHomepageLabel('www.example.com')).toBe('www.example.com');
	});
});
