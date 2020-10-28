import * as React from "react";
import {Divider, Row, Col, Typography} from "antd";
import {Icon} from "@super-js/components/src/icon";

import {IParameters, Parameter} from "./Parameter";

import ParametersLayoutsCss from './ParametersLayouts.css';

export interface IParametersLayoutColumn {
    parameterCode: string;
    offset?: number;
}

export interface IParametersLayoutRow {
    columns: IParametersLayoutColumn[] | string[];
}

export interface IParametersLayout {
    heading?: string;
    parameterCodes?: string[];
    rows?: IParametersLayoutRow[] | string[][];
    isCollapsible?: boolean;
    isCollapsedByDefault?: boolean;
}

export interface IParametersLayoutsProps {
    parameters: IParameters;
    layouts?: IParametersLayout[];
}

export interface IParametersLayoutProps extends IParametersLayout {
    parameters: IParameters;
}

export interface IParametersLayoutHeadingProps {
    heading: string;
}

export interface IParametersLayoutRowProps extends IParametersLayoutRow {
    parameterCodes: string[];
    parameters: IParameters;
}

interface IRenderParameterCodesOptions {
    wrapInColumns?: boolean;
    parameters: IParameters;
}

const renderParameterCodes = (parametersColumnsInfo: IParametersLayoutColumn[], options: IRenderParameterCodesOptions) => {

    const {wrapInColumns, parameters} = options;

    if(!Array.isArray(parametersColumnsInfo) || parametersColumnsInfo.length === 0) return null;

    const validParameters = parametersColumnsInfo
        .filter(p => parameters.hasOwnProperty(p.parameterCode))

    const noOfColumns = validParameters.length;
    const defaultSpan = 24 / noOfColumns;

    const _renderParameter = (parameterColumnInfo: IParametersLayoutColumn) => (
        <Parameter
            key={parameterColumnInfo.parameterCode}
            {...parameters[parameterColumnInfo.parameterCode]}
        />
    );

    return validParameters.map(p => wrapInColumns ? (
        <Col
            key={p.parameterCode}
            xs={24}
            sm={24}
            md={Math.max(defaultSpan, 12)}
            lg={defaultSpan}
            xl={defaultSpan}
            xxl={defaultSpan}
            push={p.offset > 0 ? p.offset : 0}
            pull={p.offset < 0 ? -(p.offset) : 0}
        >
            {_renderParameter(p)}
        </Col>
    ) : _renderParameter(p))
}

function ParametersLayoutHeading(props: IParametersLayoutHeadingProps) {
    return (
        <div className={ParametersLayoutsCss.heading}>
            <div className={ParametersLayoutsCss.title}>
                <Typography.Title level={5}>{props.heading}</Typography.Title>
                <div>
                    {/*<Icon iconName="caret-circle-down" />*/}
                </div>
            </div>
            <Divider />
        </div>
    )
}

function ParametersLayoutRow(props: IParametersLayoutRowProps) {

    const {parameterCodes = [], columns = [], parameters} = props;

    const parametersColumnsInfo = [
        ...parameterCodes.map(parameterCode => ({parameterCode})),
        ...columns
            // @ts-ignore
            .map(c => typeof c === "string" ? {parameterCode: c} : c)
    ]

    return (
        <Row gutter={4}>
            {renderParameterCodes(parametersColumnsInfo, {
                parameters,
                wrapInColumns: true
            })}
        </Row>
    )
}

function ParametersLayout(props: IParametersLayoutProps) {

    const {
        heading, parameterCodes = [], parameters, rows
    } = props;

    return (
        <div>
            {heading ? <ParametersLayoutHeading heading={heading} /> : null}
            {renderParameterCodes(parameterCodes.map(parameterCode => ({parameterCode})), {
                parameters
            })}
            {Array.isArray(rows) && rows.length > 0 ? (
                // @ts-ignore
                rows.map((row, rowIx) => (
                    <ParametersLayoutRow
                        key={rowIx}
                        parameterCodes={Array.isArray(row) ? row : []}
                        {...(!Array.isArray(row) && typeof row === "object") ? row : {}}
                        parameters={parameters}
                    />
                ))
            ) : null}
        </div>
    )
}

export function ParametersLayouts(props: IParametersLayoutsProps) {

    const layouts = props.layouts || [];

    if(Array.isArray(layouts) && layouts.length > 0) {
        return (
            <React.Fragment>
                {layouts
                    .map((layout, layoutIx) => (
                        <ParametersLayout
                            key={layoutIx}
                            parameters={props.parameters}
                            {...layout}
                        />
                    ))}
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                {Object.keys(props.parameters).map(parameterCode => (
                    <Parameter
                        key={parameterCode}
                        {...props.parameters[parameterCode]}                    />
                ))}
            </React.Fragment>
        )
    }
}