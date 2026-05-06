# 🧬 Gene Stream

A high-performance, interactive genomic data visualization dashboard built with **React 18**, **Rsbuild (Rspack)**, and **Mantine 7**. Designed for handling large-scale genomic datasets with smooth virtualization and just-in-time data fetching.

![Header](https://img.shields.io/badge/Bioinformatics-Data--Grid-blue?style=for-the-badge&logo=dna)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)

---

## 🚀 Key Features

- **⚡ Virtualized Data Grid**: Render tens of thousands of genes with zero lag using `mantine-react-table` and custom row virtualization.
- **📥 JIT Expression Fetching**: Dynamically resolves and fetches median expression data from the **GTEx API** only for visible genes in the viewport.
- **🗺️ Interactive Genomic Tracks**: High-fidelity gene annotation visualizations powered by **Gosling.js**.
- **📊 Advanced Analytics**: Interactive violin and box plots for tissue-specific expression distribution using **Plotly.js**.
- **🔗 URL State Persistence**: Seamlessly sync sorting, filtering, searching, and pagination states with the browser URL for easy sharing.
- **🛡️ Robust Data Processing**: Schema-validated CSV parsing with `PapaParse` and optimized O(n) data orchestration.

---

## 🛠️ Tech Stack

- **Framework**: [Rsbuild](https://rsbuild.rs/) (Next-gen build tool powered by Rspack)
- **UI Components**: [Mantine UI v7](https://mantine.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Table Engine**: [Mantine React Table](https://www.mantine-react-table.com/)
- **Visualization**: [Gosling.js](https://gosling-lang.org/), [Plotly.js](https://plotly.com/javascript/)
- **Data Handling**: [PapaParse](https://www.papaparse.com/)

---

## 📦 Getting Started

### 1. Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### 2. Installation

```bash
git clone https://github.com/xekurt/genes_data_grid.git
cd genes_data_grid
npm install
```

### 3. Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production

Generate optimized static assets:

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

---

## 📂 Project Structure

```text
src/
├── components/     # Generic reusable components (DataTable, URL hooks)
├── constants/      # App-wide constants and configurations
├── hooks/          # Shared custom hooks (CSV parsing, window size)
├── modules/        # Feature-scoped modules
│   ├── gene-data-table/   # The main grid and expression panels
│   └── gene-detail/       # Genomic tracks and distribution plots
├── services/       # API services (GTEx, Gosling spec generation)
├── store/          # Zustand global stores (Domain, UI, Cache)
├── types/          # TypeScript definitions
└── utils/          # Helper utilities (Validation, formatting)
```

---

## 🤝 Contributing

This project uses **Strict TypeScript** and **ESLint**. Please ensure all checks pass before submitting a PR:

```bash
npm run lint
npx tsc --noEmit
```
