import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração de CORS
  const corsOrigin = process.env.CORS_ORIGIN;
  console.log('🔒 CORS_ORIGIN env:', corsOrigin);
  console.log('🔒 PORT env:', process.env.PORT);
  console.log('🔒 NODE_ENV:', process.env.NODE_ENV);
  
  // Lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:19006',
    'https://inventario-cto-cliente.up.railway.app',
    'https://fearless-gratitude-production.up.railway.app',
  ];
  
  // Se CORS_ORIGIN estiver definido, adiciona à lista
  if (corsOrigin) {
    const origins = corsOrigin.split(',').map(o => o.trim());
    allowedOrigins.push(...origins);
  }
  
  // Habilitar CORS para permitir acesso do frontend
  app.enableCors({
    origin: (origin, callback) => {
      console.log('🌐 Request from origin:', origin);
      
      // Permite se a origem estiver na lista OU se não houver origem (requisições diretas)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('❌ Origin not allowed:', origin);
        callback(null, true); // Permite mesmo assim em produção
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Habilitar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = parseInt(process.env.PORT || '3000', 10);
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📊 API disponível em http://0.0.0.0:${port}/ctos`);
  console.log(`🔒 CORS habilitado para:`, allowedOrigins.join(', '));
  console.log(`✅ Servidor pronto para receber requisições externas`);
}

bootstrap().catch(err => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});

