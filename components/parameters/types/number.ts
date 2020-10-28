import {IParameterType} from "../index";
import {defaultValidator}      from '../validator';

const number: IParameterType = {
    validate        : defaultValidator(),
    getEmptyValue   : () => null
};

export default () => number;