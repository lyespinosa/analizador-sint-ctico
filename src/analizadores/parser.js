import SemanticAnalyzer from "./semantic-analyzer";

const grammar = [
    {
        regex: /^(var\s+[a-zA-Z]+\s+=\s+(?:\d+|'[^']*'));$/, //declarar variable
        message: "La asignación no es válida.",
    },
    {
        regex: /^([a-zA-Z]+\s+=\s+(?:\d+|'[^']*'));$/, //reasignar valor a variable
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
            /^(|conditional\s*\(\s*([a-zA-Z]+|\d+)\s*(<|>|<=|>=|==|!=)\s*([a-zA-Z]+|\d+)\s*\)\s*then\s*\{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\)\s*\})$/, //terminado
        message: "El condicional no es válido.",
    },
    {
        regex: /^(|mainTask\s*\(\)\s*{\s*print\(\s*(?:[a-zA-Z]+|'[^']*')(?:\s*\+\s*(?:[a-zA-Z]+|'[^']*'))?\s*\)\s*\})$/, //terminado
        message: "Funcion main no válida.",
    },
    {
        regex: /^(|print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\));$/, //terminado
    }

];

let semanticLogErrors = []

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

            let paramVariableTemp = null;

            if (line.startsWith("task")) {
                const functionNameAndParams = line.match(/task\s+(\w+)\s*(?:\((.*)\))?/);
                const functionName = functionNameAndParams[1];

                console.log(functionName)
                let error = analyzer.addFunction(functionName, []);
                error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);

                const params = functionNameAndParams[2];
                if (params) {
                    paramVariableTemp = params;
                }
            }

            if (line.trim().startsWith("conditional")) {
                const conditionStatement = line.match(/conditional\s*\((.*?)\)/);
                if (conditionStatement) {
                    const conditionContent = conditionStatement[1].trim();
                    const conditionMatch = conditionContent.match(/(\w+|\d+)\s*(<=|>=|==|!=|<|>)\s*(\w+|\d+)/);
                    if (conditionMatch) {
                        const variable1 = conditionMatch[1];
                        const operator = conditionMatch[2];
                        const variable2 = conditionMatch[3];

                        if (isNaN(Number(variable2))){
                            let error = analyzer.checkVariableDeclaration(variable1);
                            error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                        }
                        if (isNaN(Number(variable2))){
                            let error = analyzer.checkVariableDeclaration(variable2);
                            error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                        }
                        
                            
                        
                        // Validamos el operador lógico
                        const validOperators = ["<", ">", "<=", ">=", "==", "!="];
                        if (!validOperators.includes(operator)) {
                            return `Error en la línea ${lineNumber}: Operador lógico no válido "${operator}".`;
                        }
                    } else {
                        return `Error en la línea ${lineNumber}: Condición no válida "${conditionContent}".`;
                    }
                }
            }

            if (line.trim().startsWith("var")) {
                const variableDeclaration = line.trim().substring(4).trim();
                const variableName = variableDeclaration.split("=")[0].trim();
                const variableType = typeof eval(variableDeclaration.split("=")[1].trim());
                console.log('Variable creada')
                let error = analyzer.reassignVariableValue(variableName, variableType);
                error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                
            }
            else if (line.trim().startsWith("print")) {
                const printStatement = line.match(/print\s*\((.*?)\)/);
                if (printStatement) {
                    const printContent = printStatement[1].trim();
                    const words = printContent.match(/'[^']*'|\b\w+\b/g);
                    if (words) {
                        const variables = words.filter(word => !word.startsWith("'"));
                        for (let variable of variables) {
                            let error = analyzer.checkVariableDeclaration(variable);
                            error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                        }
                    }
                }
            }
            else if (line.includes("print")) {
                console.log('print')
                const IntoPrint = line.match(/print\s*\((.*?)\)/);
                if (IntoPrint) {
                    const contentTrimmed = IntoPrint[1].trim();
                    const words = contentTrimmed.match(/'[^']*'|\b\w+\b/g);
                    if (words) {
                        const variable = words.find(word => !word.startsWith("'"));
                        if (variable) {
                            if (variable == paramVariableTemp) {
                                paramVariableTemp = null;
                                return null;
                            }
                            let error = analyzer.checkVariableDeclaration(variable);
                            error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
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

    const finalSemanticErrors = semanticLogErrors
    semanticLogErrors = [];

    return [newErrors, finalSemanticErrors];
};

export default validateCode;
