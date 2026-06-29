import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Expense Split Engine',
        short_name: 'ExpenseSplit',
        description: 'Split expenses and settle balances with ease.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        importScripts: ['/sw-sync.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          // Never Cache authentication routes and AI endpoints
          {
            urlPattern: /\/api\/auth\/(login|register|logout|refresh|logout-all)/,
            handler: 'NetworkOnly',
            method: 'POST'
          },
          {
            urlPattern: /\/api\/auth\/(login|register|logout|refresh|logout-all)/,
            handler: 'NetworkOnly',
            method: 'GET'
          },
          {
            urlPattern: /\/api\/ai\/categorize-receipt/,
            handler: 'NetworkOnly',
            method: 'POST'
          },
          // Stale While Revalidate
          {
            urlPattern: /\/api\/auth\/me/,
            handler: 'StaleWhileRevalidate',
            method: 'GET',
            options: {
              cacheName: 'profile-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 24 * 60 * 60 // 1 day
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\/api\/dashboard\/(analytics|summary)/,
            handler: 'StaleWhileRevalidate',
            method: 'GET',
            options: {
              cacheName: 'dashboard-analytics-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          // Network First for Groups, Expenses, Settlements, Notifications, Activities, and Dashboard general
          {
            urlPattern: /\/api\/groups(\/|$).*/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'groups-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\/api\/expenses(\/|$).*/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'expenses-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\/api\/settlements(\/|$).*/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'settlements-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\/api\/notifications(\/|$).*/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'notifications-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\/api\/dashboard(\/|$).*/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'dashboard-general-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 7 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          // Cache First for Assets: Fonts, CSS, JS, Images, Icons
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ]
})
