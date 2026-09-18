import { celsiusParaFahrenheit, fahrenheitParaCelsius } from './converter.js';

const form = document.querySelector('#form');
const resultado = document.querySelector('#resultado');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = form.valor.value.trim().replace(',', '.');
  const conversor = form.sentido.value === 'cf' ? celsiusParaFahrenheit : fahrenheitParaCelsius;
  const unidade = form.sentido.value === 'cf' ? '°F' : '°C';

  resultado.classList.remove('erro');
  try {
    // Number('') vale 0, então campo vazio precisa ser tratado antes.
    if (texto === '') throw new TypeError('Informe um número válido.');
    resultado.textContent = `${conversor(Number(texto)).toFixed(2)} ${unidade}`;
  } catch (err) {
    resultado.classList.add('erro');
    resultado.textContent = err.message;
  }
});
