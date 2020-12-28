import * as React from "react";
import cx from "classnames";
import arrayMove from 'array-move';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import { List, Input, Typography, Divider} from 'antd';

import { Icon } from "@super-js/components/src/icon";
import {InputComponentProps} from "../index";
import ListCss from './List.css'
import {SyntheticEvent} from "react";


export interface InputListProps extends InputComponentProps {
    onClick?: (listItem: IInputListItem) => any;
}

export interface AddNewItemProps {
    onAdd: Function;
}

export interface IInputListItem {
    id?: number;
    name: string;
    isNew?: boolean;
    isDelete?: boolean;
    data?: any;
}

const emptyText = (
    <Typography.Text disabled>
        <Icon iconName="info-circle" clickable/>
        No items, Please use the field above to add items
    </Typography.Text>
);

const DragHandle = SortableHandle<any>(() => <Icon iconName="arrows-v" />);

const SortableItem = SortableElement<any>(({listItem, onClick, onRemoveItem, onRestoreItem}) => {

    let actions = [];

    if(!listItem.isNew && !listItem.toRemove) {
        actions.push(<Icon iconName="trash" clickable onClick={() => onRemoveItem(listItem)} />)
    }

    if(listItem.toRemove) {
        actions.push(<Icon iconName="trash-undo" clickable onClick={() => onRestoreItem(listItem)} />)
    }

    return (
        <List.Item
            className={cx(ListCss.listItem, {
                [ListCss.isNew]: listItem.isNew,
                [ListCss.toRemove]: listItem.toRemove,
            })}
            actions={actions}
        >
            <List.Item.Meta
                avatar={<DragHandle />}
                title={typeof onClick === "function" ? (
                    <Typography.Link>{listItem.name}</Typography.Link>
                ) : <Typography.Text>{listItem.name}</Typography.Text>}
            />
        </List.Item>
    )
});

const SortableList = SortableContainer<any>(({listItems, onClick, onRemoveItem, onRestoreItem}) => (
    <List<IInputListItem>
        size="small"
        dataSource={listItems}
        className={ListCss.list}
        locale={{emptyText}}
        renderItem={(listItem, index) => (
            <SortableItem
                key={listItem.id || listItem.name}
                index={index}
                listItem={listItem}
                onClick={onClick}
                onRemoveItem={onRemoveItem}
                onRestoreItem={onRestoreItem}
            />
        )}
    />
))

function AddNewItem(props: AddNewItemProps) {

    const [itemName, setItemName] = React.useState("");

    const onAdd = (ev?: SyntheticEvent) => {
        if(ev) ev.stopPropagation();

        if(itemName) {
            props.onAdd(itemName);
            setItemName("");
        }

    }

    return (
        <Input
            value={itemName}
            suffix={<Icon iconName="plus-square" clickable onClick={onAdd}/>}
            onChange={ev => setItemName(ev.target.value)}
            placeholder="Enter name of new item ..."
            onKeyPress={ev => ev.key === "Enter" ? onAdd(ev) : null}
        />
    )
}

function InputList(props: InputListProps) {

    const {onInput, value = [], validValues = [], onClick} = props;

    //const [listItems, setListItems] = React.useState(value || []);

    const updateListItems = updatedListItems => {
        //setListItems(updatedListItems);
        onInput(updatedListItems);
    }

    const onSortEnd = ({oldIndex, newIndex}) => {
        updateListItems(arrayMove(value, oldIndex, newIndex))
    }

    const onAddItem = itemName => {
        updateListItems([
            ...value,
            {name: itemName, isNew: true, data: {}}
        ])
    }

    const onRemoveItem = listItemToRemove => {
        updateListItems(value.map(listItem => {
            if(listItem.id === listItemToRemove.id) {
                listItem.toRemove = true;
            }
            return listItem;
        }))
    }

    const onRestoreItem = listItemToRestore => {
        updateListItems(value.map(listItem => {
            if(listItem.id === listItemToRestore.id) {
                listItem.toRemove = false;
            }
            return listItem;
        }))
    }

    return (
        <div className={ListCss.inputListWrapper}>
            {validValues.length === 0 ? (
                <React.Fragment>
                    <AddNewItem onAdd={onAddItem} />
                    <Divider />
                </React.Fragment>
            ) : null}
            <div className={ListCss.inputListBody}>
                <SortableList
                    listItems={value}
                    onSortEnd={onSortEnd}
                    axis="y"
                    lockAxis="y"
                    useDragHandle
                    onClick={onClick}
                    onRemoveItem={onRemoveItem}
                    onRestoreItem={onRestoreItem}
                />
            </div>
        </div>
    )
}

export {
    InputList
}