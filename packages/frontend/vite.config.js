import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

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
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
	},
});
