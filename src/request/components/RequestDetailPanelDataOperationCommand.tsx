import React = require('react');
import Highlight = require('react-highlight');

interface IRequestDetailPanelDataOperationCommandProps {
    command: string,
    language: string
}

export class RequestDetailPanelDataOperationCommand extends React.Component<IRequestDetailPanelDataOperationCommandProps, {}> {
    public render() {
        return (
            <div>
                <Highlight language={this.props.language}>{this.props.command}</Highlight>
            </div>
        );
    }
}
