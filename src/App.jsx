import { useState } from "react";
import "./index.css";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import validateCode from "./analizadores/parser";
import analizarTexto from "./analizadores/lexer";

const CodeValidator = () => {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [lexerResult, setLexerResult] = useState([]);
  const [semanticErrors, setSemanticErrors] = useState([]);



  const handleCodeChange = (code) => {
    const newCode = code;
    setCode(newCode);
  };

  const handleSubmit = () => {
    let erroresSintacosYSemanticos = validateCode(code);
    setSemanticErrors(erroresSintacosYSemanticos[1]);
    setErrors(erroresSintacosYSemanticos[0]);

    let resultadoLexicos = analizarTexto(code);

    setLexerResult(resultadoLexicos)

  }

  return (
    <div className="content">
      <div className="left">
        <h3 className="title" >Analizador semántico</h3>
        <CodeMirror
          value={code}
          height="400px"

          theme={vscodeDark}
          onChange={(editor) => {
            handleCodeChange(editor);
          }}
        />
        <button onClick={handleSubmit} className="buttonSubmit">Validar</button>
      </div>

      <div className="right">

        <div style={{ marginLeft: "20px", height: 170, overflowY: 'scroll', backgroundColor: '#dedede'  }}>
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

        <div style={{ marginLeft: "20px", marginTop: 10, height: 150, overflow: 'hidden' }}>
          <h3 >Lexer</h3>
          {lexerResult.map((item, index) => <p style={{paddingLeft: 5}} key={index}>{item}</p>)}
        </div>

        <div className="semantic-output">
          <h3 className="semantic-title">Errores semánticos</h3>
          {semanticErrors.map((error, index) => (<p key={index}>{error}</p>)  )}
        </div>

      </div>
    </div>
  );
};

export default CodeValidator;
