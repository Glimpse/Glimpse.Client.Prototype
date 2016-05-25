export interface ICommandAfterExecuteMessage {
    commandHadException: boolean;
    commandEndTime: string;
    commandDuration: number;
    commandOffset: number;
}
