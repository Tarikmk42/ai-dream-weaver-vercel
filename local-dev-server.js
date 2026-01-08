import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Local development server'
  });
});

// SD Proxy endpoint
app.post('/api/sd-proxy', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log('SD Proxy request:', prompt?.substring(0, 100));
    
    // Mock response for local development
    res.json({
      images: [generateMockImage(prompt)],
      parameters: { prompt },
      info: "Local mock response"
    });
    
  } catch (error) {
    console.error('SD Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// LLM Proxy endpoint
app.post('/api/llm-proxy', (req, res) => {
  try {
    const { messages } = req.body;
    const lastMessage = messages?.[messages.length - 1]?.content || '';
    
    console.log('LLM Proxy request:', lastMessage.substring(0, 100));
    
    // Generate response
    const response = generateStoryResponse(lastMessage);
    
    res.json({
      choices: [{
        message: {
          content: response,
          role: 'assistant'
        }
      }]
    });
    
  } catch (error) {
    console.error('LLM Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper functions
function generateMockImage(prompt) {
  const svg = `
    <svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4a6fff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8a2fff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="256" cy="192" r="80" fill="rgba(255,255,255,0.1)"/>
      <text x="256" y="192" font-family="Arial" font-size="16" fill="white" text-anchor="middle">
        ${prompt?.substring(0, 40) || 'AI Dream Weaver'}
      </text>
      <text x="256" y="350" font-family="Arial" font-size="12" fill="white" text-anchor="middle" opacity="0.7">
        Local Development Server
      </text>
    </svg>
  `;
  
  return Buffer.from(svg).toString('base64');
}

function generateStoryResponse(prompt) {
  const responses = [
    `Вы находитесь в мире снов. ${prompt} открывает перед вами новые возможности. Что вы сделаете дальше?\n\n1. Исследовать окружающий мир\n2. Искать подсказки и артефакты\n3. Проверить инвентарь\n4. Отдохнуть и восстановить силы`,
    
    `В ответ на "${prompt}", мир снов отвечает загадочным эхом. Впереди виднеется древний лес. Ваши действия?\n\n1. Войти в лес\n2. Обойти лес по краю\n3. Искать другой путь\n4. Вернуться назад`,
    
    `"${prompt}" - это был смелый шаг! Вы чувствуете магическую энергию вокруг. Варианты действий:\n\n1. Сосредоточиться и почувствовать энергию\n2. Продолжить путь\n3. Записать наблюдения в дневник\n4. Создать магический барьер`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Local development server running at http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/sd-proxy`);
  console.log(`   POST http://localhost:${PORT}/api/llm-proxy`);
  console.log(`🎮 Open http://localhost:${PORT} in your browser`);
});
