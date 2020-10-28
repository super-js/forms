import * as React from "react";
import {cloneDeep} from "lodash";
import {Skeleton} from "antd";

import {ValidationResult, ValidationStatus} from "../../parameters/validator";
import {IParameters} from "./Parameter";
import {IParametersLayout, ParametersLayouts} from "./ParametersLayouts";


export enum OnParametersChangeEventCode {
    PARAMS_VALUE_INPUT          = "PARAM_VALUE_INPUT",
    PARAMS_INIT                 = "PARAMS_INIT",
    PARAMS_VALIDATION_CHANGE    = "PARAMS_VALIDATION_CHANGE"
}

export interface OnParametersChangeInfo {
    eventCode           : OnParametersChangeEventCode;
    parameters          : IParameters;
    hasErrors           : boolean;
    errors              : string[];
}
export type OnParametersChange      = (parametersChangeInfo: OnParametersChangeInfo) => void;
export type TParameterDefinitions    = IParameters | (() => Promise<IParameters>);
export type TParametersLayoutsDefinition = IParametersAndLayouts | (() => Promise<IParametersAndLayouts>);;

export interface IParametersAndLayouts {
    parameters: IParameters;
    layouts?: IParametersLayout[];
}

export interface ParametersProps {
    parameters?                 : IParameters,
    onParametersChange?         : OnParametersChange,
    layouts?                    : IParametersLayout[];
    parametersAndLayoutsLoader? : () => Promise<IParametersAndLayouts>;
}

export interface ParametersState {
    parameters          : IParameters;
    layouts?            : IParametersLayout[];
    loadingParameters   : boolean;
    error               : string;
}

const ParametersContext    = React.createContext({
    onParameterValueInput           : (parameterCode: string, value             : any)              => null,
    onParameterValidationChange     : (parameterCode: string, validationResult  : ValidationResult) => null,
    parameters                      : {}
});


export class Parameters extends React.Component<ParametersProps, ParametersState> {

    onParameterValueInputTimeout = null;

    state = {
        loadingParameters       : typeof this.props.parametersAndLayoutsLoader === "function",
        parameters              : typeof this.props.parametersAndLayoutsLoader === "function" ? {} : cloneDeep(this.props.parameters),
        layouts                 : typeof this.props.parametersAndLayoutsLoader === "function" ? [] : cloneDeep(this.props.layouts),
        error                   : ""
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.parameters !== nextState.parameters
            || (this.props.parameters !== nextProps.parameters && nextProps.parameters !== this.state.parameters)
            || this.state.loadingParameters !== nextState.loadingParameters
    }

    async componentDidMount() {
        if(typeof this.props.parametersAndLayoutsLoader === "function") {
            try {
                const {parameters = {}, layouts = []} = await this.props.parametersAndLayoutsLoader();

                this.setState({
                    parameters: parameters,
                    layouts: layouts,
                    loadingParameters : false
                }, () =>  this.onParametersInit());

            } catch(err) {
                this.setState({
                    error: err.message,
                    parameters: {},
                    layouts: [],
                    loadingParameters : false
                },() =>  this.onParametersInit())
            }
        } else {
            this.onParametersInit();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.props.parameters !== prevProps.parameters) {
            this.setState({
                parameters: this.props.parameters
            })
        }
    }

    _onParametersChange     = (eventCode: OnParametersChangeEventCode) => {
        if(typeof this.props.onParametersChange === "function") {

            const {parameters} = this.state;

            this.props.onParametersChange({
                eventCode           : eventCode,
                parameters          : parameters,
                errors              : this.state.error ? [this.state.error] : [],
                hasErrors           : !!this.state.error || Object.keys(parameters)
                    .some(parameterCode => parameters[parameterCode].validationResult
                        && parameters[parameterCode].validationResult.validateStatus === ValidationStatus.error)
            });
        }
    };

    onParameterValueInput   = (parameterCode, value) => {
        const {parameters} = this.state;
        if(parameters.hasOwnProperty(parameterCode)) {

            parameters[parameterCode].value = value;

            clearTimeout(this.onParameterValueInputTimeout);
            this.onParameterValueInputTimeout = setTimeout(() => {

                this.setState({
                    parameters
                }, () => this._onParametersChange(OnParametersChangeEventCode.PARAMS_VALUE_INPUT));

            }, 500);
        }
    };

    onParameterValidationChange  = (parameterCode: string, validationResult: ValidationResult) => {
        const {parameters} = this.state;
        if(parameters.hasOwnProperty(parameterCode)) {
            parameters[parameterCode].validationResult = validationResult;

            this.setState({
                parameters
            }, () => this._onParametersChange(OnParametersChangeEventCode.PARAMS_VALIDATION_CHANGE));
        }
    };

    onParametersInit = () => {
        this._onParametersChange(OnParametersChangeEventCode.PARAMS_INIT);
    }

    render() {
        return this.state.loadingParameters ? (
            <Skeleton active />
        ) : (
            <ParametersContext.Provider value={{
                onParameterValueInput           : this.onParameterValueInput,
                onParameterValidationChange     : this.onParameterValidationChange,
                parameters                      : this.state.parameters
            }}>
                <ParametersLayouts
                    layouts={this.state.layouts}
                    parameters={this.state.parameters}
                />
            </ParametersContext.Provider>
        )
    }
}

export {
    ParametersContext
}

export type {IParameters};