import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        deneyimlerim: 'deneyimlerim.html',
        yeteneklerim: 'yeteneklerim.html',
        iletisim: 'iletisim.html',
        projelerim: 'projelerim.html',
        'planet-transition': 'planet-transition.html'
      },
      output: {
        manualChunks: undefined
      }
    }
  },
  base: '/'
});
