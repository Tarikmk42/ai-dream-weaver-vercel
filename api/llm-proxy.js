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
    // Тестовый ответ
    return res.status(200).json({
      choices: [{
        message: {
          content: "Это тестовый ответ от LLM прокси. В реальной версии здесь будет ответ от нейросети.\n\nЧто вы можете сделать:\n1. Исследовать лес\n2. Проверить инвентарь\n3. Искать подсказки"
        }
      }]
    });
    
  } catch (error) {
    console.error('LLM Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
