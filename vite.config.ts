
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { VercelRequest, VercelResponse } from '@vercel/node';
import apiHandler from './api/data';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vercel-api-middleware',
      configureServer(server) {
        server.middlewares.use('/api/data', (req, res) => {
          const request = req as VercelRequest;
          const response = res as VercelResponse;

          // Polyfill Vercel's response helpers for the dev server
          response.status = (statusCode: number) => {
            response.statusCode = statusCode;
            return response;
          };
          response.json = (body: any) => {
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(body));
            return response;
          };

          if (request.method === 'POST') {
            let body = '';
            request.on('data', chunk => {
              body += chunk.toString('utf-8');
            });
            request.on('end', () => {
              try {
                // Attach the parsed body to the request object to mimic Vercel's environment
                request.body = body ? JSON.parse(body) : {};
              } catch (e) {
                response.status(400).json({ message: "JSON inválido no corpo da requisição" });
                return;
              }
              // Call the handler and catch potential errors
              apiHandler(request, response).catch(err => {
                console.error("Erro no manipulador da API (POST):", err);
                response.status(500).json({ message: "Erro Interno do Servidor" });
              });
            });
          } else {
            // Call the handler for GET requests and catch potential errors
            apiHandler(request, response).catch(err => {
                console.error("Erro no manipulador da API (GET):", err);
                response.status(500).json({ message: "Erro Interno do Servidor" });
            });
          }
        });
      }
    }
  ],
})
