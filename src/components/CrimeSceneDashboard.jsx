import React from 'react';

const ExecutionTimeline = ({ timeline }) => {
  if (!timeline) return null;

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', height: '100%' }}>
      <h3 className="section-title">Execution Timeline</h3>
      <div style={{ position: 'relative', paddingLeft: '2rem', marginTop: '1.5rem' }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '0',
          bottom: '0',
          width: '2px',
          background: 'linear-gradient(to bottom, var(--accent-gold) 0%, rgba(212, 175, 55, 0.1) 100%)',
          borderRadius: '1px'
        }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {timeline.map((item, idx) => (
            <div 
              key={idx} 
              className="timeline-item"
              style={{ 
                position: 'relative',
                animation: `slideRightFade 0.5s ease-out forwards ${idx * 0.4}s`,
                opacity: 0
              }}
            >
              {/* Dot */}
              <div style={{
                position: 'absolute',
                left: '-2rem',
                top: '6px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: item.status === 'danger' ? '#ff4d4d' : item.status === 'warning' ? '#ff944d' : 'var(--bg-color)',
                border: `3px solid ${item.status === 'danger' ? '#ff4d4d' : item.status === 'warning' ? '#ff944d' : 'var(--accent-gold)'}`,
                boxShadow: item.status === 'danger' ? '0 0 10px #ff4d4d' : 'none',
                zIndex: 2
              }}></div>

              <div>
                <div style={{ 
                  fontSize: '0.65rem', 
                  color: 'var(--text-muted)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  marginBottom: '2px'
                }}>
                  Step {item.step}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: item.status === 'danger' ? '#ff4d4d' : 'var(--text-primary)',
                  fontWeight: item.status === 'danger' ? 700 : 400,
                  fontFamily: 'var(--font-ui)'
                }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideRightFade {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

const CrimeSceneDashboard = ({ evidence, result, onReset }) => {
  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return '#ff4d4d';
      case 'HIGH': return '#ff944d';
      case 'MEDIUM': return '#ffd11a';
      case 'LOW': return '#5cd65c';
      default: return 'var(--accent-gold)';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      {/* Case Header */}
      <div className="glass" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem 2.5rem',
        borderRadius: 'var(--radius-md)',
        borderLeft: `6px solid ${getSeverityColor(result.verdict?.severity)}`
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-ui)', 
              color: 'var(--text-primary)',
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 800
            }}>
              {result.verdict?.title}
            </h2>
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '2px 8px', 
              borderRadius: '20px', 
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {result.caseId}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '8px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {result.verdict?.category} INVESTIGATION // <span style={{ color: getSeverityColor(result.verdict?.severity) }}>{result.verdict?.severity}</span>
          </p>
        </div>
        <button onClick={onReset} className="btn-secondary" style={{ padding: '0.7rem 1.5rem' }}>
          ARCHIVE CASE
        </button>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Evidence & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Evidence Panel */}
          <div className="glass" style={{ 
            padding: '2rem', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 className="section-title">Crime Scene Evidence</h3>
            <div style={{ 
              flex: 1, 
              backgroundColor: 'rgba(0,0,0,0.4)', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-code)',
              fontSize: '0.85rem',
              color: '#d1d1e0',
              overflow: 'auto',
              maxHeight: '350px',
              whiteSpace: 'pre',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {evidence.code.split('\n').map((line, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    backgroundColor: (idx + 1) === result.crimeScene?.suspectLine ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    padding: '4px 8px',
                    borderRadius: '2px',
                    display: 'flex',
                    borderLeft: (idx + 1) === result.crimeScene?.suspectLine ? `3px solid ${getSeverityColor(result.verdict?.severity)}` : 'none'
                  }}
                >
                  <span style={{ width: '35px', color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>{idx + 1}</span>
                  <span style={{ color: (idx + 1) === result.crimeScene?.suspectLine ? '#fff' : 'inherit' }}>{line}</span>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>THE VICTIM</div>
              <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{result.crimeScene?.theVictim}</div>
            </div>
          </div>

          {/* Timeline Panel */}
          <ExecutionTimeline timeline={result.executionTimeline} />
        </div>

        {/* Right Column: Investigation & Rehabilitation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Forensic Notes */}
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 className="section-title">Investigator's Synopsis</h3>
            <p style={{ fontFamily: 'var(--font-ui)', lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic' }}>
              "{result.investigationNotes?.synopsis}"
            </p>
            
            <h3 className="section-title" style={{ marginTop: '2rem' }}>Forensic Breakdown</h3>
            <p style={{ fontFamily: 'var(--font-ui)', lineHeight: '1.6', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {result.investigationNotes?.forensicEvidence}
            </p>
          </div>

          {/* Rehabilitation */}
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(18, 18, 24, 0.7) 0%, rgba(20, 30, 20, 0.4) 100%)', borderLeft: '4px solid #5cd65c' }}>
            <h3 className="section-title">Rehabilitation Plan</h3>
            <div style={{ fontFamily: 'var(--font-ui)', color: '#d1e7d1', fontSize: '0.95rem', lineHeight: '1.7' }}>
              {result.investigationNotes?.recommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ 
        marginTop: '3rem', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--surface-highlight)',
        color: 'var(--text-muted)',
        fontSize: '0.7rem',
        letterSpacing: '1px'
      }}>
        <span>FORENSIC LAB CONFIDENCE SCORE: {result.metadata?.confidenceScore}%</span>
        <span>LAB TIMESTAMP: {new Date().toISOString()}</span>
      </div>

      <style>{`
        .section-title {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          margin-bottom: 1.25rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default CrimeSceneDashboard;
