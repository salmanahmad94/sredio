import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/app.ts'],
    format: ['esm'],
    platform: 'node',
    target: 'node22',
    sourcemap: true,
    clean: true,
    // The shared package ships TypeScript source, so it's bundled into the build.
    noExternal: [/^@sredio\/shared/]
});
