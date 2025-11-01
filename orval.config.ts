import { defineConfig } from 'orval'

export default defineConfig({
  opencode: {
    input: {
      target: 'http://0.0.0.0:56050/doc',
    },
    output: {
      target: './src/lib/api/generated.ts',
      client: 'react-query',
      mode: 'tags-split',
      schemas: './src/lib/api/model',
      override: {
        mutator: {
          path: './src/lib/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
