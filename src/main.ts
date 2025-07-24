import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Main');

    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.setGlobalPrefix('api/v1');
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('Tasks Management API')
        .setDescription('Tasks Management API')
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addTag('Users', 'User management endpoints')
        .addTag('Tasks', 'Task management endpoints')
        .addTag('Auth', 'Authentication endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Tasks API Documentation',
    });

    await app.listen(process.env.PORT);

    logger.log(`Server is running on port ${process.env.PORT}`);
    logger.log(
        `Swagger documentation available at http://localhost:${process.env.PORT}/docs`,
    );
}
bootstrap();
