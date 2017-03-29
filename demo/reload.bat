call yarn cache clean
rmdir /s /q node_modules
del /f yarn.lock
call yarn
pause