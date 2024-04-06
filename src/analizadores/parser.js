import SemanticAnalyzer from "./semantic-analyzer";

const grammar = [
    {
        regex: /^(var\s+[a-zA-Z]+\s+=\s+(?:\d+|'[^']*'));$/, //terminado
        message: "La asignación no es válida.",
    },
    {
        regex: /^([a-zA-Z]+\s+=\s+(?:\d+|'[^']*'));$/, //terminado
        message: "La asignación no es válida.",
    },
    {
        regex: /^(|task\s+[a-zA-Z]+\s*\((?:[a-zA-Z]+)?\)\s*\{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\)\s*\})$/,
        message: "La definición de la función no es válida.",
    },
    {
        regex: /^(|iterate\s+i\s+range\s+([0-9]+)\s*\.\.\.\s*([0-9]+)\s*\{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\)\s*\})$/, //terminado
        message: "El bucle no es válido.",
    },
    {
        regex:
            /^(|conditional\s*\(\s*([a-zA-Z]+|\d+)\s*(<|>|<=|>=|==|!=')\s*([a-zA-Z]+|\d+)\s*\)\s*then\s*\{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\)\s*\})$/, //terminado
        message: "El condicional no es válido.",
    },
    {
        regex: /^(|mainTask\s*\(\)\s*{\s*print\(\s*(?:[a-zA-Z]+|'[^']*')(?:\s*\+\s*(?:[a-zA-Z]+|'[^']*'))?\s*\)\s*\})$/, //terminado
        message: "Funcion main no válida.",
    },
    {
        regex: /^(|print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\))$/, //terminado
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


const validateLine = (line, lineNumber, analyzer) => {

    for (let rule of grammar) {
        if (rule.regex.test(line.trim())) {
            if (line.trim().startsWith("var")) {
                const variableDeclaration = line.trim().substring(4).trim();
                const variableName = variableDeclaration.split("=")[0].trim();
                const variableType = typeof eval(variableDeclaration.split("=")[1].trim());
                console.log('Variable creada')
                analyzer.reassignVariableValue(variableName, variableType);
            }
            else if (line.trim().startsWith("print")) {
                const printStatement = line.match(/print\s*\((.*?)\)/);
                if (printStatement) {
                    const printContent = printStatement[1].trim();
                    const words = printContent.match(/'[^']*'|\b\w+\b/g);
                    if (words) {
                        // Filtramos las palabras que no están entre comillas simples
                        const variables = words.filter(word => !word.startsWith("'"));
                        // Si se encuentran variables, verificamos cada una
                        for (let variable of variables) {
                            analyzer.checkVariableDeclaration(variable);
                        }
                    }
                }
            }
            return null;
        }
    }
    return `Error en la línea ${lineNumber}: en la declaración de: "${line.trim()}"`;
};

const validateCode = (codeToValidate) => {
    const lines = codeToValidate.split("\n");

    const newErrors = {};

    let blockCode = "";

    let insideBlock = false;

    const analyzer = new SemanticAnalyzer();
    const semanticLogErrors = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith("task") || line.trim().startsWith("iterate") || line.trim().startsWith("mainTask") || line.trim().startsWith("conditional")) {
            if (blockCode.trim() !== "") {
                const error = validateLine(blockCode, i, analyzer);
                if (error) {
                    newErrors[i - 1] = error;
                }
                blockCode = "";
            }

            blockCode += line + "\n";
            insideBlock = true;
        } else if (insideBlock) {
            blockCode += line + "\n";
            if (line.trim() === "}") {
                insideBlock = false;
                const error = validateLine(blockCode, i, analyzer);
                if (error) {
                    newErrors[i] = error;
                }
                blockCode = "";
            }
        } else {
            const error = validateLine(line, i + 1, analyzer);
            if (error) {
                newErrors[i] = error;
            }
        }
    }

    const bracketError = validateBrackets(codeToValidate);
    if (bracketError) {
        newErrors["brackets"] = bracketError;
    }

    return newErrors;
};

export default validateCode;
