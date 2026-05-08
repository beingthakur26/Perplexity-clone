# Project Diagrams

Open these SVG files directly in a browser, or embed them in Markdown/PDF docs.

```txt
backend_architecture.svg
frontend_architecture.svg
platform_internal_workflow.svg
feature_map.svg
backend_folder_structure_detail.svg
backend_folder_workflow_detail.svg
frontend_folder_structure_detail.svg
frontend_folder_workflow_detail.svg
```

## Diagram Purposes

`backend_architecture.svg`

Shows Express backend layers, routes/controllers/services, database, search APIs, scraper APIs, LLM APIs, and SaaS services.

`frontend_architecture.svg`

Shows React/Vite frontend flow from `main.jsx` to `app/`, layout, pages, chat feature, shared UI, and API helpers.

`platform_internal_workflow.svg`

Shows how one user question moves through the whole platform from frontend to backend to search/scraping/LLM/storage and back to the UI.

`feature_map.svg`

Shows the complete feature map: auth, search, answer generation, history, settings, billing, files, spaces, sharing, and API access.

`backend_folder_structure_detail.svg`

Shows each major backend folder, what exists now, what is missing, and what every folder is responsible for.

`backend_folder_workflow_detail.svg`

Shows how backend folders cooperate during one `/api/search` request.

`frontend_folder_structure_detail.svg`

Shows each major frontend folder, what exists now, what is empty/missing, and what every folder is responsible for.

`frontend_folder_workflow_detail.svg`

Shows how frontend folders cooperate when the user asks a question and receives a streamed answer.
