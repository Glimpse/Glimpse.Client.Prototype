'use strict';

import { IComponentModel } from '../component-models/IComponentModel';

import React = require('react');

export interface IComponentModelComponentProps<S> {
    viewModel: IComponentModel<S>;
}

export class ComponentModelComponent<P extends IComponentModelComponentProps<S>, S> extends React.Component<P, S> {
    private callback: (model: IComponentModel<S>) => void;

    public constructor(props?) {
        super(props);

        const that = this;
        this.callback = model => {
            that.forceUpdate();
        };
    }

    public componentWillMount() {
        this.props.viewModel.onUpdate(this.callback);

        this.setState(this.props.viewModel.createState());
    }

    public componentWillReceiveProps(nextProps: P) {
        this.props.viewModel.removeUpdateListener(this.callback);
        nextProps.viewModel.onUpdate(this.callback);

        this.setState(nextProps.viewModel.createState(this.state));
    }

    public componentWillUnmount() {
        this.props.viewModel.removeUpdateListener(this.callback);
    }
}
