import * as React from "react";
import {IInputBasicProps, Input, InputProps, InputState} from "../inputs";

import ParameterCss       from "./ParameterCss.css";
import {ParametersContext} from "./index";
import {ValidationResult} from "../../parameters/validator";

export type OnParameterValidationChange = (parameterCode: string, validationResult: ValidationResult) => void;

export interface IParameter extends IInputBasicProps {
    code                : string
}

export interface IParameters {
    [code: string]: IParameter
}

export interface ParameterProps extends IParameter {
    onValidationChange? : OnParameterValidationChange
}

export function Parameter(props: ParameterProps) {
    const {code, onValidationChange, inputType, ...inputProps} = props;

    const {
        onParameterValidationChange, onParameterValueInput, parameters
    } = React.useContext(ParametersContext);

    const InputComponent    = inputType && Input[inputType.toUpperCase()] ?
        Input[inputType.toUpperCase()] : Input.TEXT;

    const _onValidationChange = validationResult => {
        onParameterValidationChange(code, validationResult);

        if(typeof onValidationChange === "function") {
            onValidationChange(props.code, validationResult);
        }
    };

    return (
        <InputComponent
            onInput={value => onParameterValueInput(code, value)}
            onValidationChange={_onValidationChange}
            parameters={parameters}
            {...inputProps}
        />
    )

}