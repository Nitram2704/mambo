// Authentication validation utilities

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export interface PasswordValidationResult {
    valid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
    score: number; // 0-100
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
        return { valid: false, error: 'El email es requerido' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'El formato del email no es válido' };
    }

    return { valid: true };
};

/**
 * Validates password and calculates strength
 */
export const validatePassword = (password: string): PasswordValidationResult => {
    const errors: string[] = [];
    let score = 0;

    if (!password || password.trim() === '') {
        return {
            valid: false,
            strength: 'weak',
            errors: ['La contraseña es requerida'],
            score: 0
        };
    }

    // Length check
    if (password.length < 8) {
        errors.push('Debe tener al menos 8 caracteres');
    } else {
        score += 25;
        if (password.length >= 12) score += 10;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        errors.push('Debe contener al menos una mayúscula');
    } else {
        score += 25;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
        errors.push('Debe contener al menos una minúscula');
    } else {
        score += 15;
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push('Debe contener al menos un número');
    } else {
        score += 25;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Debe contener al menos un carácter especial');
    } else {
        score += 10;
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong';
    if (score < 40) {
        strength = 'weak';
    } else if (score < 75) {
        strength = 'medium';
    } else {
        strength = 'strong';
    }

    return {
        valid: errors.length === 0,
        strength,
        errors,
        score: Math.min(score, 100)
    };
};

/**
 * Validates name
 */
export const validateName = (name: string): ValidationResult => {
    if (!name || name.trim() === '') {
        return { valid: false, error: 'El nombre es requerido' };
    }

    if (name.trim().length < 2) {
        return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (name.trim().length > 50) {
        return { valid: false, error: 'El nombre es demasiado largo' };
    }

    return { valid: true };
};

/**
 * Checks if two passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword && password.length > 0;
};

/**
 * Validates password confirmation
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword || confirmPassword.trim() === '') {
        return { valid: false, error: 'Debes confirmar tu contraseña' };
    }

    if (!passwordsMatch(password, confirmPassword)) {
        return { valid: false, error: 'Las contraseñas no coinciden' };
    }

    return { valid: true };
};
