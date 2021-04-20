import * as React from "react";

import {IParameters} from "./parameters";
import {IParametersLayout} from "./parameters/ParametersLayouts";

export * from './basicform';
export * from './utils';

export interface IFormDataLoaderOptions {
    parameters: IParameters;
    setParameters: Function;
    layouts: IParametersLayout[];
    setLayouts: Function;
    setLoadingForm: Function;
}

export interface UseFormProps {
    initialParameters: IParameters;
    initialLayouts: IParametersLayout[];
    loading?: boolean;
    formDataLoader?: (options: IFormDataLoaderOptions) => Promise<any>;
}

export const useForm = (props: UseFormProps) => {

    const [formData, setFormData] = React.useState({});
    const [parameters, setParameters] = React.useState(props.initialParameters);
    const [layouts, setLayouts] = React.useState(props.initialLayouts);
    const [error, setError] = React.useState("");

    const [loadingForm, setLoadingForm] = React.useState(typeof props.formDataLoader === "function");

    const clearForm = () => {
        setParameters(Object.keys(parameters).reduce((_, parameterCode) => {

            _[parameterCode] = {
                ...parameters[parameterCode],
                value: ''
            }

            return _;
        }, {}))
    }

    React.useEffect(() => {
        (async () => {
            try {
                if(typeof props.formDataLoader === "function") {
                    setFormData(await props.formDataLoader({
                        parameters, setParameters, layouts, setLayouts, setLoadingForm
                    }));
                }
            } catch(err) {
                setError('We were unable to load some data required by the form, please try refreshing the page or contact a technical support');
            }

            setLoadingForm(false);
        })()
    }, [])

    return {
        parameters, setParameters, layouts, loadingForm, formData, error, clearForm
    }
}