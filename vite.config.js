import { resolve } from 'path';
import { defineConfig } from 'vite';


// Serve /about as about.html in dev and preview, like GitHub Pages does in production (clean URLs)
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) { server.middlewares.use(rewrite); },
  configurePreviewServer(server) { server.middlewares.use(rewrite); },
};
function rewrite(req, _res, next) {
  const [path, query = ''] = (req.url || '').split('?');
  if (/^\/(about|services|products|projects|contact)\/?$/.test(path)) {
    req.url = path.replace(/\/$/, '') + '.html' + (query ? '?' + query : '');
  }
  next();
}

export default defineConfig({
  plugins: [cleanUrls],
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        products: resolve(__dirname, 'products.html'),
        projects: resolve(__dirname, 'projects.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
