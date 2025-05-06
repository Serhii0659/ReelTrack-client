import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path'; // Імпортуємо resolve з 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // resolve тепер всередині об'єкта конфігурації
    alias: [
      { 
        find: "@", 
        replacement: resolve(__dirname, "./src") 
      }
    ]
  }
});
