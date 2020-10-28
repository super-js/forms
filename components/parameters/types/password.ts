import * as passwordTester           from "owasp-password-strength-test";

import {IParameterType}                                     from "../index";
import {defaultValidator, okStatus, ValidationStatus}              from '../validator';

passwordTester.config({
    minLength        : 8
});

const password: IParameterType = {
    validate: defaultValidator(async (validationInfo) => {
        const testResult = passwordTester.test(validationInfo.value);

        return testResult.strong || validationInfo.skipValidation ? okStatus() : {
            validateStatus  : ValidationStatus.error,
            help            : testResult.errors
        }
    }),
    getEmptyValue : () => ""
};

export default () => password;