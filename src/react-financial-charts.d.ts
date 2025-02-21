// src/react-financial-charts.d.ts
declare module 'react-financial-charts' {
    import * as React from 'react';
    export const ChartCanvas: React.FC<any>;
    export const Chart: React.FC<any>;
    export const Legend: React.FC<any>;
    // add other exports as needed...
  }
  
  declare module 'react-financial-charts/lib/series' {
    import * as React from 'react';
    export const CandlestickSeries: React.FC<any>;
  }
  
  declare module 'react-financial-charts/lib/axes' {
    import * as React from 'react';
    export const XAxis: React.FC<any>;
    export const YAxis: React.FC<any>;
  }
  
  declare module 'react-financial-charts/lib/coordinates' {
    import * as React from 'react';
    export const CrossHairCursor: React.FC<any>;
    export const MouseCoordinateX: React.FC<any>;
    export const MouseCoordinateY: React.FC<any>;
  }
  
  declare module 'react-financial-charts/lib/tooltip' {
    import * as React from 'react';
    export const OHLCTooltip: React.FC<any>;
  }
  