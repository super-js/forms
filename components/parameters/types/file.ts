import {IParameterType}                                     from "../index";
import {defaultValidator, okStatus, errorStatus, ValidationStatus}              from '../validator';

const MAX_FILE_SIZE = 12 * 1048576; //12 MB

const password: IParameterType = {
    validate: defaultValidator(async (validationInfo) => {
        const {value, isRequired, skipValidation} = validationInfo;

        if(skipValidation) return okStatus();

        if(!(value instanceof File) && (isRequired || value)) return errorStatus(["Invalid file."]);

        if(value && value.size >= MAX_FILE_SIZE) return errorStatus(["File is too big. Must be less than 12mb."]);

        return okStatus();
    }),
    getEmptyValue : () => ""
};

export default () => password;