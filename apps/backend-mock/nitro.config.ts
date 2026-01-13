import errorHandler from './error';

process.env.COMPATIBILITY_DATE = new Date().toISOString();
export default defineNitroConfig({
  // 指定 preset，用于生成服务器端代码
  // node-server: 标准的 Node.js 服务器部署
  preset: 'node-server',
  devErrorHandler: errorHandler,
  errorHandler: '~/error',
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': '*',
      },
    },
  },
});
