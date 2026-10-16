import vertexai
from vertexai.preview import reasoning_engines

vertexai.init(project="privategpt-437907", location="europe-west1")

engine = reasoning_engines.ReasoningEngine(
    "projects/981078856173/locations/europe-west1/reasoningEngines/4533231465739059200"
)

# Test query
response = engine.query(
    input="Hello! What capabilities do you have for End of Mission handovers?"
)
print(response)