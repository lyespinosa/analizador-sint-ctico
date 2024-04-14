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
        regex: /^(|task\s+[a-zA-Z]+\s*\((?:[a-zA-Z]+)?\)\s*\{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\);\s*\})$/,
        message: "La definición de la función no es válida.",
    },
    {
        regex: /^(|iterate\s+i\s+range\s+([0-9]+)\s*\.\.\.\s*([0-9]+)\s*\{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\);\s*\})$/, //terminado
        message: "El bucle no es válido.",
    },
    {
        regex:
            /^(|conditional\s*\(\s*([a-zA-Z]+|\d+)\s*(<|>|<=|>=|==|!=)\s*([a-zA-Z]+|\d+)\s*\)\s*then\s*\{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\);\s*\})$/, //terminado
        message: "El condicional no es válido.",
    },
    {
        regex: /^(|mainTask\s*\(\)\s*{\s*print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\);\s*\})$/, //terminado
        message: "Funcion main no válida.",
    },
    {
        regex: /^(print\(\s*(?:([a-zA-Z]+|'[^']*')\s*\+)?(?:\s*([a-zA-Z]+|'[^']*'))\s*\));$/, //terminado
    }

];

let semanticLogErrors = []

let outputs = [];

let newErrors = {};


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


const evalCondition = (valor1, operador, valor2) => {

    let valor1Int = parseInt(valor1)
    let valor2Int = parseInt(valor2)

    switch (operador) {
        case "==":
            return valor1Int == valor2Int;
        case "!=":
            return valor1Int != valor2Int;
        case ">":
            return valor1Int > valor2Int;
        case ">=":
            return valor1Int >= valor2Int;
        case "<":
            return valor1Int < valor2Int;
        case "<=":
            return valor1Int <= valor2Int;
        default:
            return false;
    }
}

const validateLine = (line, lineNumber, analyzer) => {
    for (let rule of grammar) {
        if (rule.regex.test(line.trim()) && Object.keys(newErrors).length === 0) {
            console.log("line", line);
            let functionParam = null;
            let conditionAccepted = null;
            let iterationIndices = [];
            let fromAnIteratation = false;
            let fromMainTask = false;

            if (line.startsWith("task")) {
                const functionNameAndParam = line.match(/task\s+(\w+)\s*(?:\((.*)\))?/);
                const functionName = functionNameAndParam[1];
                let error = analyzer.addFunction(functionName, []);
                error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                const param = functionNameAndParam[2];
                if (param) {
                    functionParam = param;
                }
            }
            if (line.startsWith("mainTask")) {
                fromMainTask = true;
            }
            if (line.trim().startsWith("conditional")) {
                const conditionStatement = line.match(/conditional\s*\((.*?)\)/);
                if (conditionStatement) {
                    const conditionContent = conditionStatement[1].trim();
                    const conditionMatch = conditionContent.match(/(\w+|\d+)\s*(<=|>=|==|!=|<|>)\s*(\w+|\d+)/);
                    if (conditionMatch) {
                        let variable1 = conditionMatch[1];
                        const operator = conditionMatch[2];
                        let variable2 = conditionMatch[3];

                        if (isNaN(Number(variable1))) {
                            let error = analyzer.checkVariableDeclaration(variable1);
                            error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                            variable1 = analyzer.getVariableValue(variable1);
                        }
                        if (isNaN(Number(variable2))) {
                            let error = analyzer.checkVariableDeclaration(variable2);
                            error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                            variable2 = analyzer.getVariableValue(variable2);
                        }
                        const conditionResult = evalCondition(variable1, operator, variable2);
                        if (conditionResult) {
                            conditionAccepted = true;
                        }
                        else {
                            conditionAccepted = false;
                        }
                    }
                }
            }

            if (line.trim().startsWith("iterate")) {
                const iterateStatement = line.match(/iterate\s+i\s+range\s+(\d+)\s*\.\.\.\s*(\d+)/);
                if (iterateStatement) {
                    const iterateFrom = iterateStatement[1];
                    const iterateTo = iterateStatement[2];
                    for (let i = iterateFrom; i <= iterateTo; i++) {
                        iterationIndices.push(i);
                    }
                }
                fromAnIteratation = true;
            }

            if (line.trim().startsWith("var")) {
                const regexExtractData = /^var\s+(\w+)\s*=\s*([^;]+);$/;
                const valores = line.trim().match(regexExtractData);
                if (valores) {
                    const variableName = valores[1].trim();
                    const variableValue = valores[2].trim();
                    let error = analyzer.reassignVariableValue(variableName, variableValue);
                    error && semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                }

            }
            else if (line.trim().startsWith("print")) {
                const regexExtractData = /'([^']*)'\s*\+\s*(\w+)\s*/;
                const valores = regexExtractData.exec(line);

                if (valores) {
                    const text = valores[1];
                    const variable = valores[2];

                    if (variable) {
                        let error = analyzer.checkVariableDeclaration(variable)
                        if (error) {
                            semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                        } else {
                            const newPrint = text + analyzer.getVariableValue(variable).replace(/^'|'$/g, '');
                            outputs.push(newPrint);
                        }
                    }
                }
                else {
                    semanticLogErrors.push(`Linea ${lineNumber} Error: La instrucción print debe contener una cadena seguida de una variable. Ejemplo: print('Hola' + variable);`);

                }
            }
            else if (line.includes("print")) {
                const IntoPrint = line.match(/print\s*\((.*?)\)/);
                const regexExtractData = /'([^']*)'\s*\+\s*(\w+)\s*/;
                const valores = regexExtractData.exec(IntoPrint[0]);
                if (valores) {
                    const text = valores[1];
                    const variable = valores[2];
                    if (variable) {
                        if (fromAnIteratation && iterationIndices.length > 0) {
                            if (variable == 'i' && !analyzer.getVariableValue('i')) {
                                for (let i = 0; i < iterationIndices.length; i++) {
                                    const newPrint = text + iterationIndices[i];
                                    outputs.push(newPrint);
                                }
                            }
                            else {
                                let error = analyzer.checkVariableDeclaration(variable);
                                if (error) {
                                    semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                                } else {
                                    for (let i = 0; i < iterationIndices.length; i++) {
                                        const newPrint = text + analyzer.getVariableValue(variable).replace(/^'|'$/g, '');
                                        outputs.push(newPrint);
                                    }
                                }
                            }
                        }
                        else if (fromMainTask) {
                            let error = analyzer.checkVariableDeclaration(variable);
                            if (error) {
                                semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                            }
                            else {
                                const newPrint = text + analyzer.getVariableValue(variable).replace(/^'|'$/g, '');
                                outputs.push(newPrint);
                                fromMainTask = false;
                            }
                        }
                        else if (variable == functionParam) {
                            functionParam = null;
                        }
                        else {
                            let error = analyzer.checkVariableDeclaration(variable);
                            if (error) {
                                semanticLogErrors.push(`Linea ${lineNumber} ${error}`);
                            } else if (conditionAccepted) {
                                const newPrint = text + analyzer.getVariableValue(variable).replace(/^'|'$/g, '');
                                outputs.push(newPrint);
                                conditionAccepted = false;
                            }
                        }
                    }
                    else {
                        semanticLogErrors.push(`Linea ${lineNumber} Error: Se debe concatenar una variable para imprimir.`);
                    }
                }
                else {
                    semanticLogErrors.push(`Linea ${lineNumber} Error: La instrucción print debe contener una cadena seguida de una variable. Ejemplo: print('Hola' + variable);`);

                }
            }
            return null;
        }
    }
    if (Object.keys(newErrors).length === 0) return `Error en la línea ${lineNumber}: en la declaración de: "${line.trim()}"`;
};

const validateCode = (codeToValidate) => {

    newErrors = {};

    const lines = codeToValidate.split("\n");


    let blockCode = "";
    let insideBlock = false;

    const analyzer = new SemanticAnalyzer();

    let statementWithBracketsOneLine = '';

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];


        if (line.trim().startsWith("task") || line.trim().startsWith("iterate") || line.trim().startsWith("mainTask") || line.trim().startsWith("conditional")) {
            if (line.trim().endsWith("}")) {
                statementWithBracketsOneLine = line.replace(/\{/g, "{\n").replace(/\}/g, "\n}");
                const error = validateLine(statementWithBracketsOneLine, i, analyzer);
                if (error) {
                    newErrors[i] = error;
                }
            }

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

    let finalOutputs = []
    if (finalSemanticErrors.length == 0) {
        finalOutputs = outputs;
        outputs = [];
    }



    return [newErrors, finalSemanticErrors, finalOutputs];
};

export default validateCode;
