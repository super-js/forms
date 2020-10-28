import {defaultValidator, okStatus, errorStatus, ValidationStatus} from '../validator';

export default ({
    nonEmpty = false
} = {}) => {
    return {
        validate        : defaultValidator(async (validationInfo) => {

            if(validationInfo.skipValidation)        return okStatus();
            if(!Array.isArray(validationInfo.value)) return errorStatus(['Invalid value']);
            if(nonEmpty
                && validationInfo.value.some(v => v == "" || v == undefined || v == null)) {
                return errorStatus(["This field is required"])
            }

            return okStatus();
        }),
        getEmptyValue   : () => ([])
    };
};