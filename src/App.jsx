import { useState } from 'react';
import ReportCrime from './components/ReportCrime';
import InvestigationLoader from './components/InvestigationLoader';
import CrimeSceneDashboard from './components/CrimeSceneDashboard';
import { analyzeCodeCrimeWithFindings } from './services/aiService';
import { parseCode } from './services/parserService';
import './index.css';

function App() {
  const [appState, setAppState] = useState('input'); // 'input', 'loading', 'dashboard'
  const [evidence, setEvidence] = useState({ code: '', error: '' });
  const [investigationResult, setInvestigationResult] = useState(null);
  const [investigationError, setInvestigationError] = useState(null);

  const startInvestigation = async (code, error) => {
    setEvidence({ code, error });
    setAppState('loading');
    setInvestigationError(null);
    
    try {
      // 1. AST Parsing & Rule Engine
      const structuralFindings = parseCode(code);
      
      // 2. AI Commentary based on parser findings
      const result = await analyzeCodeCrimeWithFindings(code, error, structuralFindings);
      
      setInvestigationResult(result);
      setAppState('dashboard');
    } catch (err) {
      console.error(err);
      setInvestigationError(err.message || 'The forensic lab is currently offline.');
      setAppState('input');
    }
  };

  const resetCase = () => {
    setAppState('input');
    setEvidence({ code: '', error: '' });
    setInvestigationResult(null);
    setInvestigationError(null);
  };

  return (
    <div className="app-container">
      {/* Scanline effect removed as per user request */}
      
      <header style={{ 
        marginBottom: '3rem', 
        padding: '2rem 0',
        textAlign: 'center',
        borderBottom: '1px solid var(--surface-highlight)',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-ui)', 
          fontWeight: 800,
          fontSize: '2.5rem',
          color: 'var(--text-primary)',
          letterSpacing: '-1px',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{ 
            fontSize: '0.8rem', 
            textTransform: 'uppercase', 
            letterSpacing: '5px', 
            color: 'var(--accent-gold)',
            fontWeight: 400,
            marginBottom: '0.5rem'
          }}>
            Forensic Code Analysis
          </span>
          CODE CRIME INSPECTOR
        </h1>
        <div style={{ 
          height: '2px', 
          width: '60px', 
          background: 'var(--accent-gold)', 
          margin: '1.5rem auto 1rem' 
        }}></div>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem',
          letterSpacing: '1px',
          fontWeight: 300
        }}>
          Uncovering architectural violations with clinical precision.
        </p>
      </header>

      <main>
        {appState === 'input' && (
          <>
            {investigationError && (
              <div style={{ 
                backgroundColor: 'rgba(192, 57, 43, 0.1)', 
                color: 'var(--accent-crimson)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '2rem',
                border: '1px solid rgba(192, 57, 43, 0.2)',
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem'
              }}>
                [ ERROR: {investigationError} ]
              </div>
            )}
            <ReportCrime onSubmit={startInvestigation} />
          </>
        )}
        
        {appState === 'loading' && (
          <InvestigationLoader />
        )}
        
        {appState === 'dashboard' && investigationResult && (
          <CrimeSceneDashboard 
            evidence={evidence} 
            result={investigationResult} 
            onReset={resetCase} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
