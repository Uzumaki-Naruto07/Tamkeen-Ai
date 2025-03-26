import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const WordCloudChart = ({
  data,
  width = 800,
  height = 600,
  padding = 5,
  rotation = 'mixed',
  fontFamily = 'Impact',
  colorScheme = 'default',
  shape = 'circle',
  showFrequency = true
}) => {
  const svgRef = useRef(null);
  
  // Effect to generate and render the word cloud
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Prepare data for word cloud
    const words = data.map(d => ({
      text: showFrequency ? `${d.text} (${d.value})` : d.text,
      originalText: d.text,
      value: d.value,
      count: d.value,
      color: d.color
    }));
    
    // Set rotation function based on setting
    let rotationFn;
    switch (rotation) {
      case 'none':
        rotationFn = () => 0;
        break;
      case 'random':
        rotationFn = () => (Math.random() * 2 - 1) * 90;
        break;
      case 'mixed':
      default:
        rotationFn = d => (d.text.length > 5 ? 0 : 90 * Math.floor(Math.random() * 2));
        break;
    }
    
    // Determine color scheme
    let colorFn;
    switch (colorScheme) {
      case 'blue':
        const blueScale = d3.scaleLinear()
          .domain([0, d3.max(words, d => d.value)])
          .range(["#cfe8ff", "#0057b7"]);
        colorFn = d => d.color || blueScale(d.value);
        break;
      case 'multi':
        const category10 = d3.scaleOrdinal(d3.schemeCategory10);
        colorFn = (d, i) => d.color || category10(i % 10);
        break;
      case 'default':
      default:
        const defaultScale = d3.scaleLinear()
          .domain([0, d3.max(words, d => d.value)])
          .range(["#aaa", "#111"]);
        colorFn = d => d.color || defaultScale(d.value);
        break;
    }
    
    // Configure the word cloud layout
    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(padding)
      .rotate(rotationFn)
      .fontSize(d => Math.sqrt(d.value) * 5) // Scale font size based on value
      .font(fontFamily)
      .spiral(shape === 'rectangle' ? 'rectangular' : 'archimedean')
      .on("end", draw);
    
    // Create the word cloud
    layout.start();
    
    // Function to draw the word cloud
    function draw(words) {
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
      
      // Render the words
      svg.selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", fontFamily)
        .style("fill", colorFn)
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text)
        .append("title") // Add tooltip
        .text(d => `${d.originalText}: ${d.count}`);
    }
  }, [data, width, height, padding, rotation, fontFamily, colorScheme, shape, showFrequency]);
  
  return (
    <svg ref={svgRef} width={width} height={height} />
  );
};

WordCloudChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string
    })
  ).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  padding: PropTypes.number,
  rotation: PropTypes.oneOf(['none', 'mixed', 'random']),
  fontFamily: PropTypes.string,
  colorScheme: PropTypes.oneOf(['default', 'blue', 'multi']),
  shape: PropTypes.oneOf(['circle', 'square', 'rectangle']),
  showFrequency: PropTypes.bool
};

export default WordCloudChart; 