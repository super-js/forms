import isEmail from "validator/lib/isEmail";

import {IParameterType} from "../index";
import {defaultValidator, okStatus, ValidationStatus} from '../validator';

const email: IParameterType = {
    validate: defaultValidator(async validationInfo => {
        return validationInfo.skipValidation || isEmail(validationInfo.value) ? okStatus() : {
            validateStatus	: ValidationStatus.error,
            help			: ["Not a valid email address"]
        }
    }),
    getEmptyValue : () => ""
};

export default () => email;