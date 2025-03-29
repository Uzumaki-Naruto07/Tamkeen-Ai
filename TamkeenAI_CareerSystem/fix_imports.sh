#!/bin/bash

# Set the directory to search in
DIR="./frontend/src/pages"

# Use grep to find files with the old import and sed to replace them
grep -l "import { useUser } from '../components/AppContext'" $DIR/*.jsx | xargs sed -i '' "s|import { useUser } from '../components/AppContext'|import { useUser } from '../context/AppContext'|g"

echo "Updated import paths in all files." 