#!/bin/sh

npm version patch
mv README.md README_github.md
mv Readme_npm.md Readme.md
npm publish
mv Readme.md Readme_npm.md
mv README_github.md README.md
