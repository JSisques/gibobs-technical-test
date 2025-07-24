import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthorizationGuard } from './guards/authorization.guard';
import { AuthService } from './services/auth.service';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard, AuthorizationGuard],
    exports: [AuthGuard, AuthorizationGuard],
})
export class AuthModule {}
