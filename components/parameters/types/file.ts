import {IParameterType}                                     from "../index";
import {defaultValidator, okStatus, errorStatus, ValidationStatus}              from '../validator';

const MAX_FILE_SIZE = 100 * 1048576; //50 MB

const password: IParameterType = {
    validate: defaultValidator(async (validationInfo) => {
        const {value, isRequired, skipValidation} = validationInfo;

        if(skipValidation) return okStatus();

        if(!(value instanceof File) && (isRequired || value)) return errorStatus(["Invalid file."]);

        if(value && value.size >= MAX_FILE_SIZE) return errorStatus(["File is too big. Must be less than 100MB."]);

        return okStatus();
    }),
    getEmptyValue : () => ""
};

export default () => password;