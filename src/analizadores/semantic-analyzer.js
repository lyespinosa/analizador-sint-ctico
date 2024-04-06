// Definición del analizador semántico
export default function SemanticAnalyzer() {
    // Tabla de símbolos para almacenar variables y sus tipos
    this.symbolTable = {};
    // Tabla de funciones para almacenar la cantidad y uso de parámetros
    this.functionTable = {};

    // Método para agregar una variable a la tabla de símbolos
    this.addVariable = function (variableName, variableType) {
        if (this.symbolTable[variableName]) {
            console.error(`Error: La variable ${variableName} ya ha sido declarada.`);
            return false;
        }
        this.symbolTable[variableName] = variableType;
        return true;
    };

    // Método para verificar si una variable ya ha sido declarada
    this.checkVariableDeclaration = function (variableName) {
        if (!this.symbolTable[variableName]) {
            console.error(`Error: La variable ${variableName} no ha sido declarada.`);
            return false;
        }
        return true;
    };

     // Método para verificar la compatibilidad de tipos en una asignación
     this.checkTypeCompatibility = function (variableName, assignedType) {
        const declaredType = this.symbolTable[variableName];
        if (declaredType !== assignedType) {
            console.error(`Error: Tipo de datos incompatible ${assignedType} asignado a la variable ${variableName}.`);
            return false;
        }
        return true;
    };

     // Método para reasignar valor a una variable
     this.reassignVariableValue = function (variableName, assignedType) {
        if (!this.symbolTable[variableName]) {
            this.symbolTable[variableName] = assignedType;
        }
        return this.checkTypeCompatibility(variableName, assignedType);
    };

    // Método para agregar una función a la tabla de funciones
    this.addFunction = function (functionName, parameterTypes) {
        if (this.functionTable[functionName]) {
            console.error(`Error: La función ${functionName} ya ha sido declarada.`);
            return false;
        }
        this.functionTable[functionName] = parameterTypes;
        return true;
    };

    // Método para verificar si una función ha sido declarada
    this.checkFunctionDeclaration = function (functionName) {
        if (!this.functionTable[functionName]) {
            console.error(`Error: La función ${functionName} no ha sido declarada.`);
            return false;
        }
        return true;
    };

    // Método para verificar la cantidad y el tipo de parámetros en una llamada de función
    this.checkFunctionCall = function (functionName, parameterTypes) {
        const expectedParameterTypes = this.functionTable[functionName];
        if (expectedParameterTypes.length !== parameterTypes.length) {
            console.error(`Error: La cantidad de parámetros en la llamada a la función ${functionName} es incorrecta.`);
            return false;
        }
        for (let i = 0; i < expectedParameterTypes.length; i++) {
            if (expectedParameterTypes[i] !== parameterTypes[i]) {
                console.error(`Error: Tipo incorrecto para el parámetro ${i + 1} en la llamada a la función ${functionName}.`);
                return false;
            }
        }
        return true;
    };
}

// Ejemplo de uso del analizador semántico
const analyzer = new SemanticAnalyzer();

// Agregar variables a la tabla de símbolos
analyzer.addVariable("nombre", "string");
analyzer.addVariable("edad", "int");

// Verificar declaración de variables
analyzer.checkVariableDeclaration("nombre");
analyzer.checkVariableDeclaration("edad");

// Reasignar valor a variables
analyzer.reassignVariableValue("nombre", "float");
analyzer.reassignVariableValue("edad", "int");

// Agregar funciones a la tabla de funciones
analyzer.addFunction("sumar", ["int", "int"]);
analyzer.addFunction("concatenar", ["string", "string"]);

// Verificar declaración de funciones
analyzer.checkFunctionDeclaration("sumar");
analyzer.checkFunctionDeclaration("restar");

// Verificar llamadas a funciones con cantidad y tipo correcto de parámetros
analyzer.checkFunctionCall("sumar", ["int", "int"]);
analyzer.checkFunctionCall("concatenar", ["int", "int"]);

