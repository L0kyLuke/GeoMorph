import { useState } from 'react'
import ConversionForm from './components/ConversionForm.jsx'
import BulkConversion from './components/BulkConversion.jsx'
import ExcelWorkflow from './components/ExcelWorkflow.jsx'
import logoSvg from './media/logo.svg'

function App() {
  const [activeMode, setActiveMode] = useState('individual');

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--gm-canvas)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header className="app-header">
        <div className="container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: 0,
          maxWidth: '100%'
        }}>
          <img 
            src={logoSvg} 
            alt="GEOMORPH" 
            className="app-logo"
            style={{ height: '32px', width: 'auto' }}
          />
          <div style={{ 
            fontSize: '0.875rem',
            color: 'var(--gm-text-secondary)',
            fontWeight: 500
          }}>
            Conversor de Coordenadas
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, paddingTop: 'var(--gm-space-8)', paddingBottom: 'var(--gm-space-8)' }}>
        <div className="container">
          {/* Page Title */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--gm-space-8)' }}>
            <h1 style={{ 
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--gm-ink)',
              marginBottom: 'var(--gm-space-3)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em'
            }}>
              Conversión de Coordenadas Geográficas
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: 'var(--gm-text-secondary)',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Transformación precisa entre sistemas de referencia espacial: Decimal Degrees (DD), Universal Transverse Mercator (UTM) y Degrees Minutes Seconds (DMS)
            </p>
          </div>

          {/* Mode Selector - Segmented Control */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: 'var(--gm-space-8)'
          }}>
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'var(--gm-surface-muted)',
              borderRadius: 'var(--gm-radius-md)',
              padding: 'var(--gm-space-1)',
              gap: 'var(--gm-space-1)'
            }}>
              <button
                className="btn"
                style={{
                  minHeight: '40px',
                  padding: '0 var(--gm-space-5)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  backgroundColor: activeMode === 'individual' ? 'var(--gm-surface)' : 'transparent',
                  color: activeMode === 'individual' ? 'var(--gm-ink)' : 'var(--gm-text-secondary)',
                  border: activeMode === 'individual' ? '1px solid var(--gm-border)' : 'none',
                  boxShadow: activeMode === 'individual' ? 'var(--gm-shadow-sm)' : 'none'
                }}
                onClick={() => setActiveMode('individual')}
              >
                Individual
              </button>
              <button
                className="btn"
                style={{
                  minHeight: '40px',
                  padding: '0 var(--gm-space-5)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  backgroundColor: activeMode === 'bulk' ? 'var(--gm-surface)' : 'transparent',
                  color: activeMode === 'bulk' ? 'var(--gm-ink)' : 'var(--gm-text-secondary)',
                  border: activeMode === 'bulk' ? '1px solid var(--gm-border)' : 'none',
                  boxShadow: activeMode === 'bulk' ? 'var(--gm-shadow-sm)' : 'none'
                }}
                onClick={() => setActiveMode('bulk')}
              >
                Masiva
              </button>
              <button
                className="btn"
                style={{
                  minHeight: '40px',
                  padding: '0 var(--gm-space-5)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  backgroundColor: activeMode === 'excel' ? 'var(--gm-surface)' : 'transparent',
                  color: activeMode === 'excel' ? 'var(--gm-ink)' : 'var(--gm-text-secondary)',
                  border: activeMode === 'excel' ? '1px solid var(--gm-border)' : 'none',
                  boxShadow: activeMode === 'excel' ? 'var(--gm-shadow-sm)' : 'none'
                }}
                onClick={() => setActiveMode('excel')}
              >
                Excel
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {activeMode === 'individual' && <ConversionForm />}
            {activeMode === 'bulk' && <BulkConversion />}
            {activeMode === 'excel' && <ExcelWorkflow />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--gm-border)',
        padding: 'var(--gm-space-6)',
        backgroundColor: 'var(--gm-surface)'
      }}>
        <div className="container" style={{ 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--gm-text-muted)'
        }}>
          <p style={{ marginBottom: 0 }}>
            GEOMORPH · Datum WGS84 · Precisión de 8 decimales
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
