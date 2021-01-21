import * as React from "react";
import cloneDeep from "lodash-es/cloneDeep";
import {Skeleton} from "antd";

import {ValidationResult, ValidationStatus} from "../../parameters/validator";
import {IParameter, IParameters} from "./Parameter";
import {IParametersLayout, ParametersLayouts} from "./ParametersLayouts";
import {Processing, EProcessingSize} from "@super-js/components/lib/processing";
import ParametersCss from "./Parameters.css";

export enum OnParametersChangeEventCode {
    PARAMS_VALUE_INPUT          = "PARAM_VALUE_INPUT",
    PARAMS_INIT                 = "PARAMS_INIT",
    PARAMS_VALIDATION_CHANGE    = "PARAMS_VALIDATION_CHANGE"
}

export interface IOnParametersChangeEventData {
    parameter?: IParameter;
    data?: any;
}

export interface OnParametersChangeInfo {
    eventCode           : OnParametersChangeEventCode;
    parameters          : IParameters;
    hasErrors           : boolean;
    errors              : string[];
}
export type OnParametersChange      = (parametersChangeInfo: OnParametersChangeInfo) => void;
export type TParameterDefinitions    = IParameters | (() => Promise<IParameters>);
export type TParametersLayoutsDefinition = IParametersAndLayouts | (() => Promise<IParametersAndLayouts>);

export interface IParametersAndLayouts {
    parameters: IParameters;
    layouts?: IParametersLayout[];
}

export interface ParametersProps {
    loading?: boolean;
    readOnly?: boolean;
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
    onParameterValueInput           : (parameterCode: string, value: any, onInputData: any)              => null,
    onParameterValidationChange     : (parameterCode: string, validationResult  : ValidationResult) => null,
    parameters                      : {},
    readOnly                        : false
});


export class Parameters extends React.Component<ParametersProps, ParametersState> {

    onParameterValueInputTimeout = null;

    state = {
        loadingParameters       : typeof this.props.parametersAndLayoutsLoader === "function",
        parameters              : {},
        layouts                 : [],
        error                   : ""
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.parameters !== nextState.parameters
            || (this.props.parameters !== nextProps.parameters && nextProps.parameters !== this.state.parameters)
            || this.state.loadingParameters !== nextState.loadingParameters
            || this.props.loading !== nextProps.loading
            || this.props.readOnly !== nextProps.readOnly
    }

    async componentDidMount() {
        if(typeof this.props.parametersAndLayoutsLoader === "function") {
            try {
                const {parameters = {}, layouts = []} = await this.props.parametersAndLayoutsLoader();

                this.setState({
                    parameters: this._normalizeParameters(parameters),
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
            this.setState({
                parameters: this.props.parameters ? this._normalizeParameters(this.props.parameters) : {},
                layouts: this.props.layouts || []
            }, () => this.onParametersInit());
        }
    }

    componentDidUpdate(prevProps, prevState) {

        if(this.props.parameters !== prevProps.parameters && this.props.parameters !== this.state.parameters) {
            this.setState(state => ({
                parameters: this._normalizeParameters(this.props.parameters)
            }))
        }
        // else if(
        //     (this.props.loading !== prevProps.loading)
        //     || (this.props.readOnly !== prevProps.readOnly)
        // ) {
        //     this.setState(state => ({
        //         parameters: this._normalizeParameters(state.parameters)
        //     }))
        // }

    }

    _normalizeParameters = (parameters: IParameters) => {

        // const normalizedParameters = cloneDeep(parameters);
        //
        // if(this.props.loading || this.props.readOnly) {
        //     Object.keys(normalizedParameters)
        //         .forEach(parameterCode => {
        //             normalizedParameters[parameterCode].readOnly = this.props.loading || this.props.readOnly;
        //         })
        // }

        return parameters;
    }

    _onParametersChange     = (eventCode: OnParametersChangeEventCode, eventData: IOnParametersChangeEventData = {}) => {

        const {parameter, data} = eventData;
        const {parameters} = this.state;

        if(typeof this.props.onParametersChange === "function") {
            this.props.onParametersChange({
                eventCode           : eventCode,
                parameters          : parameters,
                errors              : this.state.error ? [this.state.error] : [],
                hasErrors           : !!this.state.error || Object.keys(parameters)
                    .some(parameterCode => parameters[parameterCode].validationResult
                        && parameters[parameterCode].validationResult.validateStatus === ValidationStatus.error)
            });
        }

        if(parameter && typeof parameter.onChange === "function") {
            parameter.onChange({
                eventCode,
                parameter: parameter,
                parameters: parameters,
                data
            })
        }

    };

    onParameterValueInput   = (parameterCode, value, onInputData = {}) => {
        const {parameters} = this.state;
        if(parameters.hasOwnProperty(parameterCode)) {

            parameters[parameterCode].value = value;

            clearTimeout(this.onParameterValueInputTimeout);
            this.onParameterValueInputTimeout = setTimeout(() => {

                this.setState({
                    parameters
                }, () => this._onParametersChange(OnParametersChangeEventCode.PARAMS_VALUE_INPUT, {
                    data: onInputData,
                    parameter: parameters[parameterCode]
                }));

            }, 500);
        }
    };

    onParameterValidationChange  = (parameterCode: string, validationResult: ValidationResult) => {
        const {parameters} = this.state;
        if(parameters.hasOwnProperty(parameterCode)) {
            parameters[parameterCode].validationResult = validationResult;

            this.setState({
                parameters
            }, () => this._onParametersChange(OnParametersChangeEventCode.PARAMS_VALIDATION_CHANGE, {
                data: validationResult,
                parameter: parameters[parameterCode]
            }));
        }
    };

    onParametersInit = () => {
        this._onParametersChange(OnParametersChangeEventCode.PARAMS_INIT, {
            data: {}
        });
    }

    render() {

        const {loading} = this.props;

        return this.state.loadingParameters ? (
            <Skeleton active />
        ) : (
            <ParametersContext.Provider value={{
                onParameterValueInput           : this.onParameterValueInput,
                onParameterValidationChange     : this.onParameterValidationChange,
                parameters                      : this.state.parameters,
                readOnly: this.props.loading || this.props.readOnly
            }}>
                <div className={ParametersCss.parameters}>
                    {loading ? <Processing size={EProcessingSize.LARGE} className={ParametersCss.processing} /> : null}
                    <ParametersLayouts
                        layouts={this.state.layouts}
                        parameters={this.state.parameters}
                        loading={loading}
                    />
                </div>
            </ParametersContext.Provider>
        )
    }
}

export {
    ParametersContext
}

export type {IParameters};