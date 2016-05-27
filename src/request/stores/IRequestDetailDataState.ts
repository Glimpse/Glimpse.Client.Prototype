import { IRequestDetailDataOperationState } from './IRequestDetailDataOperationState';

export interface IRequestDetailDataState {
    filters: { [key: string]: boolean };
    operations: IRequestDetailDataOperationState[];
    selectedIndex: number;
}
