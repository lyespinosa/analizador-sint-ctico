import parser from './gramatica.cjs';

const resultado = parser.parse('int a = 42');

console.log(resultado)
