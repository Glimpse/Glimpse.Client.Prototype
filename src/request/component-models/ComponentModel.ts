'use strict';

import { IComponentModel } from './IComponentModel';

export abstract class ComponentModel<S> implements IComponentModel<S> {
    private callbacks: ((model: IComponentModel<S>) => void)[] = [];

    public createState(oldState?: S): S {
        return oldState;
    }

    public abstract init(request);

    public onUpdate(callback: (model: IComponentModel<S>) => void) {
        this.callbacks.push(callback);
    }

    public removeUpdateListener(callback: (model: IComponentModel<S>) => void) {
        const index = this.callbacks.indexOf(callback);

        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    }

    protected emitUpdate() {
        const that = this;

        this.callbacks.forEach(callback => {
            callback(that);
        });
    }
}
