import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import { ErrorBoundary } from './components/ErrorBoundary'

const root = document.getElementById("root");
if (!root) {
  console.error('Root element not found!');
} else {
  try {
    createRoot(root).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}
