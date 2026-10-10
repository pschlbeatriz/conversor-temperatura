import { describe, test, expect } from '@jest/globals';
import { celsiusParaKelvin, kelvinParaCelsius } from '../web/converter.js';

const quase = (atual, esperado) => expect(atual).toBeCloseTo(esperado, 9);

describe('acertos: Celsius -> Kelvin', () => {
  test('ponto de congelamento da água', () => quase(celsiusParaKelvin(0), 273.15));
  test('ponto de ebulição da água', () => quase(celsiusParaKelvin(100), 373.15));
  test('temperatura corporal', () => quase(celsiusParaKelvin(37), 310.15));
  test('valor negativo (-40)', () => quase(celsiusParaKelvin(-40), 233.15));
});

describe('acertos: Kelvin -> Celsius', () => {
  test('ponto de congelamento da água', () => quase(kelvinParaCelsius(273.15), 0));
  test('ponto de ebulição da água', () => quase(kelvinParaCelsius(373.15), 100));
  test('temperatura corporal', () => quase(kelvinParaCelsius(310.15), 37));
  test('valor negativo (-40 K -> -40 C)', () => quase(kelvinParaCelsius(233.15), -40));
});

describe('erros: entradas inválidas', () => {
  const invalidos = [['string', '10'], ['null', null], ['undefined', undefined], ['NaN', NaN], ['Infinity', Infinity]];

  test.each(invalidos)('Celsius -> Kelvin rejeita %s', (_nome, valor) => {
    expect(() => celsiusParaKelvin(valor)).toThrow(TypeError);
  });
  test.each(invalidos)('Kelvin -> Celsius rejeita %s', (_nome, valor) => {
    expect(() => kelvinParaCelsius(valor)).toThrow(TypeError);
  });

  test('Celsius abaixo do zero absoluto', () => {
    expect(() => celsiusParaKelvin(-273.16)).toThrow(RangeError);
  });
  test('Kelvin abaixo do zero absoluto', () => {
    expect(() => kelvinParaCelsius(-0.01)).toThrow(RangeError);
  });
});

describe('limites', () => {
  test('zero absoluto exato é aceito', () => {
    quase(celsiusParaKelvin(-273.15), 0);
    quase(kelvinParaCelsius(0), -273.15);
  });
});
