import * as React               from "react";
import {Select }                from 'antd';
import {Icon} from "@super-js/components/src/icon";

import SelectCss                from "./Select.css";
import {InputComponentProps}    from "../index";

export interface SelectProps extends InputComponentProps {
    multiple?   : boolean;
    allowCreate?: boolean;
}

const NoOptionsFound = () => (
    <div className={SelectCss.notFound}>
        <Icon iconName="frown" />
        <div>No more options available or not matching your search criteria.</div>
    </div>
);

function InputSelect(props: SelectProps) {

    const {onInput, validValues = [], value, multiple} = props;

    const [_validValues, setValidValues] = React.useState(Array.isArray(validValues) ? validValues : []);
    const [_loadingValidValues, setLoadingValidValues] = React.useState(typeof validValues === "function");

    React.useEffect(() => {
        (async () => {
            if(typeof validValues === "function") {
                const loadedValidValues = await validValues();
                setValidValues(loadedValidValues);
                setLoadingValidValues(false);
            }
        })();
    }, [validValues])

    return (
        <Select
            mode={multiple ? "multiple" : null}
            allowClear
            showSearch
            onChange={onInput}
            value={multiple && !value ? [] : value}
            className={SelectCss.select}
            notFoundContent={_loadingValidValues ? <Icon.Spinner /> : null}
            optionFilterProp="label"
            optionLabelProp="label"
            loading={_loadingValidValues}
            suffixIcon={_loadingValidValues ? <Icon.Spinner /> : null}
        >
            {_validValues.map(validValue => (
                <Select.Option key={validValue.value} className={SelectCss.option} value={validValue.value} label={validValue.label || validValue.value}>
                    {validValue.label ? validValue.label : validValue.value}
                </Select.Option>
            ))}
        </Select>
    )
}

InputSelect.Multiple   = props => <InputSelect multiple {...props}/>;

export default InputSelect;