const Logo = ({ size = 50, showText = true, vertical = false }) => (
  <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: vertical ? '8px' : '12px' }}>
    <img src="/logo.png" alt="Ata Dilek" style={{ height: size }} />
    {showText && <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', textAlign: 'center' }}>Ata Dilek Otomotiv</span>}
  </div>
)

export default Logo