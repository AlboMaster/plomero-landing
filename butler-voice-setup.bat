@REM butler-voice-setup.bat
@REM Quick setup script for Butler Azure Text-to-Speech on Windows

@echo off
setlocal enabledelayedexpansion

cls
echo.
echo ================================================
echo   BUTLER™ (SU SERVILLETA) VOICE SETUP - Azure TTS
echo   Automatizacion para Plomeria Profesional
echo ================================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no instalado
    echo Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Verificando Node.js...
node --version
npm --version
echo.

REM Install dependencies
echo [2/4] Instalando dependencias...
echo Installing: microsoft-cognitiveservices-speech-sdk sqlite3 express cors body-parser
call npm install microsoft-cognitiveservices-speech-sdk sqlite3 express cors body-parser
if %errorlevel% neq 0 (
    echo ERROR en instalacion de paquetes
    pause
    exit /b 1
)
echo.

REM  for Azure Speech KeyCheck
echo [3/4] Configurando Azure Speech API Key...
echo.
echo Sin Azure key, Butler no podra hablar.
echo.
echo OPCION A: Copia tu key de Azure Portal
echo   https://portal.azure.com ^> Cognitive Services ^> Speech ^> Key1
echo.
echo OPCION B: Crea trial gratuita (30 dias sin tarjeta):
echo   https://azure.microsoft.com/en-us/free/
echo.

set /p AZURE_KEY="Pegue su Azure Speech API Key (o presione Ente
r para omitir): "


if not "%AZURE_KEY%"=="" (
    setx AZURE_SPEECH_KEY "%AZURE_KEY%"
    set AZURE_SPEECH_KEY=%AZURE_KEY%
    echo.
    echo ✓ Azure Speech Key configurada en sistema
    echo.
) else (
    echo.
    echo ⚠ Sin API Key, iniciara en modo PRUEBA (sin audio)
    echo.
)

REM Test installation
echo [4/4] Probando configuracion...
echo.

REM Check database
if not exist butler-crm.db (
    echo Inicializando base de datos CRM...
    node butler-crm-database.js
    if %errorlevel% neq 0 (
        echo ERROR: No se pudo crear base de datos
        pause
        exit /b 1
    )
    echo ✓ Base de datos CRM lista
) else (
    echo ✓ Base de datos CRM ya existe
)
echo.

REM Summary
echo ================================================
echo   SETUP COMPLETADO
echo ================================================
echo.
echo Para INICIAR BUTLER CON VOZ:
echo.
echo   node butler-crm-server.js
echo.
echo Luego abre en tu navegador:
echo   http://localhost:3000         (CRM Dashboard)
echo   http://localhost:8080         (Landing Page)
echo.
echo Para PRUEBA DE VOZ, abre una NUEVA terminal:
echo   node butler-azure-tts.js
echo.
echo ================================================
echo.

pause

REM Start the CRM server
echo.
echo Iniciando Butler CRM Server...
echo.
if defined AZURE_SPEECH_KEY (
    echo ✓ Azure Speech Key esta configurada
    echo ✓ Butler podra hablar!
) else (
    echo ⚠ Sin Azure Speech Key, voz desabilitada
    echo   Configura AZURE_SPEECH_KEY en las variables de entorno del sistema
)
echo.

node butler-crm-server.js
pause
