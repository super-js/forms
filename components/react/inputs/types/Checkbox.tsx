import * as React                                       from "react";
import { Checkbox } from "antd";

import CheckboxCss from "./Checkbox.css";
import {InputComponentProps} from "../index";

export interface RateProps extends InputComponentProps {
}

const InputCheckbox = (props: RateProps) => {

    const {value, onInput, onChange} = props;

    const isChecked = (
        value === true || value === "true" || value === 1
    )

    return (
        <Checkbox
            className={CheckboxCss.checkbox}
            checked={isChecked}
            onChange={ev => onInput(ev.target.checked)}
            disabled={props.readOnly}
        />
    )
};

export {InputCheckbox};