# VIN Decoder App

A modern web app to decode VIN numbers with history, CSV import/export, and offline support.  
Built with **React, Vite, TypeScript, and TailwindCSS**.

## ✨ Features
- Decode VINs using the [NHTSA API](https://vpic.nhtsa.dot.gov/api/).
- Save lookup history in IndexedDB (persists offline).
- Import/export history as CSV.
- Offline support via Service Worker.
- Clean responsive UI with TailwindCSS.
- Unit tests for VIN validation and CSV utils.

## 🚀 Tech Stack
- React + TypeScript
- Vite
- TailwindCSS
- IndexedDB
- Service Worker
- Jest (for utils tests)

## 📸 Screenshots

## 🛠️ Setup
Clone and install dependencies:
```bash
git clone https://github.com/Softwarehamid/vin-decoder-app.git
cd vin-decoder-app
npm install
npm run dev
