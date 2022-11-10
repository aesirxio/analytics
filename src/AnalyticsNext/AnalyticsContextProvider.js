/*
 * @copyright   Copyright (C) 2022 AesirX. All rights reserved.
 * @license     GNU General Public License version 3, see LICENSE.
 */

import React from 'react';
export const AnalyticsContext = React.createContext();

export class AnalyticsContextProvider extends React.Component {
  render() {
    return (
      <AnalyticsContext.Provider value={{ ...this.props.value }}>
        {this.props.children}
      </AnalyticsContext.Provider>
    );
  }
}
