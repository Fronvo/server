// ******************** //
// Utilities for variable conditions.
// ******************** //

import { EnvValues } from 'other/types';

// Generic utility functions
export function getEnv(value: EnvValues, fallback?: any): any | null {
    return process.env[`FRONVO_${value}`] || fallback;
}

export function getEnvBoolean(value: EnvValues, fallback: boolean): boolean {
    const targetEnvValue = getEnv(value);

    return targetEnvValue == null
        ? fallback
        : targetEnvValue.toLowerCase() == 'true';
}

export function assertEnv(value: EnvValues): boolean {
    return getEnv(value) != null;
}

export function assertEnvValue(value: EnvValues, targetValue: any): boolean {
    return getEnv(value) === targetValue;
}
