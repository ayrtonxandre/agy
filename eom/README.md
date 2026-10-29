# 🎯 AGY · End of Mission (EOM) Reasoning Engine

The **EOM (End of Mission)** pillar powers automated knowledge extraction, architectural synthesis, and structured handover documentation when concluding client or mandate missions.

---

## 🏛️ Architecture & Infrastructure

- **Cloud Platform**: Google Cloud Vertex AI
- **Project ID**: `privategpt-437907`
- **Region**: `europe-west1`
- **Reasoning Engine Resource**:
  ```text
  projects/981078856173/locations/europe-west1/reasoningEngines/4533231465739059200
  ```

---

## 🚀 Execution & Usage

To query the Reasoning Engine for handover generation or status:

```bash
# Run from repository root:
python eom/agent_eom.py

# Or via Python module:
python -m eom.agent_eom
```

### Script Example (`eom/agent_eom.py`)
```python
import vertexai
from vertexai.preview import reasoning_engines

vertexai.init(project="privategpt-437907", location="europe-west1")

engine = reasoning_engines.ReasoningEngine(
    "projects/981078856173/locations/europe-west1/reasoningEngines/4533231465739059200"
)

# Handover synthesis query
response = engine.query(
    input="Hello! What capabilities do you have for End of Mission handovers?"
)
print(response)
```

---

## 🔄 Integration Touchpoints with AGY

1. **Meeting Hub**: Action items, architectural decisions, and key stakeholder minutes captured across client initiatives can feed directly into EOM handover synthesis.
2. **Project Registers**: 9 configured initiatives in Meeting Hub provide structured scope and deliverable baselines.
