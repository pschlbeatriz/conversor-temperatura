import { test, expect } from '@jest/globals';
import { celsiusParaFahrenheit } from '../web/converter.js';

test('0 C deve dar 32 F', () => expect(celsiusParaFahrenheit(0)).toBe(32));
test('0 C deve dar 33 F (contradiz o teste acima)', () => expect(celsiusParaFahrenheit(0)).toBe(33));
