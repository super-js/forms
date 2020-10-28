import text                 from './types/text';
import number               from './types/number';
import password             from './types/password';
import email                from './types/email';
import array                from './types/array';
import object               from './types/object';
import file                 from './types/file';

import * as validator       from "./validator";

// export type ParameterType {
//     text        = "text",
//     password    = "password",
//     email       = "email",
//     number      = "number",
//     array       = "array",
//     object      = "object",
//     file        = "file"
// }

export type ParameterType = "text" | "password" | "email" | "number" | "array" | "object" | "file";

export interface IParameterHandler {
    code                : string,
    value?		        : any;
    parameterType       : ParameterType
    isRequired?         : boolean;
    skipValidation?     : boolean;
    customValidator?    : validator.ValidationFunction;
}

export interface IParameterType {
    validate            : validator.ValidationFunction;
    getEmptyValue       : () => any;
}

export type ParameterTypeLoader     = (options?: Object) => IParameterType;
export type ParameterTypes          = {[name in ParameterType]: ParameterTypeLoader}

export const parameterTypes: ParameterTypes = {
    text, number, password, email, array, object, file
};

export {
    validator
}

