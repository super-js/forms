import * as React from "react";
import { Upload, Typography} from 'antd';
import cx from "classnames";

import {Icon} from "@super-js/components/lib/icon";

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
    getDownloadBlob?: (file: any) => Promise<Blob>;
    value: InputTypeValue | InputTypeValue[];
    acceptFileTypes?: string[];
    onPreview?: (file: InputTypeValue | InputTypeValue[]) => any;
}

const InputFile = (props: InputFileProps) => {

    const {onInput, value, multiple, getDownloadBlob, acceptFileTypes, onPreview, readOnly} = props;

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

    const onDownload = async (file) => {
        if(typeof getDownloadBlob === "function" || file instanceof File) {
            const blob = file instanceof File ? file : await getDownloadBlob(file);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            const _onClickDownload = function (ev) {
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    this.removeEventListener('click', _onClickDownload);
                }, 150);
            }

            a.href = url;
            a.download = (file.name || file.fileName) || 'download';
            a.addEventListener('click', _onClickDownload, false);

            a.click();

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
                className={cx(InputFileCss.wrapper, {
                    [InputFileCss.readOnly]: readOnly
                })}
                disabled={readOnly}
                accept={Array.isArray(acceptFileTypes) ? acceptFileTypes.join(',') : ''}
                itemRender={(node, file) => {
                    return (
                        <div className={cx(InputFileCss.file, {
                            [InputFileCss.newFile]: file instanceof File,
                            [InputFileCss.toRemove]: (file as IInputFileInfo).toRemove
                        })}>
                            {typeof getDownloadBlob === "function" ? (
                                <Typography.Link onClick={() => onDownload(file)}>{file.fileName || file.name}</Typography.Link>
                            ) : (
                                <Typography>{file.fileName || file.name}</Typography>
                            )}
                            <div>
                                {typeof onPreview === "function" ? <Icon iconName="eye" clickable onClick={() => onPreview(value)} /> : null}
                                <Icon iconName="trash" clickable onClick={() => removeFile(file)} />
                            </div>
                        </div>
                    )
                }}
            >
                {!readOnly ? (
                    <div className={InputFileCss.content}>
                        <Icon iconName="upload" />
                    </div>
                ) : null}
            </Upload.Dragger>
        </div>
    )
};

InputFile.Multiple = (props: InputFileProps) => <InputFile {...props} multiple />

export {InputFile};