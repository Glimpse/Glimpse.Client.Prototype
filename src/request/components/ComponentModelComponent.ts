'use strict';

import { IComponentModel } from '../component-models/IComponentModel';

import React = require('react');

export interface IGlimpseComponentProps {
    viewModel: IComponentModel;
}

export class ComponentModelComponent<P extends IGlimpseComponentProps, S> extends React.Component<P, S> {
    private callback: (model: IComponentModel) => void;

    public constructor(props?) {
        super(props);

        const that = this;
        this.callback = model => {
            that.forceUpdate();
        };
    }

    public componentWillMount() {
        this.props.viewModel.onUpdate(this.callback);
    }

    public componentWillReceiveProps(nextProps: P) {
        this.props.viewModel.removeUpdateListener(this.callback);
        nextProps.viewModel.onUpdate(this.callback);
    }

    public componentWillUnmount() {
        this.props.viewModel.removeUpdateListener(this.callback);
    }
}
