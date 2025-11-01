import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerConfig(app: INestApplication | any) {
  // if (process.env.NODE_ENV === 'production') return;

  const config = new DocumentBuilder()
    .setTitle('IOT')
    .setDescription('The IOT API description')
    .setVersion('1.0')
    .addTag('iot')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token',
    })
    // .addSecurityRequirements('bearer')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
}
