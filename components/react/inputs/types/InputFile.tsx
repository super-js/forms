import * as React from "react";
import { Upload, Typography} from 'antd';
import cx from "classnames";

import {Icon} from "@super-js/components/src/icon";

import {InputComponentProps} from "../index";
import InputFileCss from "./InputFile.css";
import {RcFile} from "antd/lib/upload/interface";

export interface IInputFileInfo {
    fileName: string;
    fileLabel?: string;
    id?: number;
    uid?: string;
    toRemove?: boolean;
}

export type InputTypeValue = IInputFileInfo | RcFile;

export interface InputFileProps extends Omit<InputComponentProps, 'value'> {
    multiple?: boolean;
    onClick?: (file: any) => any;
    value: InputTypeValue | InputTypeValue[];
}

const InputFile = (props: InputFileProps) => {

    const {onInput, value, multiple, onClick} = props;

    let fileList = [];

    if(multiple) {
        fileList = Array.isArray(value) ? value : [];
    } else {
        fileList = value ? [value] : [];
    }

    const removeFile = fileToRemove => {
        if(fileToRemove instanceof File) {
            onInput(!Array.isArray(value) ? null : value.filter(file => file.uid !== (fileToRemove as RcFile).uid))
        } else {
            onInput(!Array.isArray(value) ? {
                ...fileToRemove,
                toRemove: true
            } : value.map(file => {
                if((file as IInputFileInfo).id === fileToRemove.id || file.uid === fileToRemove.uid) {
                    return {
                        ...file,
                        toRemove: true
                    }
                }

                return file;
            }));
        }
    }

    return (
        <div>
            <Upload.Dragger
                multiple={multiple}
                action={null}
                fileList={fileList.map(file => file instanceof File ? file : {
                    uid: file.uid || file.id || file.fileName,
                    ...file,
                })}
                beforeUpload={(file, fileList) => {
                    onInput(Array.isArray(value) ? [
                        ...value,
                        file
                    ] : file);
                    return false;
                }}
                className={InputFileCss.wrapper}
                itemRender={(node, file) => {
                    return (
                        <div className={cx(InputFileCss.file, {
                            [InputFileCss.newFile]: file instanceof File,
                            [InputFileCss.toRemove]: (file as IInputFileInfo).toRemove
                        })}>
                            {typeof onClick === "function" ? (
                                <Typography.Link onClick={() => onClick(file)}>{file.fileName || file.name}</Typography.Link>
                            ) : (
                                <Typography>{file.fileName || file.name}</Typography>
                            )}
                            <Icon iconName="trash" clickable onClick={() => removeFile(file)} />
                        </div>
                    )
                }}
            >
                <div className={InputFileCss.content}>
                    <Icon iconName="upload" />
                </div>
            </Upload.Dragger>
        </div>
    )
};

InputFile.Multiple = (props: InputFileProps) => <InputFile {...props} multiple />

export {InputFile};