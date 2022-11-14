# Analytics

# Tasks
`npm run build`

# Usage in SSR site:
##### setup package:
`git clone git@gitlab.redweb.dk:aesirx/analytics.git`

##### create `.env` file
```
ENDPOINT_ANALYTICS_URL=https://example.com
```
##### build the tracker file:
```
npm install
npm run build
```
##### copy built file `analytics/build/analytics.js` to your project
##### Add script to `<head>`
`<script async defer src="YOUR_PROJECT_PATH/analytics.js"></script>`

# Usage in ReactJS

`npm install aesirx_analytics git+ssh://git@gitlab.redweb.dk:aesirx/analytics.git#master --save-dev`
##### add environment variable (`.env`)
```
REACT_APP_ENDPOINT_ANALYTICS_URL=https://example.com
```
##### with react-router-dom v5:
###### create AnalyticsContainer component:
```
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsReact } from 'aesirx_analytics';
const AnalyticsContainer = () => {
  const location = useLocation();
  return <AnalyticsReact pathname={location.pathname} />;
};

export default AnalyticsContainer;
```
###### using `<AnalyticsContainer />` inside `<Router>` component 

# Usage in NextJS

`npm install aesirx_analytics git+ssh://git@gitlab.redweb.dk:aesirx/analytics.git#master --save-dev`
##### add environment variable (`.env`)
```
NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL=https://example.com
```
##### with next/router:
###### using in app.js:
```
import { useRouter } from "next/router";
import { AnalyticsNext } from "aesirx_analytics";

<AnalyticsNext router={useRouter()} />
```