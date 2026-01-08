import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Здесь будет ваш код для вызова Stable Diffusion API
    // Например, через Replicate или другой сервис
    
    const apiResponse = {
      images: ["base64_placeholder_image_here"],
      parameters: {
        prompt: prompt,
        steps: 20
      },
      info: "Image generation via Vercel proxy"
    };
    
    return res.status(200).json(apiResponse);
    
  } catch (error) {
    console.error('SD Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
