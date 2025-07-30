import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

const startTime = Date.now();

export default function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  try {
    const now = Date.now();
    const uptime = Math.floor((now - startTime) / 1000); // seconds

    // メモリ使用量を計算（Node.js環境でのみ利用可能）
    let memoryInfo;
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      memoryInfo = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      };
    }

    const healthData: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime,
      ...(memoryInfo && { memory: memoryInfo })
    };

    // CORSヘッダーを設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONSプリフライトリクエストへの対応
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // GETリクエストのみ受け付け
    if (req.method !== 'GET') {
      res.status(405).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: 0
      });
      return;
    }

    console.log('✅ Health check successful:', healthData);
    res.status(200).json(healthData);

  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: 0
    };

    res.status(500).json(errorResponse);
  }
}