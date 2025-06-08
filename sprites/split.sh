#!/bin/bash

# Check if correct arguments provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <input_png> <number_of_splits>"
    exit 1
fi

INPUT_FILE=$1
NUM_SPLITS=$2

# Validate inputs
if ! [[ $NUM_SPLITS =~ ^[0-9]+$ ]] || [ $NUM_SPLITS -le 0 ]; then
    echo "Error: Number of splits must be a positive integer"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' does not exist"
    exit 1
fi

# Get image dimensions
HEIGHT=$(identify -format "%h" "$INPUT_FILE")
WIDTH=$(identify -format "%w" "$INPUT_FILE")

# Calculate height of each section
SECTION_HEIGHT=$((HEIGHT / NUM_SPLITS))

# Create output files
for ((i=0; i<NUM_SPLITS; i++)); do
    OUTPUT_PATH=$(dirname "$1")
    BASENAME=$(basename "$1" .png)
    OUTPUT_FILE="$OUTPUT_PATH/${BASENAME}_$((i+1)).png"
    
    # Calculate y offset for this section
    Y_OFFSET=$((i * SECTION_HEIGHT))
    
    # Extract section using ImageMagick
    convert "$INPUT_FILE" \
        -crop "${WIDTH}x${SECTION_HEIGHT}+0+${Y_OFFSET}" \
        +repage \
        "$OUTPUT_FILE"
        
    echo "Created $OUTPUT_FILE"
done