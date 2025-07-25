// api/data.ts
// Esta é uma Função Serverless da Vercel.
// Requer que o projeto Vercel esteja vinculado a um Vercel Blob store.
// A variável de ambiente BLOB_READ_WRITE_TOKEN estará disponível automaticamente.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list } from '@vercel/blob';
import type { AppData } from '../src/types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const blobName = 'prayer-journal-data.json';

  if (request.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: blobName, limit: 1 });
      
      if (blobs.length > 0 && blobs[0].pathname === blobName) {
        const dataResponse = await fetch(blobs[0].url);
        if (!dataResponse.ok) {
            throw new Error(`Falha ao buscar dados do blob: ${dataResponse.statusText}`);
        }
        const data = await dataResponse.json();
        return response.status(200).json(data);
      } else {
        return response.status(200).json({ prayerLists: [], archivedCards: [] });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Erro ao buscar dados do Vercel Blob:', message);
      return response.status(500).json({ message: 'Erro ao buscar dados', error: message });
    }
  }

  if (request.method === 'POST') {
    try {
      const data: AppData = request.body;
      
      if (!data) {
        return response.status(400).json({ message: 'O corpo da requisição está vazio' });
      }

      await put(blobName, JSON.stringify(data), { 
        access: 'public',
        contentType: 'application/json',
      });
      
      return response.status(200).json({ message: 'Dados salvos com sucesso' });
    } catch (error) {
       const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Erro ao salvar dados no Vercel Blob:', message);
      return response.status(500).json({ message: 'Erro ao salvar dados', error: message });
    }
  }

  return response.status(405).json({ message: 'Método não permitido' });
}
