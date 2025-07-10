#!/bin/bash

echo "🧃 Setting up Chaos Command Center Backend..."
echo

cd "$(dirname "$0")/backend"

echo "🐍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found! Please install Python 3.8+ first."
    echo "On Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "On macOS: brew install python3"
    exit 1
fi

echo "✅ Python3 found!"
echo

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    echo "Try: pip3 install --user -r requirements.txt"
    exit 1
fi

echo
echo "✅ Backend setup complete!"
echo
echo "🤖 To install Ollama for local AI:"
echo "1. Download from: https://ollama.ai/download"
echo "2. Install Ollama"
echo "3. Run: ollama pull mistral:7b"
echo
echo "🚀 Ready to run! Start the Electron app and the backend will auto-start."
echo
