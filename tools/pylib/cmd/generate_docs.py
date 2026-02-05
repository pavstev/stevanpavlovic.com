import re
from pathlib import Path
from typing import Annotated

import typer
from smolagents import CodeAgent, HfApiModel

# Assuming your rich console setup is similar to the SVG tool
from ..core.common import console

app = typer.Typer()

# Idiomatic path resolution
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
README_PATH = PROJECT_ROOT / "README.md"


def inject_into_readme(new_content: str) -> None:
    """Safely updates the README.md using strict boundary markers and modern pathlib I/O."""
    README_PATH.touch(exist_ok=True)
    current_md = README_PATH.read_text(encoding="utf-8")

    marker_start, marker_end = "<!-- AUTOGEN-DOCS-START -->", "<!-- AUTOGEN-DOCS-END -->"

    wrapped_content = (
        f"{marker_start}\n"
        f"## 🤖 System Architecture Overview\n\n"
        f"> *This section is automatically maintained by the `pylib/cmd/docgen.py` AI Agent.*\n\n"
        f"{new_content}\n"
        f"{marker_end}"
    )

    if marker_start in current_md and marker_end in current_md:
        pattern = re.compile(rf"{re.escape(marker_start)}.*?{re.escape(marker_end)}", re.DOTALL)
        updated_md = pattern.sub(wrapped_content, current_md)
    else:
        updated_md = f"{current_md.strip()}\n\n---\n\n{wrapped_content}\n"

    README_PATH.write_text(updated_md, encoding="utf-8")


def run_once(model_id: str) -> None:
    """Run document generation once."""
    console.print("[bold blue]🚀 Initializing Context-Aware Documentation Agent...[/bold blue]")

    try:
        # We explicitly authorize file-system libraries so the agent can read files natively
        agent = CodeAgent(
            model=HfApiModel(model_id=model_id),
            tools=[],
            add_base_tools=True,
            additional_authorized_imports=["pathlib", "os"],
        )

        system_prompt = (
            f"You are an expert Principal Software Engineer. The monorepo root is {PROJECT_ROOT}.\n"
            "Your task is to write a concise 'Architecture & Connectivity' overview for the README.md.\n\n"
            "STEPS TO EXECUTE:\n"
            "1. Write and execute Python code to read `pnpm-workspace.yaml`, `astro.config.ts`, and `pylib/core/watcher.py`.\n"
            "2. Synthesize how the Python backend tools in `pylib` power the Astro/React frontend in `src`.\n"
            "3. Return EXACTLY 3 well-formatted Markdown paragraphs and a short bulleted list summarizing the Dev Data Flow.\n"
            "Use the `final_answer` tool to submit only the resulting Markdown."
        )

        console.print(
            "[yellow]🧠 Agent is actively writing Python code to explore your codebase...[/yellow]"
        )
        final_markdown = agent.run(system_prompt)

        console.print("[cyan]📝 Injecting newly generated context into README.md...[/cyan]")
        inject_into_readme(final_markdown)
        console.print("[bold green]✅ Documentation successfully updated![/bold green]")

    except Exception as e:
        console.print(f"[bold red]❌ An error occurred during the agentic workflow: {e}[/bold red]")


@app.command()
def main(
    model_id: Annotated[
        str, typer.Option("--model", "-m", help="HuggingFace model ID to use")
    ] = "meta-llama/Llama-3.3-70B-Instruct",
    watch: Annotated[
        bool, typer.Option("--watch", "-w", help="Watch for changes (Not implemented for docgen)")
    ] = False,
) -> None:
    """
    Generate context-aware architecture documentation using an AI Agent.
    """
    if watch:
        console.print("[red]Watch mode not supported for docgen.[/red]")
        raise typer.Exit(1)
    else:
        run_once(model_id)
