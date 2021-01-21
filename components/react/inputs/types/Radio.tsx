import * as React   from "react";
import cx           from "classnames";
import {Radio}      from 'antd';
import RadioCss from "./Radio.css";
import {InputComponentProps} from "../index";


export interface RadioProps extends InputComponentProps {
}

const InputRadio = (props: RadioProps) => {

    const {onInput, onChange, validValues = [], value} = props;

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
        <Radio.Group
            onChange={ev => {
                onInput(ev.target.value);
                onChange(ev.target.value);
            }}
            value={value}
            className={RadioCss.radioWrapper}
            disabled={_loadingValidValues || props.readOnly}
        >
            {_validValues.map(validValue => (
                <Radio key={validValue.value} value={validValue.value}>{validValue.label ? validValue.label : validValue.value}</Radio>
            ))}
        </Radio.Group>
    )
};

export default InputRadio;