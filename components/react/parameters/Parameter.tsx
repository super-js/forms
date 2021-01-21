import * as React from "react";
import {IInputBasicProps, Input, InputProps, InputState} from "../inputs";

import ParameterCss       from "./ParameterCss.css";
import {OnParametersChangeEventCode, ParametersContext} from "./index";
import {ValidationResult} from "../../parameters/validator";

export interface IOnParameterChangeData {
    eventCode: OnParametersChangeEventCode;
    parameter: IParameter;
    parameters: IParameters;
    data: any;
}

export type OnParameterValidationChange = (parameterCode: string, validationResult: ValidationResult) => void;
export type OnParameterChange = (onParameterChangeData: IOnParameterChangeData) => void;

export interface IParameter extends IInputBasicProps {
    code                : string;
    onChange?           : OnParameterChange;
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
        onParameterValidationChange, onParameterValueInput, parameters, readOnly
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
            onInput={(value, onInputData) => onParameterValueInput(code, value, onInputData)}
            onValidationChange={_onValidationChange}
            parameters={parameters}
            readOnly={inputProps.readOnly || readOnly}
            {...inputProps}
        />
    )

}