import * as React from "react";

import ActionsCss from "./Actions.css";
import {AppButtonProps, AppButton} from "@super-js/components/src/appbutton";

export interface IAction extends Omit<AppButtonProps, 'type' | 'loading' | 'disabled'> {
    code            : string;
}

export interface ActionsProps {
    primaryActions?     : IAction[],
    secondaryActions?   : IAction[],
    submitting          : boolean
    hasErrors           : boolean
}

const Actions = (props: ActionsProps) => {

    const hasPrimaryActions     = Array.isArray(props.primaryActions) && props.primaryActions.length > 0;
    const hasSecondaryActions   = Array.isArray(props.secondaryActions) && props.secondaryActions.length > 0;

    const _renderActions        = (actions: IAction[], type?: any) => (
        <React.Fragment>
            {actions.map((action, ix) => (
                <AppButton
                    key={action.code}
                    loading={props.submitting}
                    disabled={props.submitting || (props.hasErrors && action.isSubmit)}
                    link={ix > 0 || type === "link"}
                    {...action}
                />
            ))}
        </React.Fragment>
    );

    return hasPrimaryActions || hasSecondaryActions ? (
        <div className={ActionsCss.actions}>
            {hasPrimaryActions ? (
                <div className={ActionsCss.primaryActions}>
                    {_renderActions(props.primaryActions)}
                </div>
            ) : null}
            {hasSecondaryActions ? (
                <div className={ActionsCss.secondaryActions}>
                    {_renderActions(props.secondaryActions, 'link')}
                </div>
            ) : null}
        </div>
    ) : null;
};

export default Actions;