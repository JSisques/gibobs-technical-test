import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
    private readonly logger = new Logger(EncryptionService.name);
    private readonly saltRounds = 12;

    /**
     * Hash a password using bcrypt
     * @param password - The plain text password to hash
     * @returns Promise<string> - The hashed password
     */
    async hashPassword(password: string): Promise<string> {
        this.logger.log('Hashing password');
        return await bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Compare a plain text password with a hashed password
     * @param password - The plain text password to check
     * @param hashedPassword - The hashed password to compare against
     * @returns Promise<boolean> - True if passwords match, false otherwise
     */
    async comparePassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        this.logger.log('Comparing password with hash');
        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * Generate a random salt
     * @returns Promise<string> - The generated salt
     */
    async generateSalt(): Promise<string> {
        this.logger.log('Generating salt');
        return await bcrypt.genSalt(this.saltRounds);
    }

    /**
     * Check if a string is already hashed
     * @param password - The string to check
     * @returns boolean - True if the string appears to be hashed
     */
    isHashed(password: string): boolean {
        // bcrypt hashes start with $2b$ or $2a$ and are 60 characters long
        return password.startsWith('$2b$') || password.startsWith('$2a$');
    }
}
