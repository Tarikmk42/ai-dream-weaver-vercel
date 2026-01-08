export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      sd_proxy: 'running',
      llm_proxy: 'running',
      web: 'running'
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  return res.status(200).json(healthStatus);
}