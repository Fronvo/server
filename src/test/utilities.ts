// ******************** //
// Reusable functions for the test files.
// ******************** //

import { FronvoError } from 'interfaces/all';
import { TestArguments, TestErrorCallback } from 'interfaces/test';
import { Errors, TestAssertTypes } from 'other/types';
import testErrors from 'test/testErrors';
import { format } from 'util';
import { v4 } from 'uuid';
import { getErrorCode, getErrorKey } from 'utilities/global';

export function generateEmail(): string {
    return v4().replace(/-/g, '') + '@gmail.com';
}

export function generatePassword(): string {
    return v4().substring(0, 30);
}

export function assertErrors(funcs: {[key: string]: (partialTestArgs: Partial<TestArguments>, callback: TestErrorCallback) => void}, testArgs: TestArguments, finalFunction: (testArgs: TestArguments, callback: TestErrorCallback) => void): void {
    const partialTestArgs = {...testArgs};
    delete partialTestArgs.done;

    function checkFinalFunction(): void {
        finalFunction(testArgs, (err?) => {
            // Only check for the error, final functions may use this function to prevent further checks.
            if(err) {
                testArgs.done(err);
                console.log(`\t[final] ${err}`);
                process.exit();
            }
        });
    }

    function checkErrorCallback(funcName: string): void {
        const func = funcs[funcName];

        func(partialTestArgs, (err?) => {
            if(err) {
                testArgs.done(err);
                console.log(`\t[${funcName}] ${err}`);
                process.exit();
            } else if((Object.keys(funcs).indexOf(funcName) + 1) == Object.keys(funcs).length) {
                checkFinalFunction();
            }
        });
    }

    if(Object.keys(funcs).length > 0) {
        for(const funcName in funcs) {
            // Run the error function with the partialTestArgs, without the done parameter
            // If it passes with no errors and it's the last one, run final callback
            checkErrorCallback(funcName);
        }
    } else {
        checkFinalFunction();
    }
}

// Helper functions
export function assertError(error: FronvoError): undefined | string {
    if(error.err) {
        return format(testErrors.ERR, {...error});
    }
}

export function assertCode(errorCode: number, targetCode: Errors): undefined | string {
    if(!(errorCode == getErrorCode(targetCode))) {
        return format(testErrors.CODE, getErrorCode(targetCode), targetCode, errorCode, getErrorKey(errorCode));
    }
}

export function assertType(property: {[key: string]: any}, type: TestAssertTypes): undefined | string {
    const targetPropertyName = Object.keys(property)[0];
    const targetProperty = property[targetPropertyName];
    
    if(!(typeof targetProperty == type)) {
        return format(testErrors.TYPE, targetPropertyName, type, typeof targetProperty);
    }
}

export function assertEquals(errorValue: {[key: string]: any}, targetValue: any): undefined | string {
    const targetErrorName = Object.keys(errorValue)[0];
    const targetError = errorValue[targetErrorName];

    if(!(targetError == targetValue)) {
        return format(testErrors.EQUALS, targetErrorName, String(targetValue), String(targetError));
    }
}
export function assertNotEqual(errorValue: {[key: string]: any}, targetValue: any): undefined | string {
    const targetErrorName = Object.keys(errorValue)[0];
    const targetError = errorValue[targetErrorName];

    if(targetError == targetValue) {
        return format(testErrors.NOT_EQUAL, targetErrorName, String(targetValue));
    }
}

export function assertLength(errorValue: {[key: string]: string}, targetLength: number): undefined | string {
    const targetErrorName = Object.keys(errorValue)[0];
    const targetError = errorValue[targetErrorName];

    if(!(targetError.length == targetLength)) {
        return format(testErrors.LENGTH, targetErrorName, targetLength);
    }
}