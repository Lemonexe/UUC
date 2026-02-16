import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import pkg from './package.json';

/** @type {import('vite').UserConfig} */
export default defineConfig({
	root: './src',
	base: './',
	plugins: [react({ compiler: { reactCompiler: true } })],
	build: {
		target: 'baseline-widely-available', // the default
		outDir: '../dist', // it is relative to root
		emptyOutDir: true,
	},
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	server: {
		port: 3000,
	},
});
