import * as React               from "react";
import {Select }                from 'antd';
import SelectCss                from "./Select.css";


import {InputComponentProps}    from "../index";
import {Icon} from "../../icon";

export interface SelectProps extends InputComponentProps {
    multiple?   : boolean;
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
    const [_loadingValidValues, setLoadingValidValues] = React.useState(false);

    const getValidValues = async search => {
        if(typeof validValues === "function") {
            setLoadingValidValues(true);
            try {
                const _ = await validValues(search);
                setValidValues(_);
            } catch(err) {
                console.error(err);
            }
            setLoadingValidValues(false);
        }
    }

    // let _filteredValidValues;
    //
    // if(multiple) {
    //     if(Array.isArray(value) && value.length > 0) {
    //         _filteredValidValues = validValues.filter(validValue =>
    //             !value.some(v => v === validValue.value)
    //         );
    //     }
    // }
    //
    // if(!_filteredValidValues) _filteredValidValues = validValues;

    return (
        <Select
            mode={multiple ? "tags" : null}
            allowClear
            showSearch
            onChange={async (value, option) => {
                await onInput(value);
            }}
            value={value}
            className={SelectCss.select}
            notFoundContent={null}
            onSearch={typeof validValues === "function" ? getValidValues : null}
            optionFilterProp="label"
            optionLabelProp="label"
            loading={_loadingValidValues}
            suffixIcon={typeof validValues === "function" ? <span></span> : undefined}
        >
            {_validValues.map(validValue => (
                <Select.Option key={validValue.value} className={SelectCss.option} value={validValue.label} label={validValue.label}>
                    {validValue.label ? validValue.label : validValue.value}
                </Select.Option>
            ))}
        </Select>
    )
}

InputSelect.Multiple   = props => <InputSelect multiple {...props}/>;

export default InputSelect;