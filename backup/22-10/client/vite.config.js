import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy các file được tải lên để hiển thị đúng trên client
       '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Thêm proxy cho các API request để client có thể gọi được server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    // Đảm bảo Vite lắng nghe trên tất cả các network interfaces
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    // Thư mục output khi build, đi ra một cấp so với thư mục client hiện tại
    outDir: '../dist' 
  }
});