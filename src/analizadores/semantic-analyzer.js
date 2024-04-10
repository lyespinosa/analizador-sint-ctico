export default function SemanticAnalyzer() {
    this.symbolTable = {};
    this.functionTable = {};

    this.checkVariableDeclaration = function (variableName) {
        if (!this.symbolTable[variableName]) {
            let error = `Error: La variable ${variableName} no ha sido declarada.`;
            return error;
        }
    };

     this.checkTypeCompatibility = function (variableName, variableValue) {
        const assignedType = typeof eval(variableValue);
        const declaredType = typeof eval(this.symbolTable[variableName]);
        if (declaredType !== assignedType) {
            let error = `Error: Tipo de datos incompatible ${assignedType} asignado a la variable ${variableName}.`
            return error;
        }
        this.symbolTable[variableName] = variableValue;
    };

     this.reassignVariableValue = function (variableName, variableValue) {   
        if (!this.symbolTable[variableName]) {
            this.symbolTable[variableName] = variableValue;
        }
        return this.checkTypeCompatibility(variableName, variableValue);
    };

    this.getVariableValue = function (variableName) {
        return this.symbolTable[variableName];
    };

    this.addFunction = function (functionName, parameterTypes) {
        if (this.functionTable[functionName]) {
            let error = `Error: La función ${functionName} ya ha sido declarada.`;
            return error;
        }
        this.functionTable[functionName] = parameterTypes;
    };

    

    
}




