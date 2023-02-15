# AesirX Analytics JS Collector

A powerful and compliant web Analytics platform (1st-party alternative to Google Analytics) that only collects 1st-party data to deliver meaningful customer insights for your organization. 

AesirX Analytics comes with a locally hosted JavaScript solution that gathers and stores data legally and compliantly in accordance with GDPR and other regional legislation including storage of citizens’ data in-country and 1st-party.

## Setup instructions

### Setup the 1st party server

Follow the instructions in: [https://github.com/aesirxio/analytics-1stparty](https://github.com/aesirxio/analytics-1stparty)

### Setup the JS Collector

#### Usage in SSR site:

1. Download analytics.js from [https://github.com/aesirxio/analytics/releases/latest](https://github.com/aesirxio/analytics/releases/latest)
1. copy `analytics.js` to your project
1. Add script to `<head>`:

```
<script>window.aesirx1stparty = "https://example.com"</script>
<script async defer src="YOUR_PROJECT_PATH/analytics.js"></script>
```

(`https://example.com` is the link to your 1st party server which must be installed)
##### Track events:
To track events, simply add special data-attribute to the element you want to track.
For example, you might have a button with the following code:
```
<button class="button" 
    data-aesirx-event-name="sign up"
    data-aesirx-event-type="login"
    data-aesirx-event-attribute-a="value-a"
    data-aesirx-event-attribute-b="value-b"
>
  Sign Up
</button>
```
Add data-attribute with the following format:
```
data-aesirx-event-name="<event-name>"
data-aesirx-event-type="<event-type>"
data-aesirx-event-attribute-<attribute-name-1>="<attribute-value-1>"
data-aesirx-event-attribute-<attribute-name-2>="<attribute-value-1>"
```
##### Or you can use your own Javascript to Track events:
```
window.trackEvent(endpoint, event_uuid, visitor_uuid, referrer, data)
```
(`endpoint` is the link to your 1st party server which must be installed)

(`event_uuid` is the params get from url - it will auto generated)

(`visitor_uuid` is the params get from url - it will auto generated)

(`referrer` is the referrer domain)

(`data` is the data you want to track)

For example: 
```
trackEvent(
  "https://example.com",
  event_uuid, 
  visitor_uuid, 
  "https://aesirx.io",
  {
    event_name: element.dataset.aesirxEventName,
    event_type: element.dataset.aesirxEventType,
    attributes: attribute,
  }
);
```

#### Usage in ReactJS

`npm i aesirx-analytics`

##### Add the environment variable file (`.env`)

```
REACT_APP_ENDPOINT_ANALYTICS_URL=https://example.com

(https://example.com is the link to your 1st party server)
```

###### With react-router-dom v5:

Create AnalyticsContainer component:

```
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsReact } from 'aesirx-analytics';
const AnalyticsContainer = ({children}) => {
  const location = useLocation();
  return <AnalyticsReact pathname={location.pathname}>{children}</AnalyticsReact>;
};

export default AnalyticsContainer;
```

###### Wrap your component in `<AnalyticsContainer><[YOUR-COMPONENT]/></AnalyticsContainer>`
###### `<AnalyticsContainer>` need to using inside `<Router>` component 

##### Track events:

```
import { trackEvent, AnalyticsContext } from "aesirx-analytics";
const CustomEvent = () => {
  const AnalyticsStore = useContext(AnalyticsContext);
  const initTrackEvent = async () => {
    await trackEvent(endPoint, AnalyticsStore.event_uuid, AnalyticsStore.visitor_uuid, referrer, {
      event_name: "Submit",
      event_type: "submit",
      attributes: attributes,
    });
  };
  return (
    <button onClick={() => {initTrackEvent();}}> Search </button>
  );
})
```

(`endPoint` is the link to your 1st party server which must be installed)

(`referrer` is the referrer domain)

#### Usage in NextJS

`npm i aesirx-analytics`

##### Add the environment variable file (`.env`)

```
NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL=https://example.com

(https://example.com is the link to your 1st party server)
```

###### With next/router:

Added in app.js:

```
import { useRouter } from "next/router";
import { AnalyticsNext } from "aesirx-analytics";

<AnalyticsNext router={useRouter()}>
  <[YOUR-COMPONENT]/>
</AnalyticsNext>
```

##### Track events:

```
import { trackEvent, AnalyticsContext } from "aesirx-analytics";
const CustomEvent = () => {
  const AnalyticsStore = useContext(AnalyticsContext);
  const initTrackEvent = async () => {
    await trackEvent(endPoint, AnalyticsStore.event_uuid, AnalyticsStore.visitor_uuid, referrer, {
      event_name: "Submit",
      event_type: "submit",
      attributes: attributes,
    });
  };
  return (
    <button onClick={() => {initTrackEvent();}}> Search </button>
  );
})
```

(`endPoint` is the link to your 1st party server which must be installed)

(`referrer` is the referrer domain)