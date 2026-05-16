import React from 'react';

const InvestigationLoader = () => {
  return (
    <div className="glass" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 2rem',
      borderRadius: 'var(--radius-lg)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2.5rem' }}>
        {/* Glamorous Pulsing Rings */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '2px solid var(--accent-gold)',
          borderRadius: '50%',
          animation: 'ripple 2s infinite ease-out'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          bottom: '10px',
          border: '2px solid var(--accent-gold)',
          borderRadius: '50%',
          animation: 'ripple 2s infinite ease-out 0.5s',
          opacity: 0.6
        }}></div>
        <div style={{
          position: 'absolute',
          top: '25px',
          left: '25px',
          width: '30px',
          height: '30px',
          backgroundColor: 'var(--accent-gold)',
          borderRadius: '50%',
          boxShadow: '0 0 20px var(--accent-gold)'
        }}></div>
      </div>

      <h2 style={{ 
        fontFamily: 'var(--font-ui)', 
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        letterSpacing: '4px',
        fontWeight: 400,
        fontSize: '1rem',
        textTransform: 'uppercase'
      }}>
        Analyzing Forensic Data
      </h2>

      <div style={{ 
        fontFamily: 'var(--font-code)', 
        fontSize: '0.75rem', 
        color: 'var(--accent-gold)',
        textAlign: 'center',
        opacity: 0.7,
        letterSpacing: '1px'
      }}>
        <div className="typing-text">Tracing execution paths...</div>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .typing-text {
          overflow: hidden;
          border-right: 2px solid var(--accent-gold);
          white-space: nowrap;
          margin: 0 auto;
          animation: 
            typing-anim 1.5s steps(30, end) infinite alternate,
            blink-caret 0.75s step-end infinite;
        }
        @keyframes typing-anim {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: var(--accent-gold) }
        }
      `}</style>
    </div>
  );
};

export default InvestigationLoader;
