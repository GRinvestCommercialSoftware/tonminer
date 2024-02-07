call ".\npm_install.bat"

:_minerstart
node send_meridian.js --api lite --givers 100
goto _minerstart

pause