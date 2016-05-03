'use strict';

export interface IComponentModel {
    init(request): void;
    onUpdate(callback: (model: IComponentModel) => void);
    removeUpdateListener(callback: (model: IComponentModel) => void);
}
