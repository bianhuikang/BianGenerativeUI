from langchain.tools import ToolRuntime, tool
from langchain.messages import ToolMessage
from langgraph.types import Command
from typing import TypedDict
import uuid
from datetime import datetime


class UITemplate(TypedDict):
    id: str
    name: str
    description: str
    html: str
    data_description: str
    created_at: str
    version: int


@tool
def save_template(
    name: str,
    description: str,
    html: str,
    data_description: str,
    runtime: ToolRuntime,
) -> Command:
    """
    Save a generated UI as a reusable template.
    Call this when the user wants to save a widget/visualization they liked for reuse later.

    Args:
        name: Short name for the template (e.g. "Invoice", "Dashboard")
        description: What the template displays or does
        html: The raw HTML string of the widget to save as a template
        data_description: Description of the data shape this template expects
    """
    templates = list(runtime.state.get("templates", []))

    template: UITemplate = {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": description,
        "html": html,
        "data_description": data_description,
        "created_at": datetime.now().isoformat(),
        "version": 1,
    }
    templates.append(template)

    return Command(update={
        "templates": templates,
        "messages": [
            ToolMessage(
                content=f"Template '{name}' saved successfully (id: {template['id']})",
                tool_call_id=runtime.tool_call_id,
            )
        ],
    })


@tool
def list_templates(runtime: ToolRuntime):
    """
    List all saved UI templates. Returns template summaries (id, name, description, data_description).
    """
    templates = runtime.state.get("templates", [])
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "data_description": t["data_description"],
            "version": t["version"],
        }
        for t in templates
    ]


@tool
def apply_template(template_id: str, runtime: ToolRuntime):
    """
    Retrieve a saved template's HTML so you can adapt it with new data.
    After calling this, modify the HTML to fit the user's new data and render it via widgetRenderer.

    Args:
        template_id: The ID of the template to apply
    """
    templates = runtime.state.get("templates", [])
    for t in templates:
        if t["id"] == template_id:
            return {
                "name": t["name"],
                "description": t["description"],
                "html": t["html"],
                "data_description": t["data_description"],
            }
    return {"error": f"Template with id '{template_id}' not found"}


@tool
def delete_template(template_id: str, runtime: ToolRuntime) -> Command:
    """
    Delete a saved UI template.

    Args:
        template_id: The ID of the template to delete
    """
    templates = list(runtime.state.get("templates", []))
    original_len = len(templates)
    templates = [t for t in templates if t["id"] != template_id]

    if len(templates) == original_len:
        return Command(update={
            "messages": [
                ToolMessage(
                    content=f"Template with id '{template_id}' not found",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        })

    return Command(update={
        "templates": templates,
        "messages": [
            ToolMessage(
                content=f"Template deleted successfully",
                tool_call_id=runtime.tool_call_id,
            )
        ],
    })


template_tools = [
    save_template,
    list_templates,
    apply_template,
    delete_template,
]
