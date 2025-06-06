import React, { useMemo } from 'react';
import { locations } from '@contentful/app-sdk';
import Field from './locations/Field';
import { useSDK } from '@contentful/react-apps-toolkit';
import ConfigScreen from './locations/ConfigScreen';
import Page from './locations/Page';

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_ENTRY_FIELD]: Field,
  [locations.LOCATION_PAGE]: Page,
};

const App = () => {
  const sdk = useSDK();

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(ComponentLocationSettings)) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;
