// test/gerado-ia.test.js
import {
  celsiusParaFahrenheit,
  fahrenheitParaCelsius,
  celsiusParaKelvin,
  kelvinParaCelsius,
  classificarTemperatura,
} from '../web/converter.js';

describe('Conversões de temperatura - cobertura completa', () => {
  test('celsiusParaFahrenheit converte corretamente', () => {
    expect(celsiusParaFahrenheit(0)).toBeCloseTo(32);
    expect(celsiusParaFahrenheit(100)).toBeCloseTo(212);
  });

  test('fahrenheitParaCelsius converte corretamente', () => {
    expect(fahrenheitParaCelsius(32)).toBeCloseTo(0);
    expect(fahrenheitParaCelsius(212)).toBeCloseTo(100);
  });

  test('celsiusParaKelvin converte corretamente', () => {
    expect(celsiusParaKelvin(0)).toBeCloseTo(273.15);
    expect(celsiusParaKelvin(-273.15)).toBeCloseTo(0);
  });

  test('kelvinParaCelsius converte corretamente', () => {
    expect(kelvinParaCelsius(273.15)).toBeCloseTo(0);
    expect(kelvinParaCelsius(0)).toBeCloseTo(-273.15);
  });

  test('classificarTemperatura cobre todas as categorias', () => {
    expect(classificarTemperatura(-10)).toBe('congelante');
    expect(classificarTemperatura(5)).toBe('frio');
    expect(classificarTemperatura(20)).toBe('agradavel');
    expect(classificarTemperatura(30)).toBe('quente');
  });

  test('validar lança TypeError para valores não numéricos', () => {
    const invalidValues = [null, undefined, '100', {}, [], NaN, Infinity];
    invalidValues.forEach((val) => {
      expect(() => celsiusParaFahrenheit(val)).toThrow(TypeError);
    });
  });

  test('validar lança RangeError para temperaturas abaixo do zero absoluto', () => {
    expect(() => celsiusParaFahrenheit(-274)).toThrow(RangeError);
    expect(() => fahrenheitParaCelsius(-500)).toThrow(RangeError);
    expect(() => kelvinParaCelsius(-1)).toThrow(RangeError);
  });

  test('resultado lança RangeError quando o cálculo gera Infinity', () => {
    // Use Number.MAX_VALUE que ao multiplicar pode gerar Infinity
    const huge = Number.MAX_VALUE;
    expect(() => celsiusParaFahrenheit(huge)).toThrow(RangeError);
    expect(() => fahrenheitParaCelsius(huge)).toThrow(RangeError);
  });
});
