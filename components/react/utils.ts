import {IInputValidValue} from "./inputs";

export interface IKeyValue {
    [key: string]: any;
}

export function keyValuesToValidValues(keyValues: IKeyValue[]): IInputValidValue[] {
    return keyValues
        .filter(keyValue => Object.keys(keyValue).length > 0)
        .map(keyValue => ({
            value: Object.keys(keyValue)[0],
            label: keyValue[Object.keys(keyValue)[0]]
        }))
}

export function arrayOfStringsToValidValues(validValues: string[]): IInputValidValue[] {
    return validValues
        .filter(validValue => typeof validValue === "string")
        .map(validValue => ({
            value: validValue,
            label: validValue
        }))
}