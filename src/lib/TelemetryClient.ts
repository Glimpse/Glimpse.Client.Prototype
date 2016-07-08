
'use strict';

/* tslint:disable:no-var-requires */
const appInsights = require('applicationinsights-js').AppInsights;
const glimpse = require('glimpse');
const metadataRepository = require('../shell/repository/metadata-repository');
const request = require('superagent');
/* tslint:enable:no-var-requires */

import moment = require('moment');
import uuid = require('node-uuid');

/**
 * Copied from Glimpse.Node.Prototype src/glimpse.server/resources/TelemetryConfigResource.ts.
 *
 * Shape of telemetry config resource retrieved from the server.
 */
export interface ITelemetryConfig {
    enabled: boolean;
    uri: string;
    instrumentationKey: string;
    clientIP: string;
    serverMachineId: string;
    serverAppName: string;
    serverOSPlatform: string;
    serverOSRelease: string;
    serverOSType: string;
}

/**
 * Map from string -> string. Used to pass name/value pairs through app insights events.
 */
interface IProperties {
    [key: string]: string;
}

/**
 * Map from string -> number.  Used to pass measurements through app insights events
 */
interface IMeasurements {
    [key: string]: number;
}

/**
 * Common properties shared by all events passed to app insights
 */
interface ICommonProperties extends IProperties {
    sessionId: string;
    serverMachineId: string;
}

/**
 * properties sent on ShellReady event. 
 */
interface IShellReadyProperties extends ICommonProperties {
    sessionId: string;
    serverMachineId: string;
    serverAppName: string;
    serverOSPlatform: string;
    serverOSRelease: string;
    serverOSType: string;
    clientIP: string;
}

/**
 *  Properties sent on RequestDetailSelected. 
 */
interface IRequestDetailSelectedProperties extends ICommonProperties {
    sessionId: string;
    serverMachineId: string;
    currentRequestId: string;
    lastRequestId: string;
    currentTab: string;
}

/**
 * Measurements sent on RequestDetailSelected event.
 */
interface IRequestDetailSelectedMeasurements extends IMeasurements {
    lastRequestViewTimeMillis: number;
    lastTabViewTimeMillis: number;
}

/**
 * Properties sent on RequestDetailClosed event.
 */
interface IRequestDetailClosedProperties extends ICommonProperties {
    sessionId: string;
    serverMachineId: string;
    requestId: string;
    tabName: string;
}

/**
 * Measurements sent on RequestDetailClosed event.
 */
interface IRequestDetailClosedMeasurements extends IMeasurements {
    lastRequestViewTimeMillis: number;
    lastTabViewTimeMillis: number;
}

/**
 * Properties sent on RequestDetailTabChanged event.
 */
interface IRequestDetailTabChangedProperties extends ICommonProperties {
    sessionId: string;
    serverMachineId: string;
    currentRequestId: string;
    lastTabName: string;
    tabName: string;
}

/**
 * Measurements sent on RequestDetailTabChanged
 */
interface IRequestDetailTabChangedMeasurements extends IMeasurements {
    lastTabViewMillis: number;
}

/**
 * Shape of object defining 
 */
interface ITelemetryEvent {
    name: string;
    properties: ICommonProperties; // map string->string
    measurements: IMeasurements; // map string->number
}

/**
 * Class responsible for sending telemetry events.  It will register to be notified on various shell events
 * and send telemetry events through app insights when those events occur. 
 */
class TelemetryClient {

    private static shellReady = 'ShellReady';
    private static requestDetailSelected = 'RequestDetailSelected';
    private static requestDetailClosed = 'RequestDetailClosed';
    private static requestDetailTabChanged = 'RequestDetailTabChanged';
    private static defaultTab = 'tab.execution';

    // telemetry configuration details retrieved from the glimpse server.  This is populated asynchronously, so there's logic to 
    // account for events sent before & after telemetryConfig is available.
    private telemetryConfig: ITelemetryConfig;

    // telemetry enabled defaults to true, value will be reset when we receive the telemetryConfig.
    private isTelemetryEnabled = true;
    private sessionId: string;
    private currentRequestId: string = '';
    private lastRequestChangeTime: moment.Moment;
    private currentTab: string = '';
    private lastTabChangeTime: moment.Moment;

    // we'll queue telemetry events until the telemetry config is downloaded and app insights is configured.  
    private eventQueue: ITelemetryEvent[] = [];

    constructor() {
        this.sessionId = uuid.v4();
        const self = this;
        metadataRepository.registerListener((metadata) => {

            if (!metadata.resources || !metadata.resources['telemetry-config']) {
                self.isTelemetryEnabled = false;
            }
            else {
                const uri = metadata.resources['telemetry-config'];
                // look up telemetry config
                request
                    .get(uri.template)
                    .accept('application/json')
                    .end(function (err, res) {
                        if (err) {
                            console.error('Glimpse telemetry config could not be obtained.');
                        }
                        else {
                            self.telemetryConfig = res.body;
                            self.configure(self.telemetryConfig);
                        }
                    });
            }
        });
    }

    /**
     * configure telemetry client
     */
    private configure(telemetryConfig) {
        this.isTelemetryEnabled = (telemetryConfig && telemetryConfig.enabled) ? telemetryConfig.enabled : false;
        if (!this.isTelemetryEnabled) {
            // shouldn't need this any longer
            this.eventQueue = undefined;
        }
        else {

            /* Call downloadAndSetup to download full ApplicationInsights script from CDN and initialize it with instrumentation key */
            appInsights.downloadAndSetup({
                instrumentationKey: telemetryConfig.instrumentationKey,
                endpointUrl: telemetryConfig.uri,
                emitLineDelimitedJson: true
            });

            // Add telemetry initializer to enable user tracking
            // TODO:  verify this works 
            appInsights.queue.push(function () {
                appInsights.context.addTelemetryInitializer(function (envelope) {
                    if (window.navigator && window.navigator.userAgent) {
                        envelope.tags['ai.user.userAgent'] = window.navigator.userAgent;
                    }
                });
            });

            // now that we have the telemetry config, send any queued events
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();

                // back-fill any property data available from the telemetryConfig 
                if (event.name === TelemetryClient.shellReady) {
                    this.getShellReadyProperties(<IShellReadyProperties>event.properties);
                }
                else if (!event.properties.serverMachineId) {
                    this.tryAddServerMachineId(event.properties);
                }

                // send event through app insights API      
                appInsights.trackEvent(event.name, event.properties, event.measurements);
            }
        }
    }

    /**
     * Attempt to add the server ID property.  This comes from the telemetryConfig,
     * which is initialized asynchronously, so if the telemetry config is not
     * available, they won't be added.
     */
    private tryAddServerMachineId(props: ICommonProperties) {
        if (this.telemetryConfig) {
            props.serverMachineId = this.telemetryConfig.serverMachineId;
        }
    }

    /**
     * send an event (if app insights is currently configured), or queue it for sending later when app insights is configured.
     */
    private queueOrSendEvent(name: string, properties: ICommonProperties, measurements: IMeasurements) {
        if (this.isTelemetryEnabled) {
            if (!this.telemetryConfig) {
                this.eventQueue.push({ name, properties, measurements });
            }
            else {
                appInsights.trackEvent(name, properties, measurements);
            }
        }
    }

    /**
     * update lastRequestChangeTime & return delta (in milliseconds) between current time & previous time
     */
    private markLastRequestViewMillis(): number {
        const nextEventTime = moment();
        let elapsed = 0;
        if (this.lastRequestChangeTime) {
            elapsed = nextEventTime.diff(this.lastRequestChangeTime);
        }
        this.lastRequestChangeTime = nextEventTime;
        return elapsed;
    }

    /**
     * update lastTabChangeTime & return delta (in milliseconds) between current time & previous time
     */
    private markLastTabViewMillis(): number {
        const nextEventTime = moment();
        let elapsed = 0;
        if (this.lastTabChangeTime) {
            elapsed = nextEventTime.diff(this.lastTabChangeTime);
        }
        this.lastTabChangeTime = nextEventTime;
        return elapsed;
    }

    /**
     * Retrieve shell-ready properties (if telemetry config is available).  If a set of props is passed in,
     * then the specified props will be updated.  Otherwise, a new instance will returned. 
     */
    private getShellReadyProperties(props?: IShellReadyProperties): IShellReadyProperties {
        props = props || <IShellReadyProperties>{};
        props.sessionId = this.sessionId;

        if (this.telemetryConfig) {
            props.serverMachineId = this.telemetryConfig.serverMachineId;
            props.serverAppName = this.telemetryConfig.serverAppName;
            props.serverOSPlatform = this.telemetryConfig.serverOSPlatform;
            props.serverOSRelease = this.telemetryConfig.serverOSRelease;
            props.serverOSType = this.telemetryConfig.serverOSType;
        }
        else {
            props.serverMachineId = undefined;
            props.serverAppName = undefined;
            props.serverOSPlatform = undefined;
            props.serverOSRelease = undefined;
            props.serverOSType = undefined;
        }
        return props;
    }

    /**
     * retrieve the RequestDetailSelected properties.
     */
    private getRequestDetailSelectedProperties(currentRequestId, lastRequestId, currentTab): IRequestDetailSelectedProperties {
        const props: IRequestDetailSelectedProperties = {
            sessionId: this.sessionId,
            serverMachineId: undefined,
            currentRequestId,
            lastRequestId,
            currentTab
        };
        this.tryAddServerMachineId(props);
        return props;
    }

    /**
     * retrieve the RequestDetailSelected measurements.
     */
    private getRequestDetailSelectedMeasurements(lastRequestViewTimeMillis: number, lastTabViewTimeMillis: number): IRequestDetailSelectedMeasurements {
        const props: IRequestDetailSelectedMeasurements = {
            lastRequestViewTimeMillis,
            lastTabViewTimeMillis
        };
        return props;
    }

    /**
     * Retrieve RequestDetailClosed properties.
     */
    private getRequestDetailClosedProperties(): IRequestDetailClosedProperties {
        const props: IRequestDetailClosedProperties = {
            sessionId: this.sessionId,
            serverMachineId: undefined,
            requestId: this.currentRequestId,
            tabName: this.currentTab
        };
        this.tryAddServerMachineId(props);
        return props;
    }

    /**
     * Retrieve RequestDetailClosed measurements.
     */
    public getRequestDetailClosedMeasurements(lastRequestViewTimeMillis, lastTabViewTimeMillis): IRequestDetailClosedMeasurements {
        const props: IRequestDetailClosedMeasurements = {
            lastRequestViewTimeMillis,
            lastTabViewTimeMillis
        };
        return props;
    }

    /**
     * Retrieve RequestDetailTabChanged properties.
     */
    public getRequestDetailTabChangedProperties(tabName, lastTabName): IRequestDetailTabChangedProperties {
        const props: IRequestDetailTabChangedProperties = {
            sessionId: this.sessionId,
            serverMachineId: undefined,
            currentRequestId: this.currentRequestId,
            lastTabName,
            tabName
        };
        this.tryAddServerMachineId(props);
        return props;
    }

    /**
     * Retrieve RequestDetailTabChanged measurements.
     */
    public getRequestDetailTabChangedMeasurements(lastTabViewMillis: number): IRequestDetailTabChangedMeasurements {
        const props: IRequestDetailTabChangedMeasurements = {
            lastTabViewMillis
        };
        return props;
    }

    /**
     * register handlers for shell events.  Listeners will track state of user interactions & send telemetry events.
     */
    public registerListeners() {

        glimpse.on('shell.ready', () => {
            // telemetry sent when client UI is first opened
            const properties = this.getShellReadyProperties();
            const measurements: IMeasurements = {};
            this.queueOrSendEvent(TelemetryClient.shellReady, properties, measurements);
        });

        glimpse.on('shell.request.summary.selected', (payload) => {
            // telemetry sent when a request detail is selected
            if (!this.currentTab) {
                this.currentTab = TelemetryClient.defaultTab;
            }
            const properties = this.getRequestDetailSelectedProperties(payload.requestId, this.currentRequestId, this.currentTab);
            const measurements = this.getRequestDetailSelectedMeasurements(this.markLastRequestViewMillis(), this.markLastTabViewMillis());
            this.currentRequestId = payload.requestId;
            this.queueOrSendEvent(TelemetryClient.requestDetailSelected, properties, measurements);
        });

        glimpse.on('shell.request.detail.closed', () => {
            // telemetry sent when a request detail is closed
            const properties = this.getRequestDetailClosedProperties();
            const measurements = this.getRequestDetailClosedMeasurements(this.markLastRequestViewMillis(), this.markLastTabViewMillis());
            this.queueOrSendEvent(TelemetryClient.requestDetailClosed, properties, measurements);
            this.lastRequestChangeTime = undefined;
            this.lastTabChangeTime = undefined;
            this.currentRequestId = undefined;
            this.currentTab = undefined;
        });

        glimpse.on('shell.request.detail.focus.changed', (payload) => {
            // telemetry sent when a tab changes in a request detail page
            const properties = this.getRequestDetailTabChangedProperties(payload.tab, this.currentTab);
            const measurements = this.getRequestDetailTabChangedMeasurements(this.markLastTabViewMillis());
            this.queueOrSendEvent(TelemetryClient.requestDetailTabChanged, properties, measurements);
            this.currentTab = payload.tab;
        });
    }
}

let telemetryClient = new TelemetryClient();
export default telemetryClient;
