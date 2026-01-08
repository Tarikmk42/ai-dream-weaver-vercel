import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS заголовки
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
    console.log('LLM Proxy: Processing request');
    
    const LLM_API_URL = process.env.LLM_API_URL;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    // Вариант 1: Используем ваш локальный LM Studio
    if (LLM_API_URL) {
      const response = await fetch(`${LLM_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json(data);
    }
    // Вариант 2: Используем OpenAI как fallback
    else if (OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: req.body.messages || [{ role: 'user', content: 'Привет' }],
          temperature: 0.7,
          max_tokens: 500,
          ...req.body
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.status}`);
      }

      const data = await response.json();
      return res.status(200).json(data);
    }
    // Вариант 3: Локальный fallback
    else {
      const messages = req.body.messages || [];
      const lastMessage = messages[messages.length - 1]?.content || '';
      
      const fallbackResponses = [
        `Вы сказали: "${lastMessage}". В мире снов вы видите таинственные образы. Что вы хотите сделать? 1. Исследовать дальше 2. Осмотреться 3. Искать подсказки`,
        `"${lastMessage}" - интересный выбор. Вы чувствуете магию вокруг. Варианты: 1. Пойти налево 2. Пойти направо 3. Ждать`,
        `В ответ на "${lastMessage}" мир снов отвечает загадкой. Выберите: 1. Разгадать загадку 2. Игнорировать 3. Записать в дневник`
      ];
      
      return res.status(200).json({
        choices: [{
          message: {
            content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
          }
        }]
      });
    }

  } catch (error) {
    console.error('LLM Proxy error:', error);
    
    // Fallback ответ при ошибке
    return res.status(200).json({
      choices: [{
        message: {
          content: `Я временно недоступен (ошибка: ${error.message}). Но игра продолжается! Вы можете: 1. Исследовать мир 2. Проверить инвентарь 3. Отдохнуть`
        }
      }]
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};