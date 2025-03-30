#!/bin/bash

# Directory containing all frontend source files
DIR="frontend/src"

# Replace imports from ./AppContext to ../context/AppContext
echo "Fixing import paths from ./AppContext to ../context/AppContext"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser } from './AppContext'|import { useUser } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useAppContext } from './AppContext'|import { useAppContext } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useAuth } from './AppContext'|import { useAuth } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useResume } from './AppContext'|import { useResume } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useJob } from './AppContext'|import { useJob } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUI } from './AppContext'|import { useUI } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useNotifications } from './AppContext'|import { useNotifications } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useDoc } from './AppContext'|import { useDoc } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useAnalysis } from './AppContext'|import { useAnalysis } from '../context/AppContext'|g"

# Also update any multi-import patterns
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser, useResume } from './AppContext'|import { useUser, useResume } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser, useJob } from './AppContext'|import { useUser, useJob } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useResume, useJob } from './AppContext'|import { useResume, useJob } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser, useResume, useJob } from './AppContext'|import { useUser, useResume, useJob } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useDoc, useJob } from './AppContext'|import { useDoc, useJob } from '../context/AppContext'|g"
find $DIR/components -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser, useDoc } from './AppContext'|import { useUser, useDoc } from '../context/AppContext'|g"

# Fix imports in pages
find $DIR/pages -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser, useResume } from '../components/AppContext'|import { useUser, useResume } from '../context/AppContext'|g"
find $DIR/pages -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser, useResume, useJob } from '../components/AppContext'|import { useUser, useResume, useJob } from '../context/AppContext'|g"
find $DIR/pages -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser, useJob } from '../components/AppContext'|import { useUser, useJob } from '../context/AppContext'|g"
find $DIR/pages -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useResume, useJob } from '../components/AppContext'|import { useResume, useJob } from '../context/AppContext'|g"
find $DIR/pages -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser } from '../components/AppContext'|import { useUser } from '../context/AppContext'|g"
find $DIR/pages -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useAppContext } from '../components/AppContext'|import { useAppContext } from '../context/AppContext'|g"

# Fix nested directory imports
find $DIR/components/Dashboard -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useUser } from '../AppContext'|import { useUser } from '../../context/AppContext'|g"
find $DIR/components/Dashboard -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useAppContext } from '../AppContext'|import { useAppContext } from '../../context/AppContext'|g"

find $DIR/components/Interview -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useAuth } from '../AppContext'|import { useAuth } from '../../context/AppContext'|g"
find $DIR/components/Interview -type f -name "*.jsx" -o -name "*.js" | xargs sed -i '' "s|import { useAuth } from '../../contexts/AuthContext'|import { useAuth } from '../../context/AppContext'|g"

echo "Import paths updated successfully!" 