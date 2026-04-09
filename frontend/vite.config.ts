import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  ssr: {
    noExternal: ['svelte-sonner', '@hugeicons/svelte', '@hugeicons/core-free-icons'],
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
    },
  },
});
