const grammar = [
    {
        regex: /^(var\s+[a-zA-Z]+\s+=\s+(?:\d+|'[^']*'));$/, //terminado
        message: "La asignación no es válida.",
    },
    {
        regex: /^(|task\s+[a-zA-Z]+\((?:[a-zA-Z]+)?\){\s*print\((?:(?:[a-zA-Z]+|'[^']*')\+)?(?:[a-zA-Z]+|'[^']*')\)\s*})$/, //terminado
        message: "La definición de la función no es válida.",
    },
    {
        regex: /^(|iterate\s+i\s+range\s+([0-9]+)\s*\.\.\.\s*([0-9]+)\s*\{\s*print\((?:([a-zA-Z]+|'[^']*')\+)?(?:([a-zA-Z]+|'[^']*'))\)\s*})$/, //terminado
        message: "El bucle no es válido.",
    },
    {
        regex:
            /^(|conditional\(([a-zA-Z]+|\d+)(<|>|<=|>=|==|!=')([a-zA-Z]+|\d+)\)then\{\s*print\((?:([a-zA-Z]+|'[^']*')\+)?(?:([a-zA-Z]+|'[^']*'))\)\s*})$/, //terminado
        message: "El condicional no es válido.",
    },
    {
        regex: /^(|mainTask\(\)\s*\{\s*print\((?:([a-zA-Z]+|'[^']*')\+)?(?:([a-zA-Z]+|'[^']*'))\)\s*})$/, //terminado
        message: "Funcion main no válida.",
    }
];

const validateBrackets = (codeToValidate) => {
    const stack = [];
    const lines = codeToValidate.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === "{") {
                stack.push({ line: i + 1, char: j + 1 });
            } else if (char === "}") {
                if (stack.length === 0) {
                    return `Error: Llave de cierre sin correspondencia en la línea ${i + 1
                        }, columna ${j + 1}`;
                }
                stack.pop();
            }
        }
    }

    if (stack.length > 0) {
        const lastUnclosed = stack.pop();
        return `Error: Llave de apertura en la línea ${lastUnclosed.line}, columna ${lastUnclosed.char} sin cierre correspondiente`;
    }

    return null;
};

const validateLine = (line, lineNumber) => {
    for (let rule of grammar) {
        if (rule.regex.test(line.trim())) {
            return null;
        }
    }
    return `Error en la línea ${lineNumber}: en la declaración de: "${line.trim()}"`;
};

const validateCode = (codeToValidate) => {
    const lines = codeToValidate.split("\n");
    const newErrors = {};

    lines.forEach((line, index) => {
        const error = validateLine(line, index + 1);
        if (error) {
            newErrors[index] = error;
        }
    });

    const bracketError = validateBrackets(codeToValidate);
    if (bracketError) {
        newErrors["brackets"] = bracketError;
    }

    return newErrors;
};

export default validateCode;