import { Component, createSignal } from 'solid-js';
import { useChart } from './ChartDataContext';
import { StrToAny, ArrowArt, HoldArt, ChartData, Segment } from '~/lib/types';


const readJSONFile = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const processChartData = (result: any[]): ChartData => {
  if (!Array.isArray(result) || result.length < 3) {
    throw new Error('Invalid data format');
  }

  const metadata = result[2] as StrToAny;
  if (!metadata) {
    throw new Error('Missing metadata in chart data');
  }

  return {
    arrowarts: result[0] as ArrowArt[] || [],
    holdarts: result[1] as HoldArt[] || [],
    metadata,
    segments: metadata['Segments'] as Segment[] || [],
    segmentdata: metadata['Segment metadata'] as StrToAny[] || [],
    manuallyAnnotatedFlag: metadata['Manual limb annotation'] ? '✅' : ''
  };
};

interface JSONUploaderProps {
  onDataLoaded?: (data: ChartData) => void;
}


export const JSONUploader: Component<JSONUploaderProps> = (props) => {
  const { chartData, mutate } = useChart();
  const [isDragging, setIsDragging] = createSignal(false);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      console.error('Please upload a JSON file');
      return;
    }

    try {
      const jsonData = await readJSONFile(file);
      const processedData = processChartData(jsonData);
      
      // Update the resource with the new data
      mutate(processedData);
      
      // Notify parent component if callback is provided
      props.onDataLoaded?.(processedData);
    } catch (error) {
      console.error('Error processing file:', error);
      // You might want to handle errors more gracefully here
    }
  };

  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer?.files[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div class="flex flex-col gap-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        class={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-colors duration-200 ease-in-out
          ${isDragging() ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          hover:border-blue-500 hover:bg-blue-50
        `}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          class="hidden"
          id="fileInput"
        />
        <label 
          for="fileInput" 
          class="cursor-pointer text-gray-400 hover:text-blue-500"
        >
          <div class="text-lg mb-2">
            {isDragging() ? 'Drop your JSON file here' : 'Drag & drop your JSON file here'}
          </div>
          <div class="text-sm">or click to browse</div>
        </label>
      </div>
      
      {chartData.loading && <div>Loading...</div>}
      {chartData.error && <div class="text-red-500">Error: {chartData.error.message}</div>}
      
      {chartData() && (
        <div class="mt-4">
          <p>✅ JSON file loaded successfully</p>
          <p>Arrow Arts: {chartData()?.arrowarts.length}</p>
          <p>Hold Arts: {chartData()?.holdarts.length}</p>
        </div>
      )}
    </div>
  );
};