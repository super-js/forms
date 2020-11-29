import * as React from "react";
import arrayMove from 'array-move';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import { List, Input, Typography, Divider} from 'antd';

import { Icon } from "@super-js/components/src/icon";
import {InputComponentProps} from "../index";
import ListCss from './List.css'


export interface InputListProps extends InputComponentProps {
}

export interface AddNewItemProps {
    onAdd: Function;
}

export interface IInputListItem {
    label: string;
    value: string;
    isNew?: boolean;
    isDelete?: boolean;
    data: any;
}

const normalizeValueForInputList = (value): IInputListItem[] => {
    if(!Array.isArray(value)) return [];

    return value
        .filter(val => !!val)
        .map(val => {

            let normalizedValue = {
                label: "", value: "", data: {}
            };

            if(typeof val !== "object") {
                normalizedValue.value = val;
                normalizedValue.label = val;
            } else {

                const {label, value, data, ...rest} = val;

                normalizedValue.label = label || value || "";
                normalizedValue.value = value || label || "";
                normalizedValue.data  = data || rest;
            }

            return normalizedValue;
        })
}

const emptyText = (
    <Typography.Text disabled>
        <Icon iconName="info-circle"/>
        No items, Please use the field above to add items
    </Typography.Text>
);

const DragHandle = SortableHandle(() => <Icon iconName="arrows-v" />);

const SortableItem = SortableElement(({listItem}) => (
    <List.Item className={ListCss.listItem}>
        <List.Item.Meta
            avatar={<DragHandle />}
            title={listItem.label}
        />
    </List.Item>
));

const SortableList = SortableContainer(({listItems}) => (
    <List<IInputListItem>
        size="small"
        dataSource={listItems}
        className={ListCss.list}
        locale={{emptyText}}
        renderItem={(listItem, index) => (
            <SortableItem key={listItem.value} index={index} listItem={listItem} />
        )}
    />
))

function AddNewItem(props: AddNewItemProps) {

    const [itemName, setItemName] = React.useState("");

    const onAdd = () => {
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
            onKeyPress={ev => ev.key === "Enter" ? onAdd() : null}
        />
    )
}

function InputList(props: InputListProps) {

    const {onInput, value = [], validValues = []} = props;

    const [listItems, setListItems] = React.useState(normalizeValueForInputList(value));

    const updateListItems = updatedListItems => {
        setListItems(updatedListItems);
        onInput(updatedListItems);
    }

    const onSortEnd = ({oldIndex, newIndex}) => {
        updateListItems(arrayMove(listItems, oldIndex, newIndex))
    }

    const onAddItem = itemName => {
        updateListItems([
            ...listItems,
            {label: itemName, value: itemName, isNew: true, data: {}}
        ])
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
                    listItems={listItems}
                    onSortEnd={onSortEnd}
                    axis="y"
                    lockAxis="y"
                    useDragHandle
                />
            </div>
        </div>
    )
}

export {
    InputList
}