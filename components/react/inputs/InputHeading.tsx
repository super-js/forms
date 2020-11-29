import * as React from "react";
import { Tooltip } from 'antd';
import { Icon } from "@super-js/components/src/icon";
import InputHeadingCss from "./InputHeading.css";
import {Typography} from "antd";


export interface IInputHeadingProps {
    label?: string;
    description?: string;
    hasError?: boolean;
}

export function InputHeading(props: IInputHeadingProps) {
    if(!props.label && !props.description) return null;

    return (
        <div className={InputHeadingCss.inputHeading}>
            <div>
                {props.label ?
                    <Typography.Text type={props.hasError ? "danger" : "secondary"}>{props.label}</Typography.Text> : null
                }
            </div>
            <div>
                {props.description ? (
                    <Tooltip title={props.description} trigger={['hover', 'click']}>
                        <Icon iconName="info-circle" clickable />
                    </Tooltip>
                ) : null}
            </div>
        </div>
    )
}