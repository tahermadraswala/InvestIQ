import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ChartCanvas, Chart } from 'react-financial-charts';
import { CandlestickSeries } from 'react-financial-charts/lib/series';
import { XAxis, YAxis } from 'react-financial-charts/lib/axes';
import { CrossHairCursor, MouseCoordinateX, MouseCoordinateY } from 'react-financial-charts/lib/coordinates';
import { OHLCTooltip } from 'react-financial-charts/lib/tooltip';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { scaleTime } from 'd3-scale';

// Data type definitions
interface DataItem {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  sma_50?: number | null;
  sma_200?: number | null;
  date?: Date;
}

interface MarketInfo {
  current_price: number;
  daily_change: number;
  daily_change_percent: number;
}

interface NiftyData {
  chart_data: DataItem[];
  market_info: MarketInfo;
}

interface NiftyLiveCandlestickChartProps {
  width: number;
  ratio: number;
}

const NiftyLiveCandlestickChart: React.FC<NiftyLiveCandlestickChartProps> = ({ width, ratio }) => {
  const [chartData, setChartData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the Flask backend
  useEffect(() => {
    const fetchNiftyData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/nifty-data');
        const data: NiftyData = await response.json();
        if (data.chart_data) {
          setChartData(data.chart_data);
          setError(null);
        } else {
          setError('No chart data available');
        }
      } catch (err) {
        console.error('Failed to fetch Nifty data:', err);
        setError('Unable to fetch live chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchNiftyData();
    const intervalId = setInterval(fetchNiftyData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <div className="animate-spin">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
          </svg>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-red-500">
        {error}
      </Card>
    );
  }

  // Convert each record's time (HH:MM) to a Date object using today's date
  const today = new Date();
  const processedData = chartData.map(item => {
    const [hours, minutes] = item.time.split(':').map(Number);
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    return { ...item, date };
  });

  // Determine x-axis extents from first to last data point
  const xExtents = [processedData[0].date!, processedData[processedData.length - 1].date!];
  const margin = { left: 70, right: 50, top: 10, bottom: 30 };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <h2 className="text-xl font-semibold mb-4">Live Nifty Candlestick Chart</h2>
      <ChartCanvas
        height={400}
        width={width}
        ratio={ratio}
        margin={margin}
        data={processedData}
        seriesName="Nifty"
        xAccessor={(d: DataItem) => d.date!}
        xScale={scaleTime()}
        xExtents={xExtents}
        mouseMoveEvent={true}
        panEvent={true}
        zoomEvent={true}
        clamp={true}
      >
        <Chart id={1} yExtents={(d: DataItem) => [d.high, d.low]}>
          <XAxis axisAt="bottom" orient="bottom" tickFormat={timeFormat('%H:%M')} />
          <YAxis axisAt="left" orient="left" tickFormat={format('.2f')} />
          <CandlestickSeries />
          {/* OHLC tooltip */}
          <OHLCTooltip origin={[10, 30]} />
          {/* Mouse coordinates */}
          <MouseCoordinateX displayFormat={timeFormat('%H:%M')} />
          <MouseCoordinateY displayFormat={format('.2f')} />
        </Chart>
        {/* Crosshair for interactivity */}
        <CrossHairCursor />
      </ChartCanvas>
    </Card>
  );
};

// Responsive wrapper: measures container width and obtains device pixel ratio
const ResponsiveNiftyLiveCandlestickChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const ratio = window.devicePixelRatio || 1;

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 ? <NiftyLiveCandlestickChart width={width} ratio={ratio} /> : null}
    </div>
  );
};

export default ResponsiveNiftyLiveCandlestickChart;
