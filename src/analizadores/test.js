function extraerTexto(entradas) {
    const regex = /^(print\(\s*([a-zA-Z]+|'[^']*')\s*\+)?(\s*([a-zA-Z]+|'[^']*'))\s*\);$/;
    const resultados = [];
    
    for (const entrada of entradas) {
        const match = entrada.match(regex);
        if (match) {
            const texto = match[2] ? match[2].replace(/'/g, '') : match[4];
            resultados.push(texto);
        }
    }
    
    return resultados;
}

// Ejemplo de uso:
const entradas = [
    "print('Hola mundo');",
];

const textosExtraidos = extraerTexto(entradas);
console.log(textosExtraidos);
