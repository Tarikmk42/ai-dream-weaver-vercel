// Импортируем node-fetch для Node.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Включаем CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { prompt } = req.body || {};
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required',
        usage: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { prompt: 'your prompt here', steps: 20, width: 512, height: 384 }
        }
      });
    }
    
    console.log('SD Proxy: Processing request for prompt:', prompt.substring(0, 100));
    
    // Тестовый ответ - замените на реальный вызов API
    const mockImage = await generateMockImage(prompt);
    
    return res.status(200).json({
      images: [mockImage],
      parameters: {
        prompt: prompt,
        steps: 20,
        width: 512,
        height: 384
      },
      info: "Image generation via Vercel proxy",
      note: "This is a mock response. Configure your SD API in environment variables."
    });
    
  } catch (error) {
    console.error('SD Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Функция для генерации mock изображения
async function generateMockImage(prompt) {
  // Создаем простой SVG изображение как placeholder
  const svg = `
    <svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4a6fff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8a2fff;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="256" cy="192" r="100" fill="rgba(255,255,255,0.1)" filter="url(#glow)"/>
      <text x="256" y="192" font-family="Arial" font-size="20" fill="white" text-anchor="middle" opacity="0.8">
        ${prompt.substring(0, 30)}...
      </text>
      <text x="256" y="350" font-family="Arial" font-size="16" fill="white" text-anchor="middle" opacity="0.6">
        AI Dream Weaver - Mock Image
      </text>
    </svg>
  `;
  
  // Конвертируем SVG в base64
  return Buffer.from(svg).toString('base64');
}
