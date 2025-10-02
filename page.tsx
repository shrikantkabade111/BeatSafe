"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Activity, LineChart, User, AlertCircle, ZoomIn, ZoomOut, Ruler, Play, Pause, Grid, ArrowUpDown, Info, Brain } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartType,
} from 'chart.js';
import { analyzeECG } from '@/lib/ml/ecg_analysis';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Types
interface ECGData {
  heartRate: number;
  rhythm: string;
  stSegment: string;
  patientId: string;
  measurements: {
    prInterval: string;
    qrsDuration: string;
    qtInterval: string;
    axis: string;
  };
  history: Array<{
    date: string;
    status: string;
  }>;
  ecgSignal?: number[];
  mlPrediction?: {
    accuracy: number;
    prediction: string;
    confidence: number;
  };
}

interface Measurement {
  start: number;
  end: number;
  label: string;
  value: string;
  type: 'interval' | 'amplitude';
}

interface WaveDetection {
  pWave: number[];
  qrsComplex: number[];
  tWave: number[];
}

export default function ECGAnalysisPage() {
  const [data, setData] = useState<ECGData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementStart, setMeasurementStart] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [measurementType, setMeasurementType] = useState<'interval' | 'amplitude'>('interval');
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [waveDetection, setWaveDetection] = useState<WaveDetection | null>(null);
  const [calculatedHeartRate, setCalculatedHeartRate] = useState<number | null>(null);
  const chartRef = useRef<ChartJS<"line">>(null);

  // Function to detect waves in ECG signal
  const detectWaves = (signal: number[]): WaveDetection => {
    const pWave: number[] = [];
    const qrsComplex: number[] = [];
    const tWave: number[] = [];
    
    // Simple threshold-based detection
    const threshold = 0.5;
    const windowSize = 10;
    
    for (let i = windowSize; i < signal.length - windowSize; i++) {
      // P wave detection (small positive deflection)
      if (signal[i] > threshold && signal[i] > signal[i-1] && signal[i] > signal[i+1]) {
        pWave.push(i);
      }
      
      // QRS complex detection (large deflection)
      if (Math.abs(signal[i]) > 1.5 && Math.abs(signal[i]) > Math.abs(signal[i-1]) && 
          Math.abs(signal[i]) > Math.abs(signal[i+1])) {
        qrsComplex.push(i);
      }
      
      // T wave detection (medium positive deflection)
      if (signal[i] > 0.7 && signal[i] > signal[i-1] && signal[i] > signal[i+1]) {
        tWave.push(i);
      }
    }
    
    return { pWave, qrsComplex, tWave };
  };

  // Function to calculate heart rate from QRS complexes
  const calculateHeartRate = (qrsComplexes: number[], signalLength: number): number => {
    if (qrsComplexes.length < 2) return 0;
    
    // Calculate average interval between QRS complexes
    const intervals = [];
    for (let i = 1; i < qrsComplexes.length; i++) {
      intervals.push(qrsComplexes[i] - qrsComplexes[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    // Convert to beats per minute (assuming signal is sampled at 250Hz)
    return Math.round((60 * 250) / avgInterval);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get the ECG signal from localStorage (set by the home page)
        const storedSignal = localStorage.getItem('ecgSignal');
        if (!storedSignal) {
          throw new Error('No ECG signal found. Please upload an ECG file first.');
        }

        const signal = JSON.parse(storedSignal);
        const waves = detectWaves(signal);
        const heartRate = calculateHeartRate(waves.qrsComplex, signal.length);
        const mlPrediction = await analyzeECG(signal);
        
        const mockData: ECGData = {
          heartRate: heartRate,
          rhythm: mlPrediction?.prediction || "Unknown",
          stSegment: "Normal",
          patientId: "#12345",
          measurements: {
            prInterval: "120-200ms",
            qrsDuration: "60-100ms",
            qtInterval: "350-450ms",
            axis: "Normal"
          },
          history: [
            { date: "2024-03-20 14:30", status: "Normal" },
            { date: "2024-03-19 10:15", status: "Normal" },
            { date: "2024-03-18 09:45", status: "Borderline" }
          ],
          ecgSignal: signal,
          mlPrediction
        };
        
        setData(mockData);
        setWaveDetection(waves);
        setCalculatedHeartRate(heartRate);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ECG data. Please try again later.");
        console.error("Error fetching ECG data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time update simulation
  useEffect(() => {
    if (!isPlaying || !data?.ecgSignal) return;

    const interval = setInterval(() => {
      setData(prev => {
        if (!prev?.ecgSignal) return prev;
        const newSignal = [...prev.ecgSignal];
        // Shift the signal to the left
        newSignal.shift();
        newSignal.push(newSignal[newSignal.length - 1]);
        return { ...prev, ecgSignal: newSignal };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, data?.ecgSignal]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(newZoom, 0.5), 5);
    });
  };

  const handleMeasurementStart = () => {
    setIsMeasuring(true);
    setMeasurementStart(null);
    setSelectedPoint(null);
  };

  const handleChartClick = (event: any) => {
    if (!isMeasuring || !chartRef.current || !data?.ecgSignal) return;

    const chart = chartRef.current;
    const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
    
    if (points.length === 0) return;
    
    const point = points[0];
    const xValue = point.index;
    const yValue = data.ecgSignal[xValue];

    if (measurementType === 'interval') {
      if (measurementStart === null) {
        setMeasurementStart(xValue);
      } else {
        const duration = Math.abs(xValue - measurementStart);
        const newMeasurement: Measurement = {
          start: Math.min(measurementStart, xValue),
          end: Math.max(measurementStart, xValue),
          label: `Interval ${measurements.length + 1}`,
          value: `${duration}ms`,
          type: 'interval'
        };
        setMeasurements([...measurements, newMeasurement]);
        setIsMeasuring(false);
        setMeasurementStart(null);
      }
    } else {
      if (selectedPoint === null) {
        setSelectedPoint({ x: xValue, y: yValue });
      } else {
        const amplitude = Math.abs(yValue - selectedPoint.y);
        const newMeasurement: Measurement = {
          start: Math.min(selectedPoint.x, xValue),
          end: Math.max(selectedPoint.x, xValue),
          label: `Amplitude ${measurements.length + 1}`,
          value: `${amplitude.toFixed(2)}mV`,
          type: 'amplitude'
        };
        setMeasurements([...measurements, newMeasurement]);
        setIsMeasuring(false);
        setSelectedPoint(null);
      }
    }
  };

  const chartData = {
    labels: data?.ecgSignal?.map((_, index) => index.toString()) || [],
    datasets: [
      {
        label: 'ECG Signal',
        data: data?.ecgSignal || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.4,
      },
      // P wave markers
      {
        label: 'P Wave',
        data: waveDetection?.pWave.map(x => ({ x, y: data?.ecgSignal?.[x] || 0 })) || [],
        borderColor: 'rgba(255, 99, 132, 0.5)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointRadius: 3,
        showLine: false,
      },
      // QRS complex markers
      {
        label: 'QRS Complex',
        data: waveDetection?.qrsComplex.map(x => ({ x, y: data?.ecgSignal?.[x] || 0 })) || [],
        borderColor: 'rgba(54, 162, 235, 0.5)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        pointRadius: 3,
        showLine: false,
      },
      // T wave markers
      {
        label: 'T Wave',
        data: waveDetection?.tWave.map(x => ({ x, y: data?.ecgSignal?.[x] || 0 })) || [],
        borderColor: 'rgba(255, 206, 86, 0.5)',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        pointRadius: 3,
        showLine: false,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Amplitude: ${value.toFixed(2)}mV`;
          }
        }
      },
    },
    scales: {
      x: {
        display: showGrid,
        min: 0,
        max: data?.ecgSignal?.length ? data.ecgSignal.length / zoomLevel : undefined,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        }
      },
      y: {
        display: showGrid,
        min: -2,
        max: 2,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        }
      },
    },
    animation: {
      duration: 0,
    },
    onClick: handleChartClick,
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-[400px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ECG Analysis Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Heart Rate</p>
              <p className="text-2xl font-bold">{calculatedHeartRate} BPM</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Rhythm</p>
              <p className="text-2xl font-bold">{data.rhythm}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">ST Segment</p>
              <p className="text-2xl font-bold">{data.stSegment}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">ML Prediction</p>
              <p className="text-2xl font-bold">{data.mlPrediction?.prediction}</p>
              <p className="text-sm text-muted-foreground">
                Confidence: {(data.mlPrediction?.confidence || 0) * 100}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="waveform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waveform">ECG Waveform</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="waveform" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleZoom('in')}
                  disabled={zoomLevel >= 5}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleZoom('out')}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant={isMeasuring ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleMeasurementStart}
                >
                  <Ruler className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant={showGrid ? "default" : "outline"}
                  size="icon"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={measurementType === 'amplitude' ? "default" : "outline"}
                  size="icon"
                  onClick={() => setMeasurementType(measurementType === 'interval' ? 'amplitude' : 'interval')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  Zoom: {Math.round(zoomLevel * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Mode: {measurementType === 'interval' ? 'Interval' : 'Amplitude'}
                </div>
              </div>
            </div>
            <div className="h-[400px] bg-black rounded-lg p-4 relative">
              <Line ref={chartRef} data={chartData} options={chartOptions} />
              {isMeasuring && measurementStart !== null && (
                <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                  <div className="h-full w-px bg-red-500 absolute" style={{ left: `${(measurementStart / (data.ecgSignal?.length || 1)) * 100}%` }} />
                </div>
              )}
              {isMeasuring && selectedPoint !== null && (
                <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                  <div className="h-full w-px bg-blue-500 absolute" style={{ left: `${(selectedPoint.x / (data.ecgSignal?.length || 1)) * 100}%` }} />
                </div>
              )}
            </div>
            {measurements.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Measurements</h3>
                <div className="space-y-2">
                  {measurements.map((measurement, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{measurement.label}</span>
                      <span className="text-primary">{measurement.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">PR Interval</p>
                  <p className="text-lg font-medium">{data.measurements.prInterval}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">QRS Duration</p>
                  <p className="text-lg font-medium">{data.measurements.qrsDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">QT Interval</p>
                  <p className="text-lg font-medium">{data.measurements.qtInterval}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Axis</p>
                  <p className="text-lg font-medium">{data.measurements.axis}</p>
                </div>
              </div>
              {data.mlPrediction && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">ML Analysis</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Prediction:</span> {data.mlPrediction.prediction}</p>
                    <p><span className="font-medium">Confidence:</span> {(data.mlPrediction.confidence * 100).toFixed(1)}%</p>
                    <p><span className="font-medium">Accuracy:</span> {(data.mlPrediction.accuracy * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Previous Recordings</h2>
            <div className="space-y-2">
              {data.history.map((record, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 rounded"
                >
                  <span>{record.date}</span>
                  <span className={record.status === "Normal" ? "text-green-500" : "text-yellow-500"}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 