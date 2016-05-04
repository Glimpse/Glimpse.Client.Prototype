'use strict';

export interface IComponentModel<S> {
    createState(oldState?: S): S;
    init(request): void;
    onUpdate(callback: (model: IComponentModel<S>) => void);
    removeUpdateListener(callback: (model: IComponentModel<S>) => void);
}
