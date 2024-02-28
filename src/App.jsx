import { useState } from "react";
import "./index.css";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import validateCode from "./analizadores/parser";
import analizarTexto from "./analizadores/lexer";

const CodeValidator = () => {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [lexerResult, setLexerResult] = useState('');



  const handleCodeChange = (code) => {
    const newCode = code;
    setCode(newCode);
  };

  const handleSubmit = () => {
    let errors = validateCode(code);
    let resultado = analizarTexto(code);

    const formateados = Object.entries(resultado).map(([categoria, valores]) => `${categoria} : ${valores}`).join('\n');

    setLexerResult(formateados)

    setErrors(errors);
  }

  return (
    <div className="content">
      <h3 className="errorsLog" >Analizador sintáctico</h3>
      <CodeMirror
        value={code}
        height="400px"

        theme={vscodeDark}
        onChange={(editor, change) => {
          handleCodeChange(editor);
          console.log(code)
        }}
      />

      <div style={{ marginLeft: "20px" }}>
        {Object.keys(errors).length > 0 ? (
          <ul className="errorsLog">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ) : (
          <p className="errorsLog">El código es válido.</p>
        )}
      </div>

      <div style={{ marginLeft: "20px", marginTop: "100px" }}>
        <h3 style={{ color: 'white' }}>Lexer</h3>
        <p className="errorsLog">{lexerResult}</p>
      </div>

      <button onClick={handleSubmit} className="buttonSubmit">Validar</button>
    </div>
  );
};

export default CodeValidator;
