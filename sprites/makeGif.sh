#!/bin/bash

# Check if a directory is provided as an argument
if [ $# -lt 2 ]; then
    echo "Error: Please provide a directory path and gif delay as arguments."
    echo "Usage: $0 <directory_path>"
    echo "Usage: $1 <gif delay in ms>"
    exit 1
fi

# Use the provided directory path
dir="$1"
delay="$2"

# Check if the provided path exists and is a directory
if [ ! -d "$dir" ]; then
    echo "Error: '$dir' is not a valid directory."
    exit 1
fi

# Change to the specified directory
cd "$dir" || { echo "Error: Could not change to directory '$dir'."; exit 1; }

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required. Install it with 'sudo apt-get install imagemagick'"
    exit 1
fi

# Process each unique base filename
for base in $(ls | grep -oE '^([^_]+).png' | cut -d '.' -f 1 | sort -u); do

    #echo "basename: $base"
    # Get all matching PNG files sorted by number
    files=$(ls | grep -oE "${base}_.*\.png" | sort)

    #echo "files=$files"
    
    if [ -z "$files" ]; then
        continue
    fi
    
    # Create GIF with specified parameters
    convert -delay ${delay} -loop 0 $files ${base}.gif
        
    echo "Created ${base}.gif"
done