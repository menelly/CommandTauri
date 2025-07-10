@echo off
echo 🧃 Setting up Chaos Command Center Backend...
echo.

cd /d "%~dp0backend"

echo 🐍 Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+ first.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python found!
echo.

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install dependencies!
    echo Try running as administrator or check your internet connection.
    pause
    exit /b 1
)

echo.
echo ✅ Backend setup complete!
echo.
echo 🤖 To install Ollama for local AI:
echo 1. Download from: https://ollama.ai/download
echo 2. Install Ollama
echo 3. Run: ollama pull mistral:7b
echo.
echo 🚀 Ready to run! Start the Electron app and the backend will auto-start.
echo.
pause
