import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'architectural-hmr-fix',
        transformIndexHtml(html) {
          // In AI Studio, the platform handles preview refreshes. 
          // Removing the Vite client prevents noisy WebSocket connection errors 
          // that arise from sandboxed network constraints.
          return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, '');
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
  };
});
