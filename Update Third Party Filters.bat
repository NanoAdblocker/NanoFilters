@ECHO OFF
NODE "./Update Third Party Filters.node.js" --all
NODE "./Content Sanitizer.node.js"
PAUSE
