import {IParameterHandler, IParameterType} from "./index";

export enum ValidationStatus {
    success = "success",
    error   = "error",
    ok      = ""
}

export interface ValidationResult {
    validateStatus  : ValidationStatus | "success" | "error" | "",
    help            : string[]
}

export interface ValidationInfo {
    skipValidation?     : boolean;
    isRequired?         : boolean;
    value?              : any;
    customValidator?    : ValidationFunction;
}

export interface IValidatedParameters {
    [parameterCode: string] : ValidationResult
}

export interface IOtherParameters {
    [code: string] : ValidationInfo
}
export type ValidationFunction = (validationInfo: ValidationInfo, otherParameters: IOtherParameters) => Promise<ValidationResult>;

export interface IBulkValidationParameter extends ValidationInfo {
    code            : string;
    parameterType   : IParameterType;
}

export type BulkValidationResult = {
    hasErrors               : boolean;
    validatedParameters     : IValidatedParameters;
}

const okStatus          = (): ValidationResult => ({
    validateStatus 	: ValidationStatus.ok,
    help			: []
});

const errorStatus       = (errors: string[]) => ({
    validateStatus  : ValidationStatus.error,
    help            : errors
});

const commonValidators = {
    isRequiredCheck     : (parameter: IParameterHandler): ValidationResult => {

        return !parameter.isRequired
        || (
            parameter.isRequired
            && parameter.value !== ""
            && parameter.value !== null
            && parameter.value !== undefined
            && (!Array.isArray(parameter.value) || parameter.value.length > 0)
        ) ? okStatus() : {
            validateStatus  : ValidationStatus.error,
            help            : ["This field is required"]
        };

    }
};

const defaultValidator = (validationCallback?: ValidationFunction): ValidationFunction => {
    return async (parameter: IParameterHandler, otherParameters): Promise<ValidationResult> => {

        let validationResult = okStatus();

        const isRequiredCheck = commonValidators.isRequiredCheck(parameter);
        if (isRequiredCheck.validateStatus !== ValidationStatus.ok) return isRequiredCheck;

        if(typeof validationCallback === "function") {
            validationResult = await validationCallback(parameter, otherParameters);
        }

        if(typeof parameter.customValidator === "function"
        && validationResult.validateStatus !== ValidationStatus.error) {

            const validationResult = await parameter.customValidator(parameter, otherParameters);
            if(validationResult && validationResult.validateStatus === ValidationStatus.error) return validationResult;

        }

        return validationResult;
    };
};



const bulkValidate      = async (parameters: IBulkValidationParameter[]): Promise<BulkValidationResult> => {

    let hasErrors       = false, validatedParameters = {};

    const validationInfos = parameters.reduce((_, parameter) => {
        const {code, parameterType, ...validationInfo} = parameter;
        _[code] = validationInfo;
        return _;
    }, {});

    await Promise.all(parameters.map(async parameter => {
        const {code, parameterType, ...validationInfo} = parameter;

        const validationResult = await parameter.parameterType.validate(validationInfo, validationInfos);

        if(!hasErrors) hasErrors = validationResult.validateStatus === ValidationStatus.error;

        validatedParameters[code] = validationResult;

    }));

    return {
        hasErrors, validatedParameters
    }
};

export {
    defaultValidator, okStatus, errorStatus, commonValidators, bulkValidate
}