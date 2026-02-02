import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [page, setPage] = useState('dashboard')
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({ total: 0, premium: 0, thisMonth: 0 })
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState([])
  const [smsText, setSmsText] = useState('')
  const [showSms, setShowSms] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`)
      setCustomers(res.data)
    } catch (err) {
      console.error('Müşteriler yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`)
      setStats(res.data)
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err)
    }
  }

  const togglePremium = async (id, e) => {
    e?.stopPropagation()
    try {
      const res = await axios.patch(`${API_URL}/customers/${id}/premium`)
      setCustomers(customers.map(c => c.id === id ? res.data : c))
      if (selected?.id === id) setSelected(res.data)
      fetchStats()
    } catch (err) {
      console.error('Premium güncellenemedi:', err)
    }
  }

  const toggleCheck = (id) => setChecked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const deleteCustomer = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    try {
      await axios.delete(`${API_URL}/customers/${id}`)
      setCustomers(customers.filter(c => c.id !== id))
      if (selected?.id === id) { setSelected(null); setPage('customers') }
      fetchStats()
    } catch (err) {
      console.error('Silinemedi:', err)
    }
  }

  const sendSms = () => {
    const r = customers.filter(c => checked.includes(c.id))
    alert(`SMS gönderildi!\n\n${r.length} kişi\nMesaj: ${smsText}`)
    setShowSms(false)
    setSmsText('')
    setChecked([])
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('tr-TR')
  }

  // Icons
  const Icon = {
    Car: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
    Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Star: ({ filled }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5v14"/></svg>,
    Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
    Phone: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    MapPin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    Briefcase: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Msg: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/></svg>,
    Id: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  }

  // Dashboard
  const Dashboard = () => (
    <div>
      <div className="grid-3">
        <div className="stat-card stat-blue"><div><div className="stat-label">Toplam Müşteri</div><div className="stat-value">{stats.total}</div></div><Icon.Users /></div>
        <div className="stat-card stat-yellow"><div><div className="stat-label">Premium</div><div className="stat-value">{stats.premium}</div></div><Icon.Star filled /></div>
        <div className="stat-card stat-green"><div><div className="stat-label">Bu Ay</div><div className="stat-value">{stats.thisMonth}</div></div><Icon.Car /></div>
      </div>
      <div className="card">
        <div className="section-title">Son Müşteriler</div>
        {customers.slice(0, 5).map(c => (
          <div key={c.id} className="customer-item" onClick={() => { setSelected(c); setPage('profile') }}>
            <div className="customer-info">
              <div className="avatar">{c.ad[0]}{c.soyad[0]}</div>
              <div><div className="customer-name">{c.ad} {c.soyad} {c.premium && <Icon.Star filled />}</div><div className="customer-detail">{c.arac_bilgileri || '-'}</div></div>
            </div>
            <div className="customer-detail">{formatDate(c.satilan_tarih)}</div>
          </div>
        ))}
      </div>
    </div>
  )

  // Customer List
  const List = () => {
    const [search, setSearch] = useState('')
    
    const filtered = customers.filter(c =>
      `${c.ad} ${c.soyad}`.toLowerCase().includes(search.toLowerCase()) ||
      c.telefon?.includes(search) ||
      c.mail?.toLowerCase().includes(search.toLowerCase()) ||
      c.tc_kimlik?.includes(search)
    )

    const checkAll = () => setChecked(checked.length === filtered.length ? [] : filtered.map(c => c.id))

    return (
      <div>
        <div className="header-row">
          <h1 className="page-title">Müşteriler</h1>
          <div className="btn-group">
            {checked.length > 0 && <button className="btn btn-green" onClick={() => setShowSms(true)}><Icon.Msg />SMS ({checked.length})</button>}
            <button className="btn btn-blue" onClick={() => setPage('add')}><Icon.Plus />Yeni</button>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <input 
            className="search-input" 
            placeholder="İsim, telefon, e-posta veya TC ile ara..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}><input type="checkbox" className="checkbox" checked={checked.length === filtered.length && filtered.length > 0} onChange={checkAll} /></th>
                <th>Müşteri</th>
                <th className="hide-mobile">TC Kimlik</th>
                <th className="hide-mobile">İletişim</th>
                <th className="hide-mobile">Araç</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => { setSelected(c); setPage('profile') }}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" className="checkbox" checked={checked.includes(c.id)} onChange={() => toggleCheck(c.id)} /></td>
                  <td>
                    <div className="customer-info">
                      <div className="avatar">{c.ad[0]}{c.soyad[0]}</div>
                      <div>
                        <div className="customer-name">{c.ad} {c.soyad}<button className="star-btn" onClick={e => togglePremium(c.id, e)}><Icon.Star filled={c.premium} /></button></div>
                        <div className="customer-detail">{c.meslek || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile">{c.tc_kimlik || '-'}</td>
                  <td className="hide-mobile"><div>{c.telefon || '-'}</div><div className="customer-detail">{c.mail || '-'}</div></td>
                  <td className="hide-mobile">{c.arac_bilgileri || '-'}</td>
                  <td onClick={e => e.stopPropagation()}><button className="delete-btn" onClick={() => deleteCustomer(c.id)}><Icon.Trash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty">{loading ? 'Yükleniyor...' : 'Müşteri bulunamadı'}</div>}
        </div>
      </div>
    )
  }

  // Profile
  const Profile = () => {
    if (!selected) return null
    return (
      <div>
        <div className="header-row"><button className="back-link" onClick={() => setPage('customers')}>← Geri</button><button className="btn btn-red" onClick={() => deleteCustomer(selected.id)}><Icon.Trash />Sil</button></div>
        <div className="card">
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="avatar avatar-lg">{selected.ad[0]}{selected.soyad[0]}</div>
              <div><div className="profile-name">{selected.ad} {selected.soyad} {selected.premium && <span className="premium-badge">⭐ PREMIUM</span>}</div><div style={{ opacity: .9, marginTop: 4 }}>{selected.meslek || '-'}</div></div>
            </div>
          </div>
          <div className="profile-body">
            <div className="profile-grid">
              <div>
                <div className="profile-section-title">İletişim</div>
                <div className="profile-item"><Icon.Id /><div><div className="profile-item-label">TC Kimlik</div><div className="profile-item-value">{selected.tc_kimlik || '-'}</div></div></div>
                <div className="profile-item"><Icon.Phone /><div><div className="profile-item-label">Telefon</div><div className="profile-item-value">{selected.telefon || '-'}</div></div></div>
                <div className="profile-item"><Icon.Mail /><div><div className="profile-item-label">E-posta</div><div className="profile-item-value">{selected.mail || '-'}</div></div></div>
                <div className="profile-item"><Icon.MapPin /><div><div className="profile-item-label">Adres</div><div className="profile-item-value">{selected.adres || '-'}</div></div></div>
                <div className="profile-item"><Icon.Briefcase /><div><div className="profile-item-label">Meslek</div><div className="profile-item-value">{selected.meslek || '-'}</div></div></div>
              </div>
              <div>
                <div className="profile-section-title">Satış</div>
                <div className="profile-item"><Icon.Car /><div><div className="profile-item-label">Araç</div><div className="profile-item-value">{selected.arac_bilgileri || '-'}</div></div></div>
                <div className="profile-item"><Icon.Calendar /><div><div className="profile-item-label">Alınan</div><div className="profile-item-value">{formatDate(selected.alinan_tarih)}</div></div></div>
                <div className="profile-item"><Icon.Calendar /><div><div className="profile-item-label">Satılan</div><div className="profile-item-value">{formatDate(selected.satilan_tarih)}</div></div></div>
                <div className="profile-item"><Icon.User /><div><div className="profile-item-label">Referans</div><div className="profile-item-value">{selected.referans || '-'}</div></div></div>
              </div>
            </div>
            {selected.notlar && <div className="notes-box"><div className="notes-title">Notlar</div>{selected.notlar}</div>}
          </div>
        </div>
      </div>
    )
  }

  // Add Customer
  const Add = () => {
    const [localForm, setLocalForm] = useState({
      ad: '', soyad: '', telefon: '', mail: '', adres: '',
      meslek: '', arac_bilgileri: '', satilan_tarih: '',
      alinan_tarih: '', referans: '', notlar: '', premium: false, tc_kimlik: ''
    })

    const handleSubmit = async (e) => {
      e.preventDefault()
      if (!localForm.ad || !localForm.soyad) return alert('Ad ve soyad zorunlu')
      try {
        const res = await axios.post(`${API_URL}/customers`, localForm)
        setCustomers([res.data, ...customers])
        setPage('customers')
        fetchStats()
      } catch (err) {
        console.error('Eklenemedi:', err)
      }
    }

    return (
      <div>
        <div className="header-row"><h1 className="page-title">Yeni Müşteri</h1><button className="back-link" onClick={() => setPage('customers')}>İptal</button></div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Ad *</label><input className="form-input" value={localForm.ad} onChange={e => setLocalForm(prev => ({ ...prev, ad: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Soyad *</label><input className="form-input" value={localForm.soyad} onChange={e => setLocalForm(prev => ({ ...prev, soyad: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">TC Kimlik</label><input className="form-input" maxLength="11" value={localForm.tc_kimlik} onChange={e => setLocalForm(prev => ({ ...prev, tc_kimlik: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={localForm.telefon} onChange={e => setLocalForm(prev => ({ ...prev, telefon: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">E-posta</label><input className="form-input" value={localForm.mail} onChange={e => setLocalForm(prev => ({ ...prev, mail: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Meslek</label><input className="form-input" value={localForm.meslek} onChange={e => setLocalForm(prev => ({ ...prev, meslek: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Referans</label><input className="form-input" value={localForm.referans} onChange={e => setLocalForm(prev => ({ ...prev, referans: e.target.value }))} /></div>
              <div className="form-group form-group-full"><label className="form-label">Adres</label><input className="form-input" value={localForm.adres} onChange={e => setLocalForm(prev => ({ ...prev, adres: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Alınan Tarih</label><input className="form-input" type="date" value={localForm.alinan_tarih} onChange={e => setLocalForm(prev => ({ ...prev, alinan_tarih: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Satılan Tarih</label><input className="form-input" type="date" value={localForm.satilan_tarih} onChange={e => setLocalForm(prev => ({ ...prev, satilan_tarih: e.target.value }))} /></div>
              <div className="form-group form-group-full"><label className="form-label">Araç Bilgileri</label><textarea className="form-textarea" value={localForm.arac_bilgileri} onChange={e => setLocalForm(prev => ({ ...prev, arac_bilgileri: e.target.value }))} /></div>
              <div className="form-group form-group-full"><label className="form-label">Notlar</label><textarea className="form-textarea" rows="3" value={localForm.notlar} onChange={e => setLocalForm(prev => ({ ...prev, notlar: e.target.value }))} /></div>
              <div className="form-group form-group-full"><label className="form-checkbox"><input type="checkbox" className="checkbox" checked={localForm.premium} onChange={e => setLocalForm(prev => ({ ...prev, premium: e.target.checked }))} /> ⭐ Premium Müşteri</label></div>
            </div>
            <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => setPage('customers')}>İptal</button><button type="submit" className="btn btn-blue">Ekle</button></div>
          </form>
        </div>
      </div>
    )
  }

  // SMS Modal
  const SmsModal = () => {
    if (!showSms) return null
    const r = customers.filter(c => checked.includes(c.id))
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header"><div className="modal-title">📱 SMS Gönder</div><button className="modal-close" onClick={() => setShowSms(false)}>×</button></div>
          <div className="modal-body">
            <div><strong>{r.length}</strong> kişiye gönderilecek:</div>
            <div className="recipients-box">{r.map(c => <div key={c.id}>• {c.ad} {c.soyad} - {c.telefon}</div>)}</div>
            <div className="form-group"><label className="form-label">Mesaj</label><textarea className="form-textarea" rows="4" value={smsText} onChange={e => setSmsText(e.target.value)} /></div>
            <div style={{ fontSize: '.875rem', color: '#6b7280' }}>{smsText.length}/160 karakter</div>
            <div className="templates-box">
              <div className="templates-title">Hazır Şablonlar:</div>
              <button className="template-btn" onClick={() => setSmsText('Değerli müşterimiz, yeni yıl kampanyamızdan faydalanmak için galerimizi ziyaret edin.')}>🎄 Yeni Yıl</button>
              <button className="template-btn" onClick={() => setSmsText('Aracınızın periyodik bakım zamanı geldi. Randevu için bizi arayın.')}>🔧 Bakım</button>
              <button className="template-btn" onClick={() => setSmsText('Galeriye yeni araçlar geldi! Showroomumuzu ziyaret edin.')}>🚗 Yeni Araç</button>
            </div>
          </div>
          <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowSms(false)}>İptal</button><button className="btn btn-green" onClick={sendSms} disabled={!smsText.trim()}><Icon.Send />Gönder</button></div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-brand"><Icon.Car />Galeri CRM</div>
          <div className="nav-links">
            <button className={`nav-btn ${page === 'dashboard' ? 'nav-btn-active' : ''}`} onClick={() => setPage('dashboard')}>Ana Sayfa</button>
            <button className={`nav-btn ${['customers', 'profile', 'add'].includes(page) ? 'nav-btn-active' : ''}`} onClick={() => setPage('customers')}>Müşteriler</button>
          </div>
        </div>
      </nav>
      <main className="main">
        {page === 'dashboard' && <Dashboard />}
        {page === 'customers' && <List />}
        {page === 'profile' && <Profile />}
        {page === 'add' && <Add />}
      </main>
      <SmsModal />
    </div>
  )
}

export default App