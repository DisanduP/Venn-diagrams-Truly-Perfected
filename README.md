# PlantUML to Draw.io Venn Diagram Converter

A simple Node.js script to convert PlantUML entity definitions into Draw.io XML files for Venn diagrams.

## Description

This tool parses PlantUML files for entities enclosed in parentheses (e.g., `(Item)`) and generates a Draw.io-compatible XML file with overlapping circles representing the sets. Ideal for 2-3 sets; supports more with cascading placement.

For specific diagrams like React/Angular/Vue, it includes detailed content in the Venn regions (unique features, shared concepts, common traits).

## Installation

1. Ensure Node.js is installed (v14+ recommended).
2. Clone or download the repository.
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

```bash
node converter.js <inputFile> <outputFile>
```

- `<inputFile>`: Path to a PlantUML file containing entities like `(Set1)`, `(Set2)`, etc.
- `<outputFile>`: Path for the generated Draw.io XML file (e.g., `diagram.drawio`).

## Examples

### Basic 3-set Venn
Create `sample.puml`:
```
(A)
(B)
(C)
```

Run:
```bash
node converter.js sample.puml sample.drawio
```

Generates overlapping circles labeled A, B, C.

### Enhanced Framework Comparison
Create `frameworks.puml`:
```
(React)
(Angular)
(Vue)
```

Run:
```bash
node converter.js frameworks.puml frameworks.drawio
```

Generates a detailed Venn with unique features, pairwise shares, and common traits.

## Features

- Parses PlantUML for set entities.
- Generates Draw.io XML with styled ellipses.
- Semi-transparent overlaps for Venn effect.
- Special handling for React/Angular/Vue with region-specific content.
- Warns for >3 sets (cascades instead of true overlaps).

## Visualization

Open the generated `.drawio` files in [Draw.io](https://app.diagrams.net/) by importing the XML.

## Dependencies

- `commander`: For CLI argument parsing.
- `xmlbuilder2`: For generating XML.

## License

ISC
