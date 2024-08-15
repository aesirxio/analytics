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
  window.aesirxClientSecret="[REPLACE THIS WITH THE PROVIDED CLIENT_SECRET]"
</script>
<script async defer src="YOUR_PROJECT_PATH/analytics.js"></script>
```

1. (`https://example.com` is the link to your 1st party server which must be installed)
2. `CLIENT_ID` replace this with the provided `CLIENT_ID` from https://dapp.shield.aesirx.io/
3. `CLIENT_SECRET` replace this with the provided `CLIENT_SECRET` fromhttps://dapp.shield.aesirx.io/

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
REACT_APP_SSO_CLIENT_SECRET=[REPLACE THIS WITH THE PROVIDED CLIENT_SECRET]

(https://example.com is the link to your 1st party server)
`CLIENT_ID` replace this with the provided `CLIENT_ID` from https://dapp.shield.aesirx.io/
`CLIENT_SECRET` replace this with the provided `CLIENT_SECRET` fromhttps://dapp.shield.aesirx.io/
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
NEXT_PUBLIC_SSO_CLIENT_SECRET=[REPLACE THIS WITH THE PROVIDED CLIENT_SECRET]

(https://example.com is the link to your 1st party server)
`CLIENT_ID` replace this with the provided `CLIENT_ID` from https://dapp.shield.aesirx.io/
`CLIENT_SECRET` replace this with the provided `CLIENT_SECRET` fromhttps://dapp.shield.aesirx.io/
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
window.trackEventAnalytics(endpoint, referer, data)
```

(`endpoint` is the link to your 1st party server which must be installed)

(`referer` is the referer domain)

(`data` is the data you want to track)

(`event_type` should be `conversion` if you want to track event as conversion)

For example:

```
trackEventAnalytics(
  "https://example.com",
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


## Choose template for Consent modal

There is 5 template for Consent modal
1. default (recommend)
   1. Support Advance Consent Mode v2
2. simple-consent-mode
   1. Support Basic Consent Mode v2

#### Usage in SSR site:
```
<script>
  window.consentLayout = "default"
</script>
```

#### In ReactJS:

add this environment variable to `.env`
```
REACT_APP_CONSENT_LAYOUT=default
```

#### In NextJS:

add this environment variable to `.env`
```
NEXT_PUBLIC_CONSENT_LAYOUT=default
```

## Opt-in Consent

#### Usage in SSR site:
```
<script>
   window.optInConsentData = `[
      {
        "title":"payment",
        "content":"<div>YOUR_CONTENT_INPUT_HERE</div>"
      }
    ]`;

    //trigger open optIn consent with Javascript
    document.querySelector('.opt-in-consent.payment').classList.add('show');
</script>
```

(We also provive option `replaceAnalyticsConsent` to replace Analytics Consent with Opt-in Consent)
```
<script>
   window.optInConsentData = `[
      {
        "title":"payment",
        "content":"<div>YOUR_CONTENT_INPUT_HERE</div>",
        "replaceAnalyticsConsent": "true"
      }
    ]`
</script>
```

#### In ReactJS:
```
const OptInConsent = React.lazy(
  () => import('./OptInConsent').then(module => ({ default: module.OptInConsent }))
);
const ConsentComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => {
    setShowModal(true);
  };
   const handleConsent = () => {
    setShowModal(false);
  };
  const handleReject = () => {
    setShowModal(false);
  };
  return (
    <>
      <OptInConsent
        optInConsentData={[
          {
            title: 'payment',
            content: `<div>YOUR_CONTENT_INPUT_HERE</div>`,
            show: showModal,
            handleConsent: handleConsent,
            handleReject: handleReject
          },
        ]}
      />
    </>
  );
};
```
(We also provive option `replaceAnalyticsConsent` to replace Analytics Consent with Opt-in Consent)
To use this in ReactJS please add `isOptInReplaceAnalytics` to our provider first
```
<AnalyticsReact location={location} history={history} isOptInReplaceAnalytics={true}>
  {children}
</AnalyticsReact>
```
```
<OptInConsent
  optInConsentData={[
    {
      title: 'payment',
      content: `<div>YOUR_CONTENT_INPUT_HERE</div>`,
      show: showModal,
      handleConsent: handleConsent,
      handleReject: handleReject,
      replaceAnalyticsConsent: "true"
    },
  ]}
/>
```
#### In NextJS:
```
import dynamic from "next/dynamic";
const OptInConsent = dynamic(
  () => import("aesirx-analytics").then((module) => module.OptInConsent),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

const ConsentComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => {
    setShowModal(true);
  };
  const handleConsent = () => {
    setShowModal(false);
  };
  const handleReject = () => {
    setShowModal(false);
  };
  return (
    <>
      <OptInConsent
        optInConsentData={[
          {
            title: 'payment',
            content: `<div>YOUR_CONTENT_INPUT_HERE</div>`,
            show: showModal,
            handleConsent: handleConsent,
            handleReject: handleReject
          },
        ]}
      />
    </>
  );
};
```
(We also provive option `replaceAnalyticsConsent` to replace Analytics Consent with Opt-in Consent)
To use this in NextJS please add `isOptInReplaceAnalytics` to our provider first
```
<AnalyticsNext router={useRouter()} isOptInReplaceAnalytics={true}>
  <[YOUR-COMPONENT]/>
</AnalyticsNext>
```
```
<OptInConsent
  optInConsentData={[
    {
      title: 'payment',
      content: `<div>YOUR_CONTENT_INPUT_HERE</div>`,
      show: showModal,
      handleConsent: handleConsent,
      handleReject: handleReject,
      replaceAnalyticsConsent: "true"
    },
  ]}
/>
```