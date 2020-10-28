import * as React from "react";
import {Typography} from "antd";
import {Icon} from "@super-js/components/src/icon";

import {IParameterType, parameterTypes, IParameterHandler, validator} from "../../parameters";
import InputCss from "./Input.css";

import {Text}             from './types/Text';
import Number           from './types/Number';
import InputRadio       from './types/Radio';
import InputSelect      from './types/Select';
import InputRate        from './types/Rate';
import DateTime         from './types/DateTime';
import File             from './types/file';

import {ValidationResult, ValidationStatus} from "../../parameters/validator";

export type InputType = keyof typeof InputTypes;

export interface IInputValidValue {
    label?      : string;
    value       : any | any[];
}

export type InputValidValues            = IInputValidValue[];
export type GetInputValidValues         = (searchText: string) => Promise<InputValidValues>;

export interface IInputBasicProps extends Omit<IParameterHandler, 'code' | 'parameterType'> {
    label? : string;
    inputType : InputType;
    readOnly? : boolean;
    validValues? : InputValidValues;
    validationResult? : ValidationResult;
    inputOptions?: any;
}

export interface InputComponentProps {
    onInput         : (value: any) => void;
    onChange        : (ev?: React.SyntheticEvent) => void;
    hasError        : boolean;
    value?          : any;
    readOnly?       : boolean;
    validValues?    : InputValidValues | GetInputValidValues;
}

export interface InputProps extends IInputBasicProps {
    onInput                         : (value: any) => void;
    onValidationChange?             : (validationResult: ValidationResult) => void;
    parameters?                     : validator.IOtherParameters;
    Component?: React.ComponentClass<any, any> | React.FunctionComponent<any>;
    parameterType?: IParameterType;
}

export interface InputState {
    value			    : any;
    validationResult    : ValidationResult
}

export const InputTypes = {
    text: parameterTypes.text,
    textArea: parameterTypes.text,
    phone: parameterTypes.text,
    email: parameterTypes.email,
    password: parameterTypes.password,
}

export class Input extends React.Component<InputProps, InputState> {

    static TEXT = (props: InputProps) => <Input Component={Text} parameterType={InputTypes.text()} {...props} />;
    static EMAIL = (props: InputProps) => <Input Component={Text.Email} parameterType={InputTypes.email()} {...props} />;
    static PASSWORD = (props: InputProps) => <Input Component={Text.Password} parameterType={InputTypes.password()} {...props} />;
    static TEXTAREA = (props: InputProps) => <Input Component={Text.TextArea} parameterType={InputTypes.textArea()} {...props} />;
    static PHONE = (props: InputProps) => <Input Component={Text.Phone} parameterType={InputTypes.phone()} {...props} />;

    state = {
        value               : this.props.value ? this.props.value : "",
        validationResult    : this.props.validationResult ? this.props.validationResult : {
            validateStatus  : ValidationStatus.ok,
            help            : []
        }
    };

    validationTimeout = null;

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.value !== nextState.value
            || (nextProps.value != undefined && nextProps.value !== this.state.value && nextProps.value !== this.props.value)
            || this.state.validationResult !== nextState.validationResult
            || (
                !!nextProps.validationResult
                && nextProps.validationResult.validateStatus !== this.state.validationResult.validateStatus
                && nextState.validationResult.validateStatus === this.state.validationResult.validateStatus
            )
    }

    componentWillUnmount() {
        clearTimeout(this.validationTimeout);
    }

    componentDidUpdate(prevProps, prevState) {

        let newState = {};

        if(this.props.validationResult
            && this.props.validationResult.validateStatus !== this.state.validationResult.validateStatus
            && this.state.validationResult.validateStatus === prevState.validationResult.validateStatus) {
            newState["validationResult"] = this.props.validationResult;
        }



        if(this.props.value != undefined && this.props.value !== this.state.value && this.props.value !== prevProps.value) {
            newState["value"] = this.props.value;
        }

        if(Object.keys(newState).length > 0) this.setState(newState);
    }

    onInput     = (value: any) => {
        this.setState({
            value
        }, () => {
            this.props.onInput(value);
            this._validate()
        });
    };

    onChange   = () => {};

    _validate = () => {

        const {parameterType} = this.props;

        clearTimeout(this.validationTimeout);

        if(parameterType) {
            this.validationTimeout = setTimeout(async () => {
                const validationResult = await parameterType.validate({
                    isRequired      : this.props.isRequired,
                    skipValidation  : this.props.skipValidation,
                    value           : this.state.value,
                    customValidator : this.props.customValidator
                }, this.props.parameters ? this.props.parameters : {});

                if(validationResult.validateStatus !== this.state.validationResult.validateStatus
                    && typeof this.props.onValidationChange === "function") {
                    this.props.onValidationChange(validationResult);
                }

                this.setState({
                    validationResult
                });

            }, 500);
        }


    };

    render() {

        const {Component, inputOptions, label} = this.props;
        const {validationResult, value} = this.state;

        const hasError = validationResult.validateStatus === ValidationStatus.error;

        return (
            <div className={InputCss.input}>
                {label ?
                    <Typography.Text type={hasError ? "danger" : "secondary"} className={InputCss.label}>{label}</Typography.Text> : null
                }
                <Component
                    onInput={this.onInput}
                    onChange={this.onChange}
                    hasError={hasError}
                    {...inputOptions}
                    value={value}
                />
                {hasError ? (
                    <ul className={InputCss.helpList}>
                        {validationResult.help.map(helpText => (
                            <li key={helpText}>
                                <Typography.Text type="danger">
                                    <Icon iconName="times-circle" danger/>
                                    <i>{helpText}</i>
                                </Typography.Text>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        )
    }

}

// const InputTypes: IInputTypes = {
//     text                        : InputHOC(parameterTypes.text()        , Text),
//     email                       : InputHOC(parameterTypes.email()       , Text.Email),
//     password                    : InputHOC(parameterTypes.password()    , Text.Password),
//     number                      : InputHOC(parameterTypes.number()      , Number),
//     money                       : InputHOC(parameterTypes.number()      , Number.Money),
//     percentage                  : InputHOC(parameterTypes.number()      , Number.Percentage),
//     textArea                    : InputHOC(parameterTypes.text()        , Text.TextArea),
//     radio                       : InputHOC(parameterTypes.text()        , InputRadio),
//     singleSelect                : InputHOC(parameterTypes.text()        , InputSelect),
//     multipleSelect              : InputHOC(parameterTypes.array()       , InputSelect.Multiple),
//     rate                        : InputHOC(parameterTypes.number()      , InputRate),
//     datePicker                  : InputHOC(parameterTypes.text()        , DateTime.DatePicker),
//     dateTimePicker              : InputHOC(parameterTypes.text()        , DateTime.DateTimePicker),
//     dateRangePicker             : InputHOC(parameterTypes.array({nonEmpty: true})       , DateTime.DateRangePicker),
//     dateTimeRangePicker         : InputHOC(parameterTypes.array({nonEmpty: true})       , DateTime.DateTimeRangePicker),
//     file                        : InputHOC(parameterTypes.file()        , File),
//     phone                       : InputHOC(parameterTypes.text()        , Text.Phone),
// };
//
// export default InputTypes;