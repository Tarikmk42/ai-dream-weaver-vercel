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
    const { messages, model = 'local-model' } = req.body || {};
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        usage: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            model: 'local-model',
            messages: [{ role: 'user', content: 'Hello' }],
            temperature: 0.7,
            max_tokens: 500
          }
        }
      });
    }
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    console.log('LLM Proxy: Processing request for:', lastMessage.substring(0, 100));
    
    // Генерируем интеллектуальный ответ на основе промпта
    const response = generateStoryResponse(lastMessage);
    
    return res.status(200).json({
      choices: [{
        message: {
          content: response,
          role: 'assistant'
        }
      }],
      usage: {
        prompt_tokens: lastMessage.length,
        completion_tokens: response.length,
        total_tokens: lastMessage.length + response.length
      },
      model: model,
      note: "This is a mock response. Configure your LLM API in environment variables."
    });
    
  } catch (error) {
    console.error('LLM Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Функция для генерации story response
function generateStoryResponse(prompt) {
  const prompts = [
    "Вы в мире снов, полном тайн и магии. ",
    "Вокруг вас плывут образы из забытых снов. ",
    "Воздух наполнен магической энергией. ",
    "Вы чувствуете древнюю силу этого места. ",
    "Перед вами открывается вид на фантастический пейзаж. "
  ];
  
  const actions = [
    "Что вы хотите сделать?",
    "Как вы поступите?",
    "Каковы ваши дальнейшие действия?",
    "Что будете исследовать?"
  ];
  
  const options = [
    "1. Исследовать таинственный лес",
    "2. Подняться на древнюю башню",
    "3. Искать подсказки на земле",
    "4. Прислушаться к голосам ветра",
    "5. Проверить свой инвентарь",
    "6. Искать магические артефакты"
  ];
  
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  
  // Выбираем 3 случайные опции
  const selectedOptions = [];
  const availableOptions = [...options];
  for (let i = 0; i < 3; i++) {
    if (availableOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      selectedOptions.push(availableOptions[randomIndex]);
      availableOptions.splice(randomIndex, 1);
    }
  }
  
  return `${randomPrompt}Вы сказали: "${prompt.substring(0, 50)}". ${randomAction}\n\n${selectedOptions.join('\n')}`;
}
