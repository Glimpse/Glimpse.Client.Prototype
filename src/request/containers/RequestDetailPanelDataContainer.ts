import { DataComponent } from '../components/RequestDetailPanelData';
import { connect } from 'react-redux';

function mapStateToProps(state) {
    return {
        messages: state.detail.data.messages
    };
}

function mapDispatchToProps(state) {
    return {
        
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(DataComponent);
