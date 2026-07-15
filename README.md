# ⚛️ Alqurithms (Visual Quantum)

**Alqurithms** is an interactive, web-based quantum computing playground built for learning. It lets you build quantum circuits visually, simulate them with a real state-vector qubit engine, and step through classic quantum algorithms with side-by-side **trace, verification, and explanation** panels — including live OpenQASM code generation.

## Features

- **Drag-and-drop circuit builder** — construct quantum circuits by placing gates on qubit lines (`@dnd-kit`)
- **Real quantum gate engine** — implements core gates including Hadamard, Pauli-X, Pauli-Y/Z, CNOT, Toffoli, Measurement, and Barrier, operating on true state-vector qubit representations
- **3D state visualization** — a QSphere component (React Three Fiber / Three.js) for visualizing qubit states in 3D
- **Probability charts** — measurement outcome probabilities rendered with Chart.js
- **Guided quantum algorithms** — dedicated interactive walkthroughs for:
  - Deutsch's Algorithm
  - Deutsch–Jozsa Algorithm
  - Bernstein–Vazirani Algorithm
- **Trace / Verification / Explanation (TVE) framework** — a custom framework (`tve_framework/`) that lets each algorithm page show a step-by-step circuit trace, verify results against expected outcomes, and present a plain-language explanation
- **OpenQASM export** — view the equivalent OpenQASM code for each algorithm circuit

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router
- **3D Rendering:** Three.js, React Three Fiber, @react-three/drei
- **Drag & Drop:** @dnd-kit
- **Charts:** Chart.js, react-chartjs-2
- **Styling:** Tailwind CSS 4
- **Linting:** ESLint + typescript-eslint

## Project Structure

```
alqurithms/
├── src/
│   ├── circuit_builder/     # Circuit canvas, gates, and wire rendering
│   │   ├── Circuit.tsx
│   │   ├── Gate.tsx
│   │   └── Line.tsx
│   ├── engine/               # Core quantum simulation engine
│   │   ├── gates/             # Gate matrix implementations (Hadamard, CNOT, Pauli-X/Z, Toffoli, etc.)
│   │   ├── qubit/             # Qubit state representation & operations
│   │   └── types/             # Circuit configuration types
│   ├── tve_framework/        # Trace / Verification / Explanation framework
│   │   ├── trace/              # Step-by-step circuit playback
│   │   ├── verification/       # Algorithm correctness checks
│   │   └── explanation/        # Plain-language walkthroughs + OpenQASM export
│   ├── components/           # Shared UI (QSphere, Nav, Layout, Probabilities, etc.)
│   ├── pages/                 # Route-level pages (Home, Algorithms, Deutsch, etc.)
│   └── App.tsx                # Route definitions
└── public/
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)

### Installation
```bash
git clone https://github.com/jus-waa/alqurithms.git
cd alqurithms
npm install
```

### Run the development server
```bash
npm run dev
```
Then open the local URL Vite prints (typically `http://localhost:5173`).

### Build for production
```bash
npm run build
npm run preview
```

## Routes

| Path | Description |
|---|---|
| `/home` | Landing page |
| `/algorithms` | Overview of available quantum algorithms |
| `/deutsch` | Deutsch's Algorithm walkthrough |
| `/deutschJozsa` | Deutsch–Jozsa Algorithm walkthrough |
| `/bernsteinVazirani` | Bernstein–Vazirani Algorithm walkthrough |

## How It Works

1. **Build** a circuit by placing gates on qubit lines in the circuit builder.
2. The **engine** applies each gate as a matrix operation on the qubit state vector.
3. The **TVE framework** traces execution step-by-step, verifies the algorithm's output against the expected theoretical result, and explains what's happening at each stage in plain language — alongside the equivalent OpenQASM.

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software for personal or commercial projects, provided that the original copyright and license notice are included.
