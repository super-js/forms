import * as React                                       from "react";
import cx                                               from "classnames";
import { Rate } from "antd";

import RateCss from "./Rate.css";
import {InputComponentProps} from "../index";

export interface RateProps extends InputComponentProps {
}

const InputRate = (props: RateProps) => {

    const {value, onInput, onChange} = props;


    return <Rate
        allowHalf
        allowClear
        className={RateCss.rateWrapper}
        value={value}
        onChange={async value => {
            await onInput(value === 0 ? null : value);
            onChange();
        }}
    />
};

export default InputRate;