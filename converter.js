#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const { create } = require('xmlbuilder2');

program
  .version('1.0.0')
  .description('Convert PlantUML entities into a Draw.io Venn Diagram')
  .argument('<inputFile>', 'Path to plantuml file')
  .argument('<outputFile>', 'Path to save drawio xml')
  .action((inputFile, outputFile) => {
    convert(inputFile, outputFile);
  });

program.parse(process.argv);

function convert(inputPath, outputPath) {
  try {
    const pumlContent = fs.readFileSync(inputPath, 'utf-8');
    
    // 1. Parse PlantUML to find entities defined in parentheses like (Item)
    // Regex looks for: (Name) or (Name) as "Label"
    const regex = /\(([^)]+)\)/g;
    const matches = [...pumlContent.matchAll(regex)];
    
    // Extract unique labels
    const sets = [...new Set(matches.map(m => m[1]))];

    if (sets.length < 2 || sets.length > 3) {
      console.warn(`Warning: Perfect Venn diagrams are best with 2 or 3 sets. Found ${sets.length}. Logic will attempt to place them anyway.`);
    }

    console.log(`Found ${sets.length} sets: ${sets.join(', ')}`);

    // 2. Generate Draw.io XML
    const xml = generateDrawIoXml(sets);

    // 3. Write to file
    fs.writeFileSync(outputPath, xml);
    console.log(`Successfully created ${outputPath}`);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

function generateDrawIoXml(sets) {
  // Initialize XML structure
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('mxfile', { host: 'Electron', type: 'device' })
    .ele('diagram', { name: 'Page-1', id: 'diagram_1' })
    .ele('mxGraphModel', { dx: '1000', dy: '1000', grid: '1', gridSize: '10', guides: '1', tooltips: '1', connect: '1', arrows: '1', fold: '1', page: '1', pageScale: '1', pageWidth: '827', pageHeight: '1169', math: '0', shadow: '0' })
    .ele('root');

  // Add default parent cells
  root.ele('mxCell', { id: '0' });
  root.ele('mxCell', { id: '1', parent: '0' });

  // 3. Calculate Geometry & Styles
  // Circle config
  const radius = 200;
  const width = radius * 2;
  const height = radius * 2;
  const opacity = 50; // Semi-transparent for Venn overlap effect
  
  // Colors for different sets (Red, Blue, Green)
  const colors = ['#f8cecc', '#dae8fc', '#d5e8d4'];
  const strokes = ['#b85450', '#6c8ebf', '#82b366'];

  // Venn Diagram Positioning Logic
  const positions = getVennPositions(sets.length, radius);

  sets.forEach((label, index) => {
    const x = positions[index] ? positions[index].x : index * 50;
    const y = positions[index] ? positions[index].y : index * 50;
    const color = colors[index % colors.length];
    const stroke = strokes[index % strokes.length];

    // Style string for Draw.io
    const style = `ellipse;whiteSpace=wrap;html=1;fillColor=${color};strokeColor=${stroke};opacity=${opacity};fontStyle=1;fontSize=20;`;

    root.ele('mxCell', {
      id: `entity_${index}`,
      value: label,
      style: style,
      parent: '1',
      vertex: '1'
    }).ele('mxGeometry', {
      x: String(x),
      y: String(y),
      width: String(width),
      height: String(height),
      as: 'geometry'
    });
  });

  // Add text labels for React/Angular/Vue Venn diagram
  if (sets.length === 3 && sets.sort().join(',') === 'Angular,React,Vue') {
    const texts = [
      { id: 'unique_react', value: 'Virtual DOM\nJSX', x: 280, y: 120 },
      { id: 'unique_angular', value: 'Two-way binding\nDependency injection', x: 120, y: 328 },
      { id: 'unique_vue', value: 'Reactive data\nSingle-file components', x: 440, y: 328 },
      { id: 'react_angular', value: 'Component-based\nTypeScript', x: 220, y: 280 },
      { id: 'react_vue', value: 'Virtual DOM\nReactivity', x: 340, y: 280 },
      { id: 'angular_vue', value: 'Directives\nTemplates', x: 280, y: 408 },
      { id: 'all', value: 'JavaScript\nSPA', x: 280, y: 328 }
    ];

    texts.forEach(text => {
      root.ele('mxCell', {
        id: text.id,
        value: text.value,
        style: 'text;html=1;verticalAlign=top;whiteSpace=wrap;fontSize=12;',
        parent: '1',
        vertex: '1'
      }).ele('mxGeometry', {
        x: String(text.x),
        y: String(text.y),
        width: '100',
        height: '50',
        as: 'geometry'
      });
    });
  }

  return root.end({ prettyPrint: true });
}

// Helper to calculate circle center coordinates
function getVennPositions(count, r) {
  const positions = [];
  const startX = 200;
  const startY = 200;
  const overlap = r * 0.8; // How much they overlap

  if (count === 2) {
    // Horizontal overlap
    positions.push({ x: startX, y: startY });
    positions.push({ x: startX + overlap, y: startY });
  } else if (count === 3) {
    // Triangle formation
    // Top
    positions.push({ x: startX + (overlap / 2), y: startY });
    // Bottom Left
    positions.push({ x: startX, y: startY + (overlap * 0.8) });
    // Bottom Right
    positions.push({ x: startX + overlap, y: startY + (overlap * 0.8) });
  } else {
    // Fallback for > 3 or 1: Just cascade them
    for(let i=0; i<count; i++) {
        positions.push({ x: startX + (i*50), y: startY + (i*50) });
    }
  }
  return positions;
}