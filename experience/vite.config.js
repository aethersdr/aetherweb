import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Two builds from one source:
//  - default: everything — JS, CSS, screenshots — inlined into dist/index.html
//    so the experience is one file that runs from file:// or any static host.
//  - `--mode site`: ordinary files under dist-site/ for aethersdr.com/experience/.
//    The site's CSP is script-src 'self', which blocks inline scripts, so the
//    single file can't run there; hashed assets also cache for a year.
export default defineConfig(({ mode }) => mode === 'site'
  ? {
      base: '/experience/',
      build: {
        target: 'es2022',
        outDir: 'dist-site',
        assetsInlineLimit: 0,
        chunkSizeWarningLimit: 4000,
        reportCompressedSize: true,
      },
    }
  : {
      base: './',
      plugins: [viteSingleFile()],
      build: {
        target: 'es2022',
        assetsInlineLimit: 100_000_000,
        cssCodeSplit: false,
        chunkSizeWarningLimit: 4000,
        reportCompressedSize: true,
      },
    });
