import * as React from "react";
import cx from "classnames";

import {Divider, Form} from 'antd';
import {AppCard} from "@super-js/components/lib/appcard";
import {AppAlert} from '@super-js/components/lib/appalert';
import {IConfirmationResult, TOnConfirmation} from '@super-js/components/lib/appbutton';
import type {IconName} from '@super-js/components/lib/icon';

import Actions, {IAction} from "../actions";
import {InputTypes} from "../inputs";
import {Parameters, OnParametersChangeInfo, IParametersAndLayouts, IParameters} from "../parameters";
import {bulkValidate} from "../../parameters/validator";
import {IParametersLayout} from "../parameters/ParametersLayouts";

import BasicFormCss from './BasicForm.css';

export interface IOnSubmitResult {
    successMsg?: string;
    parameterValues?: { [paramCode: string]: any };
}

export interface BasicFormProps {
    title?              : string | JSX.Element,
    fullHeight?         : boolean,
    description?        : string,
    iconName?           : IconName,
    primaryActions?     : IAction[],
    parameters?         : IParameters,
    secondaryActions?   : IAction[],
    info?               : string,
    warning?            : string,
    error?: string;
    onSubmit?           : (parameters: any) => Promise<IOnSubmitResult> | Promise<any>;
    clearValuesAfterSubmit?: boolean;
    onExit?             : () => void;
    layouts?            : IParametersLayout[];
    parametersAndLayoutsLoader? : () => Promise<IParametersAndLayouts>;
    loading?: boolean;
    readOnly?: boolean;
}

export interface BasicFormState {
    submitting                  : boolean;
    hasErrors                   : boolean;
    parameters                  : IParameters;
    errors                      : string[];
    success                     : string;
}

export class BasicForm extends React.Component<BasicFormProps, BasicFormState> {

    static CRUD: React.FunctionComponentFactory<any>;

    _unMounted = false;

    state       = {
        submitting                  : false,
        hasErrors                   : false,
        parameters                  : this.props.parameters || {},
        errors                      : [],
        success                     : ""
    };

    shouldComponentUpdate(nextProps, nextState) {
        return (this.state.submitting !== nextState.submitting
        || this.state.hasErrors !== nextState.hasErrors
        || this.state.submitting !== nextState.submitting
        || this.state.errors !== nextState.errors
        || this.state.success !== nextState.success
        || this.props.title !== nextProps.title
        || this.state.parameters !== nextState.parameters
        || this.props.loading !== nextProps.loading
        || this.props.readOnly !== nextProps.readOnly
        || this.props.parameters !== nextProps.parameters
        || this.props.layouts !== nextProps.layouts
        )
        && !this._unMounted
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.parameters !== this.props.parameters) {
            this.setState({
                parameters: this.props.parameters
            })
        }
    }

    componentWillUnmount() {
        this._unMounted = true;
    }

    onSubmit    = async ev => {
        ev.preventDefault();

        const {parameters} = this.state;
        const parameterCodes = Object.keys(parameters);

        let parametersValues          = {}, success = "", onSubmitted;

        const {
            hasErrors, validatedParameters
        } = await bulkValidate(parameterCodes.map(parameterCode => {

            const parameter = parameters[parameterCode];
            parametersValues[parameterCode] = parameter.value;


            return {
                ...parameter,
                parameterType : InputTypes[parameter.inputType] ?
                    InputTypes[parameter.inputType]() : InputTypes.text()
            }
        }));

        const readyToSubmit = !hasErrors && typeof this.props.onSubmit === "function";

        this.setState({
            hasErrors,
            parameters : parameterCodes.reduce((_, parameterCode) => {

                _[parameterCode] = {
                    ...parameters[parameterCode],
                    validationResult : validatedParameters[parameterCode]
                }

                return _;
            }, {}),
            submitting: readyToSubmit,
            errors: []
        });

        if(readyToSubmit) {

            let errors = [];

            try {
                onSubmitted = await this.props.onSubmit(parametersValues);
            } catch(err) {

                if(err.validationErrors && Object.keys(err.validationErrors).length > 0) {
                    err.validationErrors = Object.keys(err.validationErrors).map(fieldName => (
                        `${fieldName} - ${err.validationErrors[fieldName].join(',')}`
                    ))
                }

                errors = Array.isArray(err.validationErrors) && err.validationErrors.length > 0 ?
                    err.validationErrors : [err.message];
            } finally {

                if(!this._unMounted) {

                    const {successMsg, parameterValues = {}} = onSubmitted || {};

                    let afterSubmitState = {
                        submitting : false,
                        errors,
                        success: successMsg && typeof successMsg === "string" ? successMsg : ""
                    };

                    if(this.props.clearValuesAfterSubmit && errors.length === 0) {

                        afterSubmitState["parameters"] = Object.keys(parameters).reduce((_, parameterCode) => {
                            _[parameterCode] = {
                                ...parameters[parameterCode],
                                value: ""
                            }
                            return _;
                        }, {});

                    } else if(parameterValues && Object.keys(parameterValues).length > 0) {
                        afterSubmitState["parameters"] = Object.keys(parameters).reduce((_, parameterCode) => {

                            _[parameterCode] = !parameterValues.hasOwnProperty(parameterCode) ?
                                parameters[parameterCode] : {
                                    ...parameters[parameterCode],
                                    value: parameterValues[parameterCode]
                                }

                            return _;
                        }, {});
                    }

                    this.setState(afterSubmitState);
                }

            }

        }
    };

    onParametersChange = (parametersInfo: OnParametersChangeInfo) => {
        if(!this._unMounted) {
            this.setState(state => ({
                parameters          : parametersInfo.parameters,
                hasErrors           : parametersInfo.hasErrors,
                errors              : [...state.errors, ...parametersInfo.errors]
            }))
        }
    };

    render() {

        const {
            title, primaryActions, description, secondaryActions, iconName, info, warning, fullHeight, onExit,
            readOnly, loading, error
        } = this.props;

        const {submitting, hasErrors, parameters, errors, success} = this.state;

        let allErrors = [
            ...errors
        ];
        if(error) allErrors.push(error);

        return (
            <AppCard
                title={title}
                description={description}
                iconName={iconName}
                fullHeight={fullHeight}
                small
                onExit={onExit}
            >
                <Form layout="vertical" className={cx(BasicFormCss.form, {
                    [BasicFormCss.fullHeight] : fullHeight
                })} onSubmitCapture={this.onSubmit}>
                    <div className={BasicFormCss.formContent}>
                        {Array.isArray(allErrors) && allErrors.length > 0 ? (
                            allErrors.map(_error => <AppAlert key={_error} message={_error} type="error" />)
                        ) : null}
                        {success ? (
                            <AppAlert message={success} type="success" />
                        ) : null}
                        {info ? (
                            <AppAlert message={info} type="info" />
                        ) : null}
                        {warning ? (
                            <AppAlert message={warning} type="warning" />
                        ) : null}
                        <div className={cx(BasicFormCss.parameters, {
                            [BasicFormCss.fullHeight] : fullHeight
                        })}>
                            <Parameters
                                parameters={parameters}
                                onParametersChange={this.onParametersChange}
                                layouts={this.props.layouts}
                                parametersAndLayoutsLoader={this.props.parametersAndLayoutsLoader}
                                loading={loading}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>
                    <div className={BasicFormCss.formActions}>
                        {!readOnly ? (
                            <React.Fragment>
                                {Array.isArray(primaryActions) && primaryActions.length > 0 ? <Divider /> : null}
                                <Actions
                                    primaryActions={primaryActions}
                                    secondaryActions={secondaryActions}
                                    submitting={submitting}
                                    hasErrors={hasErrors}
                                    readOnly={loading}
                                />
                            </React.Fragment>
                        ) : null}
                    </div>
                </Form>
            </AppCard>
        )
    }
}

export interface BasicFormCrudProps extends BasicFormProps {
    onDelete?: () => Promise<void>;
    onCancel?: () => void;
    onDeleteConfirmation?: TOnConfirmation;
    onCancelConfirmation?: TOnConfirmation;
    onSaveConfirmation?: TOnConfirmation;
}

BasicForm.CRUD = (props: BasicFormCrudProps) => {

    const onDelete = () => {
        if(typeof props.onDelete === "function") {
            return  props.onDelete();
        }
    };

    const onCancel = () => {
        if(typeof props.onCancel === "function") {
            return props.onCancel();
        }
    };

    return (
        <BasicForm
            primaryActions={[
                {code: 'save', label: 'SAVE', isSubmit: true, iconName: "save", onConfirmation: props.onSaveConfirmation},
                {code: 'cancel', label: 'CANCEL', onClick: onCancel, onConfirmation: props.onCancelConfirmation}
            ]}
            secondaryActions={[
                {code: 'delete', iconName: "trash", onClick: onDelete, onConfirmation: props.onDeleteConfirmation}
            ]}
            {...props}
        />
    );
};