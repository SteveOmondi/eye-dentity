import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'

console.log('Main.tsx: Starting execution');
const rootElement = document.getElementById('root');
console.log('Main.tsx: Root element found:', rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log('Main.tsx: Root created, rendering App...');
  root.render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
  console.log('Main.tsx: Render called');
}
else {
  console.error('Main.tsx: Root element NOT found!');
}
