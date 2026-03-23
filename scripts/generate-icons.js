#!/usr/bin/env node
// scripts/generate-icons.js
// Jalankan: node scripts/generate-icons.js
// Menghasilkan icon PWA placeholder di folder public/

const fs = require('fs')
const path = require('path')

const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#0f1117"/>
  <rect x="${size*0.08}" y="${size*0.08}" width="${size*0.84}" height="${size*0.84}" rx="${size*0.14}" fill="#181b24"/>
  <text x="50%" y="54%" font-family="Arial Black, sans-serif" font-size="${size*0.42}" font-weight="900" fill="#c8f135" text-anchor="middle" dominant-baseline="middle">GT</text>
</svg>`

const publicDir = path.join(__dirname, '..', 'public')
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svgIcon(192))
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svgIcon(512))

console.log('✅ Icon SVG dihasilkan di folder public/')
console.log('ℹ️  Untuk PWA yang benar, konversi ke PNG menggunakan tool online seperti:')
console.log('   https://cloudconvert.com/svg-to-png')
console.log('   Lalu simpan sebagai: public/icon-192.png dan public/icon-512.png')
