# Expense Tracker Web App

A modern, responsive expense tracking web application successfully converted from a React Native mobile app. It provides tools to track expenses, view detailed analytics, manage a digital wallet, split bills with groups, and interact with a smart AI financial assistant.

## Tech Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS with custom design tokens and glassmorphism
- **Routing**: React Router (`react-router-dom`)
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Date Parsing**: date-fns

## Key Features

- **Dashboard (`/`)**: High-level overview of balances, income, expenses, and AI-generated insights.
- **Transactions Ledger (`/expenses`)**: A detailed breakdown of all your transactions with a responsive pie chart.
- **Digital Wallet (`/wallet`)**: Manage linked credit cards and perform quick actions like sending or requesting money.
- **Groups (`/groups`)**: Track shared expenses and easily split bills with friends and family.
- **AI Assistant (`/ai`)**: A dedicated chat interface to gain deeper insights into your financial health.
- **Responsive Navigation**: Adapts between a desktop sidebar and a mobile bottom navigation bar seamlessly based on screen width.

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm installed on your machine.

### Installation

1. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

You will need to run both the backend API and the frontend development server.

**1. Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**2. Start the Frontend:**
Open a new terminal window and run:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready bundle, run:
```bash
npm run build
```
This will compile the TypeScript code and generate static files in the `dist` directory.
