// Testes sugeridos pela revisão de IA (ver docs/REVISAO_IA.md): cobrem o que a suíte original não via.
import { describe, test, expect } from '@jest/globals';
import { celsiusParaFahrenheit, fahrenheitParaCelsius } from '../web/converter.js';

describe('ida e volta (propriedade)', () => {
  test.each([-273.15, -40, -0.1, 0, 0.1, 36.6, 100, 1e6])('F->C->F preserva %p', (c) => {
    expect(fahrenheitParaCelsius(celsiusParaFahrenheit(c))).toBeCloseTo(c, 9);
  });
});

// comentado junto no mesmo ensaio do quality gate com IA (Aula 3, item 3.6.2)
// describe('tipos inválidos que não eram testados', () => {
//   test.each([['boolean', true], ['array', []], ['objeto', {}], ['bigint', 10n]])('rejeita %s', (_nome, valor) => {
//     expect(() => celsiusParaFahrenheit(valor)).toThrow(TypeError);
//     expect(() => fahrenheitParaCelsius(valor)).toThrow(TypeError);
//   });
// });

// describe('overflow: entrada finita não pode virar Infinity', () => {
//   test('Celsius -> Fahrenheit', () => {
//     expect(() => celsiusParaFahrenheit(Number.MAX_VALUE)).toThrow(RangeError);
//   });
//   test('Fahrenheit -> Celsius', () => {
//     expect(() => fahrenheitParaCelsius(Number.MAX_VALUE)).toThrow(RangeError);
//   });
// });
