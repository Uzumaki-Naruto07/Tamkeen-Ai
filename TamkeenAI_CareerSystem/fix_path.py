#!/usr/bin/env python3
# Create this file in your backend directory

import os
import sys

# Add the parent directory to sys.path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, parent_dir)

print(f"Added {parent_dir} to Python path")
print(f"Current Python path: {sys.path}") 