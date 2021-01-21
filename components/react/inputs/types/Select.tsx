import * as React               from "react";
import {Select, TreeSelect }                from 'antd';
import {Icon} from "@super-js/components/lib/icon";

import SelectCss                from "./Select.css";
import {IInputValidValue, InputComponentProps, Input} from "../index";

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

    const {onInput, value, multiple, tree, validValuesChildKey} = props;
    const selectValue = multiple && !value ? [] : value;

    const {
        validValues, loadingValidValues
    } = Input.useValidValues(props.validValues, props.onError, validValuesChildKey);


    const renderSelect = () => (
        <Select
            mode={multiple ? "multiple" : null}
            allowClear
            showSearch
            onChange={value => onInput(value, {
                validValues
            })}
            value={selectValue}
            className={SelectCss.select}
            notFoundContent={loadingValidValues ? <Icon.Spinner /> : null}
            optionFilterProp="label"
            optionLabelProp="label"
            loading={loadingValidValues}
            suffixIcon={loadingValidValues ? <Icon.Spinner /> : null}
            disabled={props.readOnly}
        >
            {validValues.map(validValue => (
                <Select.Option
                    key={validValue.value}
                    className={SelectCss.option}
                    value={validValue.value}
                    label={validValue.label}
                >
                    {validValue.label}
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
                title={validValue.label}
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
                onChange={value => onInput(value, {
                    validValues
                })}
                treeNodeFilterProp="label"
                // treeCheckable={multiple}
                multiple={multiple}
                treeData={validValues}
                loading={loadingValidValues}
                treeDefaultExpandAll={true}
                disabled={props.readOnly}
            >
                {/*{_renderTreeNodes(validValues)}*/}
            </TreeSelect>
        )
    }

    return tree ? renderTreeSelect() : renderSelect();
}

InputSelect.Multiple   = props => <InputSelect multiple {...props}/>;
InputSelect.Tree = props => <InputSelect tree {...props} />;
InputSelect.TreeMultiple = props => <InputSelect tree multiple {...props} />

export default InputSelect;