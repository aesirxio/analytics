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
<script>
  window.aesirx1stparty = "https://example.com"
  window.aesirxClientID="[REPLACE THIS WITH THE PROVIDED CLIENT_ID]"
</script>
<script async defer src="YOUR_PROJECT_PATH/analytics.js"></script>
```

1. (`https://example.com` is the link to your 1st party server which must be installed)
2. `CLIENT_ID` replace this with the provided `CLIENT_ID` from https://sso.aesirx.io/
3. `CLIENT_SECRET` replace this with the provided `CLIENT_SECRET` from https://sso.aesirx.io/

##### Disable Consent Popup:
```
<script>
  window.disableAnalyticsConsent = "true"
</script>
```

#### Usage in ReactJS

`npm i aesirx-analytics`

##### Add the environment variable file (`.env`)

```
REACT_APP_ENDPOINT_ANALYTICS_URL=https://example.com
REACT_APP_SSO_CLIENT_ID=[REPLACE THIS WITH THE PROVIDED CLIENT_ID]

(https://example.com is the link to your 1st party server)
`CLIENT_ID` replace this with the provided `CLIENT_ID` from https://sso.aesirx.io/
```

##### Disable Consent Popup:
add this environment variable to `.env`
```
REACT_APP_DISABLE_ANALYTICS_CONSENT=true
```

###### With react-router-dom v5:

Create AnalyticsContainer component:

```
import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { AnalyticsReact } from 'aesirx-analytics';
const AnalyticsContainer = ({children}) => {
  const location = useLocation();
  let history = useHistory();
  return <AnalyticsReact location={location} history={history}>{children}</AnalyticsReact>;
};

export default AnalyticsContainer;
```

###### Wrap your component in `<AnalyticsContainer><[YOUR-COMPONENT]/></AnalyticsContainer>`

###### `<AnalyticsContainer>` need to using inside `<Router>` component

#### Usage in NextJS

`npm i aesirx-analytics`

##### Add the environment variable file (`.env`)

```
NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL=https://example.com
NEXT_PUBLIC_SSO_CLIENT_ID=[REPLACE THIS WITH THE PROVIDED CLIENT_ID]

(https://example.com is the link to your 1st party server)
`CLIENT_ID` replace this with the provided `CLIENT_ID` from https://sso.aesirx.io/
```

##### Disable Consent Popup:
add this environment variable to `.env`
```
NEXT_PUBLIC_DISABLE_ANALYTICS_CONSENT=true
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

## Track events:

#### In SSR Site:

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
window.trackEvent(endpoint, referer, data)
```

(`endpoint` is the link to your 1st party server which must be installed)

(`referer` is the referer domain)

(`data` is the data you want to track)

For example:

```
trackEvent(
  "https://example.com",
  visitor_uuid,
  "https://aesirx.io",
  {
    event_name: "<event_name>",
    event_type: "<event_type>",
    attributes: [
      {
        name: "<name-1>",
        value: "<value-1>"
      },
      {
        name: "<name-2>",
        value: "<value-2>"
      },
    ],
  }
);
```

#### In ReactJS:

```
import { trackEvent, AnalyticsContext } from "aesirx-analytics";
const CustomEvent = () => {
  const AnalyticsStore = useContext(AnalyticsContext);
  const initTrackEvent = async () => {
    await trackEvent(endPoint, AnalyticsStore.visitor_uuid, referer, {
      event_name: "Submit",
      event_type: "submit",
      attributes: [
        {
          name: "<name-1>",
          value: "<value-1>"
        },
        {
          name: "<name-2>",
          value: "<value-2>"
        },
      ],
    });
  };
  return (
    <button onClick={() => {initTrackEvent();}}> Search </button>
  );
}
```

#### In NextJS:

```
import { trackEvent, AnalyticsContext } from "aesirx-analytics";
const CustomEvent = () => {
  const AnalyticsStore = useContext(AnalyticsContext);
  const initTrackEvent = async () => {
    await trackEvent(endPoint, AnalyticsStore.visitor_uuid, referer, {
      event_name: "Submit",
      event_type: "submit",
      attributes: [
        {
          name: "<name-1>",
          value: "<value-1>"
        },
        {
          name: "<name-2>",
          value: "<value-2>"
        },
      ],
    });
  };
  return (
    <button onClick={() => {initTrackEvent();}}> Search </button>
  );
}
```

(`endPoint` is the link to your 1st party server which must be installed)

(`referer` is the referer domain)

## Customize CSS for Consent modal
Please follow below CSS example:
```
  // Customize toast
  .aesirxconsent .toast {
    --aesirxconsent-toast-font-size: 16px;
    --aesirxconsent-toast-padding-x: 0.75rem;
    --aesirxconsent-toast-padding-y: 0.5rem;
    --aesirxconsent-toast-spacing: 1.5rem;
    --aesirxconsent-toast-zindex: 1049;
  }
  // Customize button
  .aesirxconsent .btn {
    --aesirxconsent-btn-font-size: 16px;
    --aesirxconsent-btn-padding-x: 0.75rem;
    --aesirxconsent-btn-padding-y: 0.375rem;
    --aesirxconsent-btn-font-weight: 400;
    --aesirxconsent-btn-line-height: 1.5;
  }
  // Customize button success
  .aesirxconsent .btn-success {
    --aesirxconsent-btn-color: #000;
    --aesirxconsent-btn-bg: #1ab394;
    --aesirxconsent-btn-border-color: #1ab394;
    --aesirxconsent-btn-hover-color: #000;
    --aesirxconsent-btn-hover-bg: #3cbea4;
    --aesirxconsent-btn-hover-border-color: #31bb9f;
    --aesirxconsent-btn-focus-shadow-rgb: 22, 152, 126;
    --aesirxconsent-btn-active-color: #000;
    --aesirxconsent-btn-active-bg: #48c2a9;
    --aesirxconsent-btn-active-border-color: #31bb9f;
    --aesirxconsent-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --aesirxconsent-btn-disabled-color: #000;
    --aesirxconsent-btn-disabled-bg: #1ab394;
    --aesirxconsent-btn-disabled-border-color: #1ab394;
  }
  // To customize CSS for dark mode (Bootstrap dark mode)
  [data-bs-theme=dark] .aesirxconsent {
    color: #fff;
  }
```