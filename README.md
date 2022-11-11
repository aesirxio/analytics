# Analytics

# Tasks

### To build the tracker file:

`npm run build`

# Usage in ReactJS

`npm install aesirx_analytics git+ssh://git@gitlab.redweb.dk:aesirx/analytics.git#master --save-dev`

### with react-router-dom v5:
#### create AnalyticsContainer component:
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
#### using `<AnalyticsContainer />` inside `<Router>` component 

# Usage in NextJS

`npm install aesirx_analytics git+ssh://git@gitlab.redweb.dk:aesirx/analytics.git#master --save-dev`

### with next/router:
#### using in app.js:
```
import { useRouter } from "next/router";
import { AnalyticsNext } from "aesirx_analytics";

<AnalyticsNext router={useRouter()} />
```