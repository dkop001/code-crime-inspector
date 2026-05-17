import { useState } from 'react';
import Editor from '@monaco-editor/react';

const ReportCrime = ({ onSubmit }) => {
  const [code, setCode] = useState('// Paste suspected code here...\nfunction investigate() {\n  \n}');
  const [errorMsg, setErrorMsg] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' }
  ];

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
        overflow: 'visible'
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
            <label className="form-label">
              LANGUAGE
            </label>
            <div className="custom-dropdown desktop-only" style={{ position: 'relative' }}>
              <div 
                className="form-select" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {languages.find(l => l.value === language)?.label || 'Select Language'}
                <span style={{ 
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  color: 'var(--accent-gold)'
                }}>▼</span>
              </div>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#0d0d13',
                  border: '1px solid var(--surface-highlight)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '0.5rem',
                  zIndex: 1000,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {languages.map(l => (
                    <div 
                      key={l.value} 
                      onClick={() => {
                        setLanguage(l.value);
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        background: language === l.value ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        color: language === l.value ? 'var(--accent-gold)' : 'var(--text-primary)',
                        transition: 'all 0.2s ease',
                        borderBottom: '1px solid rgba(255,255,255,0.02)'
                      }}
                      className="dropdown-item-hover"
                    >
                      {l.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Native Select */}
            <select
              className="form-select mobile-only"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                appearance: 'auto' /* Use native appearance for arrow on mobile */
              }}
            >
              {languages.map(l => (
                <option key={l.value} value={l.value} style={{ background: '#0d0d13', color: 'var(--text-primary)' }}>{l.label}</option>
              ))}
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
