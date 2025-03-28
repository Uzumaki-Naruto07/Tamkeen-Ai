import React from 'react';
import { useTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

// Create rtl cache
const createRTLCache = () => {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [rtlPlugin],
  });
};

const rtlCache = createRTLCache();

export const RTL = (props) => {
  const theme = useTheme();
  const { children, direction } = props;

  if (direction === 'rtl') {
    return <CacheProvider value={rtlCache}>{children}</CacheProvider>;
  }

  return <>{children}</>;
};