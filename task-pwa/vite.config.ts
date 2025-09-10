import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['vite.svg'],
			manifest: {
				name: 'Task PWA',
				short_name: 'Tasks',
				description: 'Offline-first task management PWA',
				theme_color: '#0ea5e9',
				background_color: '#0ea5e9',
				display: 'standalone',
				start_url: '/',
				icons: [
					{ src: 'vite.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
					{ src: 'vite.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
				]
			},
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'sw.ts',
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico}']
			},
			devOptions: { enabled: true, type: 'module' }
		})
	]
}) 