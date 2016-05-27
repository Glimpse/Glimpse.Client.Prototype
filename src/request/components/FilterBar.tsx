import { IFilterButtonProps, FilterButton } from './FilterButton';

import * as React from 'react';

export interface IFilterBarProps {
    filters: IFilterButtonProps[];
}

export interface IFilterBarCallbacks {
    onToggle: (index: number) => void;
}

interface IFilterBarCombinedProps extends IFilterBarProps, IFilterBarCallbacks {
}

export class FilterBar extends React.Component<IFilterBarCombinedProps, {}> {
    public render() {
        return (
            <div className='filter-bar'>
            {
                this.props.filters.map((filter, index) => this.renderFilter(filter, index))
            }
            </div>
        );
    }    
    
    private renderFilter(filter: IFilterButtonProps, index: number) {
        return (
            <FilterButton count={filter.count} isShown={filter.isShown} name={filter.name} onToggle={() => this.props.onToggle(index)} />
        );
    }
}
