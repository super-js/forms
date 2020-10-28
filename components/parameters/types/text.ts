import {IParameterType} from "../index";
import {defaultValidator}      from '../validator';

const text: IParameterType = {
    validate: defaultValidator(),
    getEmptyValue : () => ""
};

export default () => text;