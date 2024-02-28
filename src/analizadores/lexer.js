export default function analizarTexto(texto) {
    let palabrasReservadas = ["var", "task", "print", "in range", "iterate", "conditional", "then", "mainTask"];
    let numeros = /[0-9]+/;
    let asignacion = "=";
    let operadoresAritmeticos = /[+\-*/]/;
    let llaves = /[{ }]/;
    let parentesis = /[()]/;
    let signos = /[;.,><']/;
    let identificadores = /^[a-zA-Z][a-zA-Z0-9_]*$/;

    let gruposEncontrados = {
        "Palabras Reservadas": new Set(),
        "Numeros": new Set(),
        "Asignacion": new Set(),
        "Operadores Aritmeticos": new Set(),
        "Llaves": new Set(),
        "Parentesis": new Set(),
        "Signos": new Set(),
        "Identificadores": new Set(),
        "Errores Lexicos": new Set()
    };

    let resultado = [];

    texto = texto.replace(/\bin range\b/g, "in_range");

    texto = texto.replace(/'[^']*'/g, "''");

    let tokens = texto.match(/(?:[a-zA-Z][a-zA-Z0-9_]*|[0-9]+|[+\-*/]|[{}()\[\];',><])/g) || [];

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];

        if (token === "''") {
            gruposEncontrados["Signos"].add("''");
        } else {
            switch (true) {
                case palabrasReservadas.includes(token):
                    gruposEncontrados["Palabras Reservadas"].add(token);
                    break;
                case numeros.test(token):
                    gruposEncontrados["Numeros"].add(token);
                    break;
                case token === asignacion:
                    gruposEncontrados["Asignacion"].add(token);
                    break;
                case operadoresAritmeticos.test(token):
                    gruposEncontrados["Operadores Aritmeticos"].add(token);
                    break;
                case llaves.test(token):
                    gruposEncontrados["Llaves"].add(token);
                    break;
                case parentesis.test(token):
                    gruposEncontrados["Parentesis"].add(token);
                    break;
                case signos.test(token):
                    gruposEncontrados["Signos"].add(token);
                    break;
                case identificadores.test(token):
                    gruposEncontrados["Identificadores"].add(token);
                    break;
                default:
                    gruposEncontrados["Errores Lexicos"].add(token);
            }
        }
    }

    for (let grupo in gruposEncontrados) {
        let palabrasSinRepetir = Array.from(gruposEncontrados[grupo]);
        if (palabrasSinRepetir.length > 0) {
            resultado.push(grupo + " : " + JSON.stringify(palabrasSinRepetir));
            console.log(grupo + " : " + JSON.stringify(palabrasSinRepetir));
        }
    }
    return resultado;
}

var texto = "iterate i in range 1...7{print('Hola'+nombre)}";
analizarTexto(texto);
