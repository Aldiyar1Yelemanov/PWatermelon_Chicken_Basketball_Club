import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/PWatermelon_Chicken_Basketball_Club/',
  server: { port: 5173 }
})
