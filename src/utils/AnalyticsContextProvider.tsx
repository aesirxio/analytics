/*
 * @copyright   Copyright (C) 2022 AesirX. All rights reserved.
 * @license     GNU General Public License version 3, see LICENSE.
 */

import React, { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import { appLanguages } from '../translations';
import { AesirXI18nextProvider } from './I18nextProvider';

interface Props {
  children?: ReactNode;
}

interface AnalyticsContextType {
  event_uuid: string;
  visitor_uuid: string;
  setEventID: Dispatch<SetStateAction<string>>;
  setUUID: Dispatch<SetStateAction<string>>;
  ref: any;
}

export const AnalyticsContext = React.createContext<AnalyticsContextType>({
  event_uuid: undefined,
  visitor_uuid: undefined,
  setEventID: undefined,
  setUUID: undefined,
  ref: undefined,
});

const AnalyticsContextProvider: React.FC<Props> = ({ children }) => {
  const [eventID, setEventID] = useState();
  const [UUID, setUUID] = useState();
  const ref = useRef();

  useEffect(() => {
    const uuid: any = sessionStorage.getItem('aesirx-analytics-uuid');
    uuid && setUUID(uuid);
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        event_uuid: eventID,
        visitor_uuid: UUID,
        setEventID: setEventID,
        setUUID: setUUID,
        ref: ref,
      }}
    >
      <AesirXI18nextProvider appLanguages={appLanguages}>{children}</AesirXI18nextProvider>
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContextProvider;
