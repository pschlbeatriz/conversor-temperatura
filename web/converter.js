const ZERO_ABSOLUTO_C = -273.15;
const ZERO_ABSOLUTO_F = -459.67;

function validar(valor, minimo) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new TypeError('Informe um número válido.');
  }
  if (valor < minimo) {
    throw new RangeError('Temperatura abaixo do zero absoluto.');
  }
}

// Entrada finita pode estourar para Infinity na multiplicação (ex.: Number.MAX_VALUE).
function resultado(valor) {
  if (!Number.isFinite(valor)) throw new RangeError('Valor grande demais para converter.');
  return valor;
}

export function celsiusParaFahrenheit(c) {
  validar(c, ZERO_ABSOLUTO_C);
  return resultado((c * 9) / 5 + 32);
}

export function fahrenheitParaCelsius(f) {
  validar(f, ZERO_ABSOLUTO_F);
  return resultado(((f - 32) * 5) / 9);
}
