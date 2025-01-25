# React + Vite + Tailwind CSS Project Setup

This guide provides step-by-step instructions to set up a React project with Vite and Tailwind CSS.

---

## 1. Install React with Vite

Run the following commands to create a new React project using Vite:

```bash
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