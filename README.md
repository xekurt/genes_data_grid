# 🧬 Gene Stream

A high-performance, interactive genomic data visualization dashboard built with **React 18**, **Rsbuild (Rspack)**, and **Mantine 7**. Engineered for large-scale genomic datasets with smooth virtualization, architectural robustness, and just-in-time data fetching.

![Header](https://img.shields.io/badge/Bioinformatics-Data--Grid-blue?style=for-the-badge&logo=dna)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)

---

## 🚀 Key Features

- **⚡ Virtualized Data Grid**: Render tens of thousands of genes with zero lag using `mantine-react-table` and custom row virtualization, optimized for high-density analytical work.
- **📥 JIT Expression Fetching**: Intelligent data orchestration that dynamically fetches median expression data from the **GTEx API** only for genes currently visible in the viewport.
- **📊 Advanced Genomic Analytics**: 
    - **Interactive Tracks**: High-fidelity gene annotation visualizations powered by **Gosling.js** using custom composite tracks.
    - **Distribution Plots**: Interactive Plotly-based violin and box plots for tissue-specific expression analysis.
- **🔗 URL State Persistence**: Seamlessly sync sorting, filtering, searching, and pagination states with the browser URL for persistent sessions and easy sharing.
- **🛡️ Robust Data Validation**: Strict schema-validated CSV parsing with `PapaParse` and O(n) data orchestration to ensure genomic data integrity.
- **🧠 Multi-Store State Management**: Scalable architecture using **Zustand** with specialized stores (Domain, UI, Cache, Expression) for predictable data flow.

---

## 🛠️ Tech Stack

- **Framework**: [Rsbuild](https://rsbuild.rs/) (Next-gen build tool powered by Rspack)
- **UI Components**: [Mantine UI v7](https://mantine.dev/)
- **State Management**: [Zustand v5](https://zustand-demo.pmnd.rs/)
- **Table Engine**: [Mantine React Table](https://www.mantine-react-table.com/)
- **Visualization**: [Gosling.js](https://gosling-lang.org/), [Plotly.js](https://plotly.com/javascript/)
- **Data Handling**: [PapaParse](https://www.papaparse.com/), [Lodash](https://lodash.com/)

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
├── components/         # Generic reusable components (DataTable, URL hooks)
├── constants/          # App-wide constants and GTEx configurations
├── hooks/              # Shared custom hooks (CSV parsing, lifecycle)
├── modules/            # Feature-scoped modules
│   └── gene-dashboard/ # Central application orchestrator
│       ├── components/ # Dashboard-specific UI (Table, Expression panels)
│       │   └── gene-detail/ # Detailed view with Gosling & Plotly
│       └── hooks/      # Module-specific logic
├── services/           # API services (GTEx fetching, Gosling spec generation)
├── store/              # Specialized Zustand stores (Domain, UI, Cache, Expression)
├── types/              # Strict TypeScript definitions
└── utils/              # Helper utilities (Validation, Coordinate formatting)
```

---

## 🛡️ Quality & Performance

This project adheres to senior-principal engineering standards:
- **Performance**: Virtualized rendering and debounced API calls to minimize main-thread blocking.
- **Type Safety**: Strict TypeScript configuration with exhaustive type checking for genomic records.
- **Validation**: Early-exit validation patterns for large CSV imports to detect malformed data without performance hits.

---

## 🤝 Contributing

Ensure all linting and type checks pass before submitting a PR:

```bash
npm run lint
npm run format
npx tsc --noEmit
```
