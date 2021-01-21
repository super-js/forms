import * as React from "react";
import {Typography} from "antd";
import {Icon} from "@super-js/components/lib/icon";

import {IParameterType, parameterTypes, IParameterHandler, validator} from "../../parameters";
import InputCss from "./Input.css";

import {Text}             from './types/Text';
import {InputList}               from './types/List';
import Number           from './types/Number';
import InputRadio       from './types/Radio';
import InputSelect      from './types/Select';
import InputRate        from './types/Rate';
import {InputCheckbox}        from './types/Checkbox';
import DateTime         from './types/DateTime';
import {InputFile}             from './types/InputFile';

import {ValidationResult, ValidationStatus} from "../../parameters/validator";
import {InputHeading} from "./InputHeading";

export type InputType = keyof typeof InputTypes;

export interface IInputValidValue {
    label?      : string;
    name? : string;
    value       : any | any[];
    id?: string;
    disabled?   : boolean;
    checkable?  : boolean;
    children?   : IInputValidValue[];
    data?: any;
}

export type InputValidValues            = IInputValidValue[] | ((inputData?: any) => Promise<IInputValidValue[]>);

export interface IInputBasicProps extends Omit<IParameterHandler, 'code' | 'parameterType'> {
    label? : string;
    description?: string;
    inputType : InputType;
    readOnly? : boolean;
    validValues? : InputValidValues;
    validationResult? : ValidationResult;
    validValuesChildKey?: string;
    inputOptions?: any;
}

export interface InputComponentProps {
    onInput         : (value: any, onInputData?: any) => void;
    onChange        : (ev?: React.SyntheticEvent) => void;
    hasError?       : boolean;
    value?          : any;
    readOnly?       : boolean;
    validValues?    : InputValidValues;
    validValuesChildKey?: string;
    onError         : (error: Error) => void;
}

export interface InputProps extends IInputBasicProps {
    onInput                         : (value: any, onInputData: any) => void;
    onValidationChange?             : (validationResult: ValidationResult) => void;
    parameters?                     : validator.IOtherParameters;
    Component?: React.ComponentClass<any, any> | React.FunctionComponent<any>;
    parameterType?: IParameterType;
}

export interface InputState {
    value			    : any;
    validationResult    : ValidationResult;
}

export const InputTypes = {
    text: parameterTypes.text,
    textArea: parameterTypes.text,
    phone: parameterTypes.text,
    email: parameterTypes.email,
    password: parameterTypes.password,
    select: parameterTypes.text,
    multiSelect: parameterTypes.array,
    selectTree: parameterTypes.text,
    multiSelectTree: parameterTypes.array,
    list: parameterTypes.array,
    file: parameterTypes.file,
    multiFile: parameterTypes.array,
    datePicker: parameterTypes.text,
    dateTimePicker: parameterTypes.text,
    dateRangePicker: parameterTypes.text,
    dateTimeRangePicker: parameterTypes.text,
    checkbox: parameterTypes.text
}

export class ValidValuesError {};

export class Input extends React.Component<InputProps, InputState> {

    static TEXT = (props: InputProps) => <Input Component={Text} parameterType={InputTypes.text()} {...props} />;
    static EMAIL = (props: InputProps) => <Input Component={Text.Email} parameterType={InputTypes.email()} {...props} />;
    static PASSWORD = (props: InputProps) => <Input Component={Text.Password} parameterType={InputTypes.password()} {...props} />;
    static TEXTAREA = (props: InputProps) => <Input Component={Text.TextArea} parameterType={InputTypes.textArea()} {...props} />;
    static PHONE = (props: InputProps) => <Input Component={Text.Phone} parameterType={InputTypes.phone()} {...props} />;

    static SELECT = (props: InputProps) => <Input Component={InputSelect} parameterType={InputTypes.select()} {...props} />;
    static MULTISELECT = (props: InputProps) => <Input Component={InputSelect.Multiple} parameterType={InputTypes.multiSelect()} {...props} />;
    static SELECTTREE = (props: InputProps) => <Input Component={InputSelect.Tree} parameterType={InputTypes.selectTree()} {...props} />;
    static MULTISELECTTREE = (props: InputProps) => <Input Component={InputSelect.TreeMultiple} parameterType={InputTypes.multiSelectTree()} {...props} />;

    static LIST = (props: InputProps) => <Input Component={InputList} parameterType={InputTypes.list()} {...props} />;
    static FILE = (props: InputProps) => <Input Component={InputFile} parameterType={InputTypes.file()} {...props}/>;
    static MULTIFILE = (props: InputProps) => <Input Component={InputFile.Multiple} parameterType={InputTypes.multiFile()} {...props}/>;

    static DATEPICKER = (props: InputProps) => <Input Component={DateTime.DatePicker} parameterType={InputTypes.text()} {...props}/>;
    static DATETIMEPICKER = (props: InputProps) => <Input Component={DateTime.DateTimePicker} parameterType={InputTypes.text()} {...props}/>;
    static DATERANGEPICKER = (props: InputProps) => <Input Component={DateTime.DateRangePicker} parameterType={InputTypes.text()} {...props}/>;
    static DATETIMERANGEPICKER = (props: InputProps) => <Input Component={DateTime.DateTimeRangePicker} parameterType={InputTypes.text()} {...props}/>;

    static CHECKBOX = (props: InputProps) => <Input Component={InputCheckbox} parameterType={InputTypes.text()} {...props}/>;


    static useValidValues = (validValues: InputValidValues, onError: Function, validValuesChildKey?: string) => {
        const [_validValues, setValidValues] = React.useState(Array.isArray(validValues) ? validValues : []);
        const [_loadingValidValues, setLoadingValidValues] = React.useState(typeof validValues === "function");

        React.useEffect(() => {
            (async () => {

                const _normalizeValidValues = validValues => validValues.map(validValue => ({
                    ...validValue,
                    label: validValue.label || validValue.name || validValue.id || validValue.value,
                    value: validValue.id || validValue.value || validValue.label || validValue.name,
                    children: Array.isArray(validValue[validValuesChildKey || 'children']) && validValue[validValuesChildKey || 'children'].length > 0 ?
                        _normalizeValidValues(validValue[validValuesChildKey || 'children']) : []
                }))

                if(typeof validValues === "function") {
                    try {
                        const loadedValidValues = await validValues();

                        setValidValues(
                            _normalizeValidValues(Array.isArray(loadedValidValues) ? loadedValidValues : [])
                        );
                        setLoadingValidValues(false);
                    } catch(err) {
                        onError(new ValidValuesError());
                    }
                } else {
                    setValidValues(
                        _normalizeValidValues(Array.isArray(validValues) ? validValues : [])
                    );
                }
            })();
        }, [validValues]);

        return {
            validValues: _validValues,
            loadingValidValues: _loadingValidValues
        }
    }

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
            || nextProps.readOnly !== this.props.readOnly
            || nextProps.validValues !== this.props.validValues
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

    onInput     = (value: any, onInputData: any = {}) => {
        this.setState({
            value
        }, () => {
            this.props.onInput(value, onInputData);
            this._validate()
        });
    };

    onError = (error) => {

        let help = [];

        if(error instanceof ValidValuesError) {
            help.push(`Unable to load ${this.props.label} values`);
        } else {
            console.error(error);
            help.push(error.message);
        }

        this.setState({
            validationResult: {
                validateStatus  : ValidationStatus.error,
                help
            }
        })
    }

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

        const {Component, inputOptions, label, description, validValues, readOnly, validValuesChildKey} = this.props;
        const {validationResult, value} = this.state;

        const hasError = validationResult.validateStatus === ValidationStatus.error;

        return (
            <div className={InputCss.input}>
                <InputHeading label={label} description={description} hasError={hasError}/>
                <Component
                    onInput={this.onInput}
                    onChange={this.onChange}
                    hasError={hasError}
                    value={value}
                    onError={this.onError}
                    validValues={validValues}
                    readOnly={readOnly}
                    validValuesChildKey={validValuesChildKey}
                    {...inputOptions}
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