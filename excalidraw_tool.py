#!/usr/bin/env python3
"""
Excalidraw Connector & Tool for Antigravity.
Bridges:
  1. Google Cloud Discovery Engine (Data Store: excalidraw_1787583517655_diagrams / Engine: Artefact GE)
  2. Federated Excalidraw MCP Server (https://mcp.excalidraw.com/mcp)
"""

import os
import json
import uuid
import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GCP_TOKEN_FILE = os.path.join(BASE_DIR, "gcp_token.json")
MCP_URL = "https://mcp.excalidraw.com/mcp"

PROJECT_ID = "privategpt-437907"
LOCATION = "eu"
DATA_STORE_ID = "excalidraw_1787583517655_diagrams"
ENGINE_ID = "artefact-ge_1783348116724"

# Color Palette
COLORS = {
    "blue": {"stroke": "#1971c2", "bg": "#a5d8ff"},
    "green": {"stroke": "#2f9e44", "bg": "#b2f2bb"},
    "orange": {"stroke": "#e8590c", "bg": "#ffd8a8"},
    "purple": {"stroke": "#7048e8", "bg": "#d0bfff"},
    "gray": {"stroke": "#495057", "bg": "#e9ecef"},
    "red": {"stroke": "#e03131", "bg": "#ffc9c9"}
}

def call_mcp_tool(tool_name: str, arguments: dict):
    """Executes a tool on the federated Excalidraw MCP server over SSE."""
    headers = {
        "Accept": "application/json, text/event-stream",
        "Content-Type": "application/json"
    }
    payload = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4())[:8],
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }
    res = requests.post(MCP_URL, headers=headers, json=payload, timeout=15)
    for line in res.text.splitlines():
        if line.startswith("data:"):
            data = json.loads(line[5:].strip())
            content = data.get("result", {}).get("content", [])
            for c in content:
                if c.get("type") == "text":
                    return c.get("text")
    return res.text

def export_excalidraw_diagram(diagram_json: dict) -> str:
    """Exports diagram JSON to excalidraw.com and returns a shareable URL."""
    return call_mcp_tool("export_to_excalidraw", {"json": json.dumps(diagram_json)})

def search_discovery_engine(query: str, page_size: int = 5):
    """Searches the Google Cloud Discovery Engine Excalidraw store or Artefact GE app."""
    if not os.path.exists(GCP_TOKEN_FILE):
        return {"error": "gcp_token.json not found"}
        
    creds = Credentials.from_authorized_user_file(GCP_TOKEN_FILE)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(GCP_TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
            
    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": "application/json"
    }
    
    url = f"https://eu-discoveryengine.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}/servingConfigs/default_search:search"
    res = requests.post(url, headers=headers, json={"query": query, "pageSize": page_size})
    return res.json()

def build_box(id_name: str, label: str, x: int, y: int, w: int = 200, h: int = 80, theme: str = "blue"):
    """Helper to generate an Excalidraw styled rectangle + text node."""
    c = COLORS.get(theme, COLORS["blue"])
    rect = {
        "type": "rectangle",
        "id": f"rect_{id_name}",
        "x": x,
        "y": y,
        "width": w,
        "height": h,
        "strokeColor": c["stroke"],
        "backgroundColor": c["bg"],
        "fillStyle": "solid",
        "strokeWidth": 2,
        "roughness": 1,
        "roundness": {"type": 3}
    }
    text = {
        "type": "text",
        "id": f"text_{id_name}",
        "x": x + 10,
        "y": y + (h // 2) - 10,
        "width": w - 20,
        "height": 20,
        "text": label,
        "fontSize": 14,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle"
    }
    return [rect, text]

def build_arrow(start_x: int, start_y: int, end_x: int, end_y: int):
    """Helper to generate an arrow connecting nodes."""
    dx = end_x - start_x
    dy = end_y - start_y
    return {
        "type": "arrow",
        "id": f"arr_{uuid.uuid4().hex[:6]}",
        "x": start_x,
        "y": start_y,
        "width": dx,
        "height": dy,
        "points": [[0, 0], [dx, dy]],
        "strokeColor": "#1e1e1e",
        "strokeWidth": 2,
        "roughness": 1
    }

if __name__ == "__main__":
    print("Testing Excalidraw Tool...")
    # Example: Build an Athlete Intelligence Architecture Diagram
    elements = []
    # Node 1: Apple Health / iPhone
    elements.extend(build_box("iphone", "📱 iPhone / Watch\n(HealthKit + REST)", 80, 150, 180, 70, "orange"))
    # Node 2: Garmin Connect
    elements.extend(build_box("garmin", "⌚ Garmin Cloud\n(Garth SSO / MFA)", 80, 270, 180, 70, "blue"))
    # Arrow 1 to Orchestrator
    elements.append(build_arrow(260, 185, 340, 215))
    elements.append(build_arrow(260, 305, 340, 245))
    # Node 3: Orchestrator
    elements.extend(build_box("orchestrator", "🚀 Orchestrator\n(Python launchd :8080)", 340, 195, 200, 80, "purple"))
    # Arrow to Calendars & Dashboards
    elements.append(build_arrow(540, 235, 620, 175))
    elements.append(build_arrow(540, 235, 620, 295))
    # Node 4: Calendar Hub
    elements.extend(build_box("cal", "📅 Tri-Calendar Hub\n(Google, iCloud, M365)", 620, 140, 200, 70, "green"))
    # Node 5: Dashboards
    elements.extend(build_box("dash", "📊 ATHX Dashboard\n(Chart.js HTML)", 620, 260, 200, 70, "blue"))

    diagram = {
        "type": "excalidraw",
        "version": 2,
        "source": "https://excalidraw.com",
        "elements": elements,
        "appState": {"viewBackgroundColor": "#fafafa"}
    }
    
    url = export_excalidraw_diagram(diagram)
    print("✅ Live Architecture Diagram URL:", url)
