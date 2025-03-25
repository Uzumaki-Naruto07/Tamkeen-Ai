import React from 'react';
import { TagCloud } from 'react-tagcloud';

// Sample data format for react-d3-cloud
// Each word object needs text and value properties
const WordCloudChart = ({ data = [], width = 500, height = 300 }) => {
  // Convert data to the format expected by react-tagcloud
  const formattedData = data.map(item => {
    if (typeof item === 'object' && item.text && item.value) {
      return { value: item.text, count: item.value };
    }
    if (typeof item === 'object' && item.text && item.size) {
      return { value: item.text, count: item.size };
    }
    return { value: item.toString(), count: 10 };
  });

  return (
    <div className="word-cloud-container" style={{ width, height }}>
      <TagCloud
        minSize={12}
        maxSize={35}
        tags={formattedData}
        colorOptions={{
          luminosity: 'light',
          hue: 'blue'
        }}
      />
    </div>
  );
};

export default WordCloudChart; 