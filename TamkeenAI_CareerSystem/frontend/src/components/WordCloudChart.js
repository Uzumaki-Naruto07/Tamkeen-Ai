import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { Box, Tooltip, Popover, Typography, Paper, Chip } from '@mui/material';

const WordCloudChart = ({
  data,
  width = 800,
  height = 600,
  padding = 5,
  rotation = 'mixed',
  fontFamily = 'Impact',
  colorScheme = 'default',
  shape = 'circle',
  showFrequency = true,
  onWordClick = null,
  categories = null,
  animate = true
}) => {
  const svgRef = useRef(null);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [clickedWord, setClickedWord] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  
  // Effect to generate and render the word cloud
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create the SVG container with gradient background
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");
    
    // Add gradient background
    const defs = svg.append("defs");
    
    // Define gradient for background
    const gradient = defs.append("linearGradient")
      .attr("id", "cloud-background-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f8f9fa")
      .attr("stop-opacity", 1);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#e9ecef")
      .attr("stop-opacity", 1);
    
    // Add background with gradient
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#cloud-background-gradient)")
      .attr("rx", 15) // Rounded corners
      .attr("ry", 15);
    
    // Create a group for the word cloud centered in the SVG
    const cloudGroup = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
    
    // Prepare data for word cloud
    const words = data.map(d => {
      // Determine category color if categories provided
      let wordColor = d.color;
      if (categories && d.category && categories[d.category]) {
        wordColor = categories[d.category].color;
      }
      
      return {
        text: showFrequency ? `${d.text}` : d.text, // We'll add frequency in tooltip
        originalText: d.text,
        value: d.value,
        count: d.value,
        color: wordColor,
        category: d.category || 'default'
      };
    });
    
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
      case 'category':
        // If using categories for colors
        colorFn = d => d.color || "#333";
        break;
      case 'gradient':
        // Create a gradient based on frequency
        const gradientScale = d3.scaleLinear()
          .domain([0, d3.max(words, d => d.value)])
          .range(["#acd7fa", "#0275d8"]);
        colorFn = d => d.color || gradientScale(d.value);
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
      .size([width * 0.9, height * 0.9]) // Slightly smaller to fit within the background
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
      // Create a shadow filter for 3D effect
      const filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");
      
      filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 2)
        .attr("result", "blur");
        
      filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");
        
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      
      // Helper function for animations
      const getAnimationDelay = (i) => animate ? i * 20 : 0;
      
      // Render the words with animated entrance
      const wordElements = cloudGroup.selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", 0) // Start with size 0 for animation
        .style("font-family", fontFamily)
        .style("font-weight", "bold")
        .style("fill", colorFn)
        .style("cursor", "pointer")
        .style("filter", "url(#drop-shadow)") // Add shadow for 3D effect
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text)
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("font-size", `${d.size * 1.2}px`) // Increase size on hover
            .style("filter", "url(#drop-shadow) brightness(1.2)"); // Brighten on hover
          
          setHoveredWord({
            text: d.originalText,
            count: d.count,
            category: d.category
          });
        })
        .on("mouseout", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("font-size", `${d.size}px`) // Restore original size
            .style("filter", "url(#drop-shadow)");
            
          setHoveredWord(null);
        })
        .on("click", function(event, d) {
          // Handle word click (for showing context, etc.)
          if (onWordClick) {
            onWordClick(d.originalText, d.count, d.category);
          }
          
          setClickedWord({
            text: d.originalText,
            count: d.count,
            category: d.category
          });
          setPopoverAnchor(event.currentTarget);
        });
      
      // Apply entrance animation
      wordElements
        .transition()
        .duration(animate ? 800 : 0)
        .delay((d, i) => getAnimationDelay(i))
        .style("font-size", d => `${d.size}px`);
        
      // Add an invisible title element for accessibility
      wordElements.append("title")
        .text(d => `${d.originalText}: ${d.count}`);
    }
  }, [data, width, height, padding, rotation, fontFamily, colorScheme, shape, showFrequency, animate, categories, onWordClick]);
  
  // Handle closing the popover
  const handleClosePopover = () => {
    setPopoverAnchor(null);
    setClickedWord(null);
  };
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Word cloud SVG */}
      <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }} />
      
      {/* Hover information */}
      {hoveredWord && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 2,
            zIndex: 2
          }}
        >
          <Typography variant="subtitle2">
            {hoveredWord.text}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Frequency: {hoveredWord.count}
            {hoveredWord.category !== 'default' && ` • Category: ${hoveredWord.category}`}
          </Typography>
        </Box>
      )}
      
      {/* Word click popover */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {clickedWord && (
          <Paper sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {clickedWord.text}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Appears {clickedWord.count} {clickedWord.count === 1 ? 'time' : 'times'} in your resume
            </Typography>
            {clickedWord.category !== 'default' && (
              <Chip 
                label={clickedWord.category} 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mb: 1 }}
              />
            )}
            <Typography variant="caption" color="text.secondary" display="block">
              Click to see this word in context or add related skills to your resume.
            </Typography>
          </Paper>
        )}
      </Popover>
    </Box>
  );
};

WordCloudChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string,
      category: PropTypes.string
    })
  ).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  padding: PropTypes.number,
  rotation: PropTypes.oneOf(['none', 'mixed', 'random']),
  fontFamily: PropTypes.string,
  colorScheme: PropTypes.oneOf(['default', 'blue', 'multi', 'category', 'gradient']),
  shape: PropTypes.oneOf(['circle', 'square', 'rectangle']),
  showFrequency: PropTypes.bool,
  onWordClick: PropTypes.func,
  categories: PropTypes.object,
  animate: PropTypes.bool
};

// Remove this example function as it's not being used and causing confusion
// const exampleFunction = () => {
//   const data = {
//     key: "value",
//     anotherKey: "anotherValue",
//   }; 
//
//   return (
//     <svg ref={svgRef} width={width} height={height}>
//       {/* Your JSX content */}
//     </svg>
//   ); 
// }; 

export default WordCloudChart;