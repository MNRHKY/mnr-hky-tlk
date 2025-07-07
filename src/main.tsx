import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('Main.tsx executing...');

const root = document.getElementById("root");
if (!root) {
  console.error('Root element not found!');
} else {
  console.log('Root element found, creating React root...');
  try {
    createRoot(root).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}
