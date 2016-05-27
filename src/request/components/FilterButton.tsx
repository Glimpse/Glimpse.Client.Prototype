import * as React from 'react';

const classNames = require('classnames');

export interface IFilterButtonProps {
    count: number;
    isShown: boolean;
    name: string;
}

export interface IFilterButtonCallbacks {
    onToggle: () => void;
}

interface IFilterButtonCombinedProps extends IFilterButtonProps, IFilterButtonCallbacks{
}

export class FilterButton extends React.Component<IFilterButtonCombinedProps, {}> {
    public render() {
        return (
            <button className={classNames('filter-button', { shown: this.props.isShown })} type='button' onClick={e => this.props.onToggle()}>{this.props.name} ({this.props.count})</button>
        );
    }
}
