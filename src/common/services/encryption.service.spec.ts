import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
    let service: EncryptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EncryptionService],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hashPassword', () => {
        it('should hash a password correctly', async () => {
            const password = 'testPassword123';
            const hashedPassword = await service.hashPassword(password);

            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword).toMatch(/^\$2[ab]\$\d+\$/);
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'testPassword123';
            const hash1 = await service.hashPassword(password);
            const hash2 = await service.hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });

        it('should handle empty password', async () => {
            const hashedPassword = await service.hashPassword('');
            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe('');
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching password and hash', async () => {
            const password = 'testPassword123';
            const hashedPassword = await service.hashPassword(password);
            const result = await service.comparePassword(
                password,
                hashedPassword,
            );

            expect(result).toBe(true);
        });

        it('should return false for non-matching password and hash', async () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword123';
            const hashedPassword = await service.hashPassword(password);
            const result = await service.comparePassword(
                wrongPassword,
                hashedPassword,
            );

            expect(result).toBe(false);
        });

        it('should return false for empty password', async () => {
            const password = 'testPassword123';
            const hashedPassword = await service.hashPassword(password);
            const result = await service.comparePassword('', hashedPassword);

            expect(result).toBe(false);
        });
    });

    describe('generateSalt', () => {
        it('should generate a valid salt', async () => {
            const salt = await service.generateSalt();

            expect(salt).toBeDefined();
            expect(salt).toMatch(/^\$2[ab]\$\d+\$/);
        });

        it('should generate different salts each time', async () => {
            const salt1 = await service.generateSalt();
            const salt2 = await service.generateSalt();

            expect(salt1).not.toBe(salt2);
        });
    });

    describe('isHashed', () => {
        it('should return true for bcrypt hashes', () => {
            const bcryptHash =
                '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.';
            const result = service.isHashed(bcryptHash);

            expect(result).toBe(true);
        });

        it('should return true for bcrypt hashes with $2a$', () => {
            const bcryptHash =
                '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.';
            const result = service.isHashed(bcryptHash);

            expect(result).toBe(true);
        });

        it('should return false for plain text passwords', () => {
            const plainPassword = 'testPassword123';
            const result = service.isHashed(plainPassword);

            expect(result).toBe(false);
        });

        it('should return false for empty string', () => {
            const result = service.isHashed('');

            expect(result).toBe(false);
        });

        it('should return true for strings that start with $2b$ even if short', () => {
            const shortString = '$2b$12$short';
            const result = service.isHashed(shortString);

            expect(result).toBe(true);
        });
    });
});
