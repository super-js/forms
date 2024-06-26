import * as React   from "react";
import cx           from "classnames";
import * as moment  from "moment";
import { DatePicker } from "antd";

import DateTimeCss from "./DateTime.css";
import {InputComponentProps} from "../index";

export interface DateTimeProps extends InputComponentProps {
    includeTime?    : boolean;
    isRange?        : boolean
}

const DateTime = (props: DateTimeProps) => {

    let DateTimeComponent;

    const dateTimeFormat = `DD/MM/YYYY ${props.includeTime ? 'H:m' : ''}`;

    if(props.isRange) {
        DateTimeComponent = DatePicker.RangePicker;
    }

    if(!DateTimeComponent) DateTimeComponent = DatePicker;


    const _getDateValue = () => {
        if(Array.isArray(props.value)) {

            if(props.value.length > 1) {
                const start         = moment(props.value[0], dateTimeFormat);
                const end           = moment(props.value[1], dateTimeFormat);

                return start.isValid() && end.isValid() ? [start, end] : [];
            }

            return [];


        } else {

            const dateValue = moment(props.value, dateTimeFormat);
            return dateValue.isValid() ? dateValue : "";

        }
    };

    return (
        <DateTimeComponent
            format={dateTimeFormat}
            value={_getDateValue()}
            className={DateTimeCss.dateTimeComponent}
            showTime={props.includeTime ? { format: 'H:m' } : false}
            onChange={async (value, valueString) => {
                await props.onInput(valueString);
                props.onChange();
            }}
            readOnly={props.readOnly}
            disabled={props.readOnly}
        />
    )

};

DateTime.DatePicker             = props => <DateTime {...props} />;
DateTime.DateTimePicker         = props => <DateTime includeTime {...props} />;
DateTime.DateRangePicker        = props => <DateTime isRange {...props} />;
DateTime.DateTimeRangePicker    = props => <DateTime isRange includeTime {...props} />;

export default DateTime;