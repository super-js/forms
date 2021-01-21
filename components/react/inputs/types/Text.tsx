import * as React from "react";
import {Icon} from "@super-js/components/lib/icon";
import { Input } from "antd";

import {InputComponentProps} from "../index";


export interface TextProps extends InputComponentProps {
    isPassword?         : boolean;
    isEmail?            : boolean;
    isTextArea?         : boolean;
    isPhone?            : boolean;
    noOfRows?: number;
}

const Text = (props: TextProps) => {
    const {onInput, onChange, value, noOfRows} = props;

    let InputComponent;
    let customInputOptions = {} as any;

    if(props.isPassword) {
        customInputOptions.addonBefore = <Icon iconName="key-skeleton" />;
        InputComponent          = Input.Password;
    } else if(props.isTextArea) {
        InputComponent          = Input.TextArea;
        customInputOptions.rows = noOfRows;
    } else if(props.isEmail) {
        customInputOptions.addonBefore = <Icon iconName="at" />;
    } else if(props.isPhone) {
        customInputOptions.addonBefore = <Icon iconName="phone" />;
    }

    if(!InputComponent) InputComponent = Input;

    return <InputComponent
        {...customInputOptions}
        allowClear
        onInput={ev => onInput(ev.target.value)}
        onBlur={onChange}
        value={value === "undefined" ? "" : value}
        readOnly={props.readOnly}
        disabled={props.readOnly}
    />
};

Text.Password 	= props => <Text isPassword{...props}/>;
Text.Email		= props => <Text isEmail {...props}/>;
Text.TextArea   = props => <Text isTextArea {...props}/>;
Text.Phone		= props => <Text isPhone {...props}/>;

export {Text};