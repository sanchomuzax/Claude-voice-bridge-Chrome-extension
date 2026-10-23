@echo off
setlocal
cd /d "%~dp0"
title Claude Voice Bridge - Frissites
echo Claude Voice Bridge frissites
echo.
if not exist "native\update-standalone.py" (
  echo HIBA: A frissito hianyzik: native\update-standalone.py
  goto :failed
)
where py >nul 2>&1
if not errorlevel 1 (
  py -3 "native\update-standalone.py" --install
  goto :result
)
where python >nul 2>&1
if not errorlevel 1 (
  python "native\update-standalone.py" --install
  goto :result
)
echo HIBA: Nem talalhato Python 3. Telepitsd, vagy ellenorizd a PATH beallitast.
goto :failed

:result
if errorlevel 1 goto :failed
echo.
echo Kesz. Ha volt frissites, az Edge Extensions oldalon toltsd ujra a bovitmenyt.
goto :end

:failed
echo.
echo A frissites nem sikerult. A fent megjeleno hibat ellenorizd.
:end
echo.
pause
endlocal
