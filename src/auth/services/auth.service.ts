import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from '../../common/services/encryption.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private encryptionService: EncryptionService,
    ) {}

    async signIn(email: string, pass: string): Promise<any> {
        this.logger.log(`Signing in user with email ${email}`);

        const user = await this.usersService.findByEmail(email);

        if (!user) {
            this.logger.log(`User with email ${email} not found`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.encryptionService.comparePassword(
            pass,
            user.pass,
        );
        if (!isPasswordValid) {
            this.logger.log(`Invalid password for user with email ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { id: user.id, email: user.email };

        return {
            accessToken: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                tasks: [],
            },
        };
    }

    async signUp(email: string, pass: string, fullname?: string): Promise<any> {
        this.logger.log(`Signing up user with email ${email}`);

        const user = await this.usersService.create({
            email,
            password: pass,
            fullname: fullname || '',
        });

        const payload = { id: user.id, email: user.email };

        return {
            accessToken: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                tasks: [],
            },
        };
    }
}
