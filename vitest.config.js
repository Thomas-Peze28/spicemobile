import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: { __SM_VERSION__: JSON.stringify('test') },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
    restoreMocks: true,
  },
});
