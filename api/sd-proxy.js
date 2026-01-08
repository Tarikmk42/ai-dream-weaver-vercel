import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Обрабатываем OPTIONS запрос (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Проверяем метод
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('SD Proxy: Processing request');
    
    // Получаем ваш SD API URL из переменных окружения
    const SD_API_URL = process.env.SD_API_URL;
    
    if (!SD_API_URL) {
      return res.status(500).json({ 
        error: 'SD_API_URL не настроен. Добавьте в настройках Vercel.' 
      });
    }

    // Проксируем запрос к вашему Stable Diffusion API
    const response = await fetch(`${SD_API_URL}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      timeout: 60000, // 60 секунд таймаут
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SD API error:', errorText);
      return res.status(response.status).json({ 
        error: `SD API error: ${response.status}`,
        details: errorText.substring(0, 500)
      });
    }

    const data = await response.json();
    
    // Для безопасности ограничиваем размер ответа
    if (data.images && data.images[0] && data.images[0].length > 5000000) {
      return res.status(500).json({ error: 'Изображение слишком большое' });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('SD Proxy error:', error);
    
    // Пробуем использовать Replicate как fallback
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        console.log('Trying Replicate fallback...');
        const replicateResult = await generateWithReplicate(req.body);
        return res.status(200).json(replicateResult);
      } catch (replicateError) {
        console.error('Replicate fallback failed:', replicateError);
      }
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Fallback функция через Replicate
async function generateWithReplicate(payload) {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      input: {
        prompt: payload.prompt,
        negative_prompt: payload.negative_prompt,
        width: payload.width || 512,
        height: payload.height || 384,
        num_outputs: 1,
        num_inference_steps: payload.steps || 20,
        guidance_scale: payload.cfg_scale || 7
      }
    })
  });

  const data = await response.json();
  
  // Ждем завершения
  let prediction;
  for (let i = 0; i < 60; i++) {
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
      headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    prediction = await statusResponse.json();
    
    if (prediction.status === 'succeeded') {
      // Скачиваем изображение
      const imageResponse = await fetch(prediction.output[0]);
      const buffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return { images: [base64] };
    } else if (prediction.status === 'failed') {
      throw new Error('Replicate generation failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Replicate timeout');
}

// Настройка максимального времени выполнения функции (Vercel ограничивает 10-15 сек)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};