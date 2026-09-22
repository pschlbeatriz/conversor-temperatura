import { describe, test, expect } from '@jest/globals';
import { celsiusParaFahrenheit, fahrenheitParaCelsius } from '../web/converter.js';

const quase = (atual, esperado) => expect(atual).toBeCloseTo(esperado, 9);

describe('acertos: Celsius -> Fahrenheit', () => {
  test('ponto de congelamento da água', () => quase(celsiusParaFahrenheit(0), 32));
  test('ponto de ebulição da água', () => quase(celsiusParaFahrenheit(100), 212));
  test('temperatura corporal', () => quase(celsiusParaFahrenheit(37), 98.6));
  test('valor negativo (-40 é igual nas duas escalas)', () => quase(celsiusParaFahrenheit(-40), -40));
});

describe('acertos: Fahrenheit -> Celsius', () => {
  test('ponto de congelamento da água', () => quase(fahrenheitParaCelsius(32), 0));
  test('ponto de ebulição da água', () => quase(fahrenheitParaCelsius(212), 100));
  test('valor negativo (-40 é igual nas duas escalas)', () => quase(fahrenheitParaCelsius(-40), -40));
});

describe('erros: entradas inválidas', () => {
  const invalidos = [['string', '10'], ['null', null], ['undefined', undefined], ['NaN', NaN], ['Infinity', Infinity]];

  test.each(invalidos)('Celsius -> Fahrenheit rejeita %s', (_nome, valor) => {
    expect(() => celsiusParaFahrenheit(valor)).toThrow(TypeError);
  });
  test.each(invalidos)('Fahrenheit -> Celsius rejeita %s', (_nome, valor) => {
    expect(() => fahrenheitParaCelsius(valor)).toThrow(TypeError);
  });

  test('Celsius abaixo do zero absoluto', () => {
    expect(() => celsiusParaFahrenheit(-273.16)).toThrow(RangeError);
  });
  test('Fahrenheit abaixo do zero absoluto', () => {
    expect(() => fahrenheitParaCelsius(-459.68)).toThrow(RangeError);
  });
});

describe('limites', () => {
  test('zero absoluto exato é aceito', () => {
    quase(celsiusParaFahrenheit(-273.15), -459.67);
    quase(fahrenheitParaCelsius(-459.67), -273.15);
  });
});
