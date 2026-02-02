const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL bağlantısı başarılı'))
  .catch(err => console.error('❌ PostgreSQL bağlantı hatası:', err));

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      'SELECT id, username, ad FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    res.json({ user: result.rows[0], token: 'logged-in' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Giriş hatası' });
  }
});

// Tüm müşterileri getir
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Tek müşteri getir
app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Yeni müşteri ekle
app.post('/api/customers', async (req, res) => {
  try {
    const { ad, soyad, telefon, mail, adres, meslek, arac_bilgileri, alinan_tarih, satilan_tarih, referans, notlar, premium, tc_kimlik, puan } = req.body;
    const result = await pool.query(
      `INSERT INTO customers (ad, soyad, telefon, mail, adres, meslek, arac_bilgileri, alinan_tarih, satilan_tarih, referans, notlar, premium, tc_kimlik, puan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [ad, soyad, telefon, mail, adres, meslek, arac_bilgileri, alinan_tarih || null, satilan_tarih || null, referans, notlar, premium || false, tc_kimlik, puan || 'yesil']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Müşteri eklenirken hata oluştu' });
  }
});

// Müşteri güncelle
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ad, soyad, telefon, mail, adres, meslek, arac_bilgileri, alinan_tarih, satilan_tarih, referans, notlar, premium, tc_kimlik, puan } = req.body;
    const result = await pool.query(
      `UPDATE customers SET ad=$1, soyad=$2, telefon=$3, mail=$4, adres=$5, meslek=$6, arac_bilgileri=$7, alinan_tarih=$8, satilan_tarih=$9, referans=$10, notlar=$11, premium=$12, tc_kimlik=$13, puan=$14, updated_at=NOW()
       WHERE id=$15 RETURNING *`,
      [ad, soyad, telefon, mail, adres, meslek, arac_bilgileri, alinan_tarih || null, satilan_tarih || null, referans, notlar, premium, tc_kimlik, puan, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

// Premium durumu değiştir
app.patch('/api/customers/:id/premium', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE customers SET premium = NOT premium, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

// Müşteri sil
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    res.json({ message: 'Müşteri silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Silme hatası' });
  }
});

// İstatistikler
app.get('/api/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM customers');
    const premium = await pool.query('SELECT COUNT(*) FROM customers WHERE premium = true');
    const thisMonth = await pool.query(
      "SELECT COUNT(*) FROM customers WHERE DATE_TRUNC('month', satilan_tarih) = DATE_TRUNC('month', CURRENT_DATE)"
    );
    res.json({
      total: parseInt(total.rows[0].count),
      premium: parseInt(premium.rows[0].count),
      thisMonth: parseInt(thisMonth.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'İstatistik hatası' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});