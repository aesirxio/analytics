# Analytics
# Setup 1st party server
Please follow instruction: [https://github.com/aesirxio/analytics-1stparty](https://github.com/aesirxio/analytics-1stparty)
# Tasks
`npm run build`


# Usage in SSR site:
##### download analytics.js:
`https://github.com/aesirxio/analytics/releases/latest`

##### copy `analytics.js` to your project
##### Add script to `<head>`
```
<script>window.aesirx1stparty = "https://example.com"</script>
<script async defer src="YOUR_PROJECT_PATH/analytics.js"></script>
```
`(https://example.com is the link to your 1st party server)`
# Usage in ReactJS

`npm install aesirxio/analytics --save-dev`
##### add environment variable (`.env`)
```
REACT_APP_ENDPOINT_ANALYTICS_URL=https://example.com

(https://example.com is the link to your 1st party server)
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

`npm install aesirxio/analytics --save-dev`
##### add environment variable (`.env`)
```
NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL=https://example.com

(https://example.com is the link to your 1st party server)
```
##### with next/router:
###### using in app.js:
```
import { useRouter } from "next/router";
import { AnalyticsNext } from "aesirx_analytics";

<AnalyticsNext router={useRouter()} />
```