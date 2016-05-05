'use strict';

import { IComponentModel } from '../component-models/IComponentModel';

import React = require('react');

export interface IComponentModelComponentProps<S> {
    componentModel: IComponentModel<S>;
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
        this.props.componentModel.onUpdate(this.callback);

        this.setState(this.props.componentModel.createState());
    }

    public componentWillReceiveProps(nextProps: P) {
        this.props.componentModel.removeUpdateListener(this.callback);
        nextProps.componentModel.onUpdate(this.callback);

        this.setState(nextProps.componentModel.createState(this.state));
    }

    public componentWillUnmount() {
        this.props.componentModel.removeUpdateListener(this.callback);
    }
}
