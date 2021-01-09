import * as React               from "react";
import {Select, TreeSelect }                from 'antd';
import {Icon} from "@super-js/components/lib/icon";

import SelectCss                from "./Select.css";
import {IInputValidValue, InputComponentProps} from "../index";

export interface InputSelectProps extends InputComponentProps {
    multiple?   : boolean;
    allowCreate?: boolean;
    tree?: boolean;
}

const NoOptionsFound = () => (
    <div className={SelectCss.notFound}>
        <Icon iconName="frown" />
        <div>No more options available or not matching your search criteria.</div>
    </div>
);

function InputSelect(props: InputSelectProps) {

    const {onInput, validValues = [], value, multiple, tree} = props;

    const [_validValues, setValidValues] = React.useState(Array.isArray(validValues) ? validValues : []);
    const [_loadingValidValues, setLoadingValidValues] = React.useState(typeof validValues === "function");
    const selectValue = multiple && !value ? [] : value;

    React.useEffect(() => {
        (async () => {
            if(typeof validValues === "function") {
                const loadedValidValues = await validValues();
                setValidValues(loadedValidValues);
                setLoadingValidValues(false);
            }
        })();
    }, [validValues]);

    const renderSelect = () => (
        <Select
            mode={multiple ? "multiple" : null}
            allowClear
            showSearch
            onChange={onInput}
            value={selectValue}
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
    );

    const renderTreeSelect = () => {

        const _renderTreeNodes = (children: IInputValidValue[]) => children.map(validValue => (
            <TreeSelect.TreeNode
                key={validValue.value}
                value={validValue.value}
                className={SelectCss.option}
                title={validValue.label || validValue.value}
            >
                {Array.isArray(validValue.children) && validValue.children.length > 0 ?
                    _renderTreeNodes(validValue.children) : null
                }
            </TreeSelect.TreeNode>
        ))

        return (
            <TreeSelect
                showSearch
                allowClear
                className={SelectCss.select}
                value={selectValue}
                onChange={onInput}
                treeNodeFilterProp="label"
                treeNodeLabelProp="label"
                treeCheckable={multiple}
            >
                {_renderTreeNodes(_validValues)}
            </TreeSelect>
        )
    }

    return tree ? renderTreeSelect() : renderSelect();
}

InputSelect.Multiple   = props => <InputSelect multiple {...props}/>;
InputSelect.Tree = props => <InputSelect tree {...props} />;
InputSelect.TreeMultiple = props => <InputSelect tree multiple {...props} />

export default InputSelect;