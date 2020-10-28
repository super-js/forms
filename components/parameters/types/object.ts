import {IParameterType} from "../index";
import {defaultValidator}      from '../validator';

const object: IParameterType = {
    validate        : defaultValidator(),
    getEmptyValue   : () => ({})
};

export default () => object;