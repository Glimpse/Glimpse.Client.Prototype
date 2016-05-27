import { IFilterButtonProps, FilterButton } from './FilterButton';

import * as React from 'react';

export interface IFilterBarProps {
    filters: IFilterButtonProps[];
}

export interface IFilterBarCallbacks {
    onToggle: (name: string) => void;
}

interface IFilterBarCombinedProps extends IFilterBarProps, IFilterBarCallbacks {
}

export class FilterBar extends React.Component<IFilterBarCombinedProps, {}> {
    public render() {
        return (
            <div className='filter-bar'>
            {
                this.props.filters.map((filter) => this.renderFilter(filter))
            }
            </div>
        );
    }    
    
    private renderFilter(filter: IFilterButtonProps) {
        return (
            <FilterButton count={filter.count} isShown={filter.isShown} name={filter.name} onToggle={() => this.props.onToggle(filter.name)} />
        );
    }
}
