
## Install React
npm init vite@latest
npm install

## Run project
npm run dev

## Install Tailwind CSS
npm install tailwindcss @tailwindcss/vite

## Configure the Vite plugin
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

## Import Tailwind CSS
@import "tailwindcss";