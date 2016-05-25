export interface ICommandBeforeExecuteMessage {
    commandMethod: string;
    commandIsAsync: boolean;
    commandText: string;
    commandType: string;
}
