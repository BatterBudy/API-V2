import appInsights from 'applicationinsights';

appInsights.setup(process.env.AZURE_APP_INSIGHT_CONNECTION_STRING)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .start();

const app_insight_client = appInsights.defaultClient;
export default app_insight_client;