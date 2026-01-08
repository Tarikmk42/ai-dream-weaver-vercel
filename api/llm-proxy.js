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
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Простой fallback ответ
    const fallbackResponse = {
      choices: [{
        message: {
          content: `Вы сказали: "${lastMessage.substring(0, 50)}...". В мире снов вы видите таинственные образы. Что вы хотите сделать? 1. Исследовать дальше 2. Осмотреться вокруг 3. Искать подсказки`
        }
      }]
    };
    
    return res.status(200).json(fallbackResponse);
    
  } catch (error) {
    console.error('LLM Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
