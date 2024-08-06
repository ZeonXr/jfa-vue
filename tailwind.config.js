/** @type {import('tailwindcss').Config} */
import primeui from 'tailwindcss-primeui'
import { addDynamicIconSelectors } from '@iconify/tailwind'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  plugins: [primeui, addDynamicIconSelectors()]
}
