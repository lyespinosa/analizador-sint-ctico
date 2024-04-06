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



  const handleCodeChange = (code) => {
    const newCode = code;
    setCode(newCode);
  };

  const handleSubmit = () => {
    console.log(code);
    let errors = validateCode(code);
    let resultado = analizarTexto(code);

    setLexerResult(resultado)

    setErrors(errors);
  }

  return (
    <div className="content">
      <div className="left">
        <h3 className="title" >Analizador sintáctico</h3>
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
          <h3 >Lexer</h3>
          {lexerResult.map((item, index) => <p key={index}>{item}</p>)}
        </div>


      </div>
    </div>
  );
};

export default CodeValidator;
