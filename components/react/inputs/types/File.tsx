import * as React from "react";
import { Upload, Typography } from 'antd';

import {InputComponentProps} from "../index";
import {Icon} from "../../icon";

import FileCss from "./File.css";

export interface FileProps extends InputComponentProps {
}


const File = (props: FileProps) => {

    const {onInput, value} = props;

    if(value && !value.hasOwnProperty('uid')) value.uid = value.name;

    return (
        <Upload.Dragger
            multiple={false}
            action={null}
            fileList={value ? [value] : []}
            beforeUpload={(file, fileList) => {
                onInput(file);
                return false;
            }}
            onRemove={file => onInput(null)}
            className={FileCss.wrapper}
        >
            <div className={FileCss.content}>
                <Icon iconName="upload" />
                <Typography.Paragraph>
                    Drag & Drop your file here <strong>or</strong> click to select.
                </Typography.Paragraph>
            </div>
        </Upload.Dragger>
    )
};

export default File;