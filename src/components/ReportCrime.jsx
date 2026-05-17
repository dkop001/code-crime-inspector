import { useState } from 'react';
import Editor from '@monaco-editor/react';

const ReportCrime = ({ onSubmit }) => {
  const [code, setCode] = useState('// Paste suspected code here...\nfunction investigate() {\n  \n}');
  const [errorMsg, setErrorMsg] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSubmit(code, errorMsg, language);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="glass" style={{
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h2 style={{ 
          fontFamily: 'var(--font-ui)', 
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '2rem',
          fontSize: '1.25rem',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ color: 'var(--accent-gold)' }}>●</span>
          FILE NEW INVESTIGATION
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="language-select">
              LANGUAGE
            </label>
            <select
              id="language-select"
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="code-editor">
              EVIDENCE-01: Source Material (Monaco Lab)
            </label>
            <div style={{ 
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden', 
              border: '1px solid var(--surface-highlight)',
              height: '350px'
            }}>
              <Editor
                height="100%"
                language={language}
                defaultValue={code}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="error-input">
              EVIDENCE-02: Runtime Trace (Optional)
            </label>
            <textarea
              id="error-input"
              className="form-textarea"
              placeholder="e.g. Uncaught TypeError: Cannot read properties of undefined..."
              value={errorMsg}
              onChange={(e) => setErrorMsg(e.target.value)}
              style={{ minHeight: '80px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button type="submit" className="btn-primary" disabled={!code.trim()}>
              Initiate Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCrime;
