import * as React   from "react";
import cx           from "classnames";
import {InputNumber} from "antd";

import NumberCss from "./Number.css";
import {InputComponentProps} from "../index";

export interface NumberProps extends InputComponentProps {
    isMoney?        : boolean;
    isPercentage?   : boolean;
}

const Number = (props: NumberProps) => {
    const {onInput, onChange, hasError} = props;

    let formatter, parser;

    if(props.isMoney) {
        formatter       = value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        parser          = value => value.replace(/\$\s?|(,*)/g, '');
    } else if(props.isPercentage) {
        formatter       = value => `${value}%`;
        parser          = value => value.replace('%', '');
    }


    return <InputNumber
        className={cx(NumberCss.inputNumber, {
            [NumberCss.error] : hasError
        })}
        onChange={onInput}
        onBlur={onChange}
        formatter={formatter}
        parser={parser}
    />
};

Number.Money 	    = props => <Number isMoney {...props}/>;
Number.Percentage 	= props => <Number isPercentage {...props}/>;

export default Number;