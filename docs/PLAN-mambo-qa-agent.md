# Mambo QA Agent - Implementation Plan

## Goal Description
Create a CLI tool (`scripts/ai-test-runner.ts`) that autonomously generates, executes, and fixes Maestro E2E tests based on natural language prompts. This tool aims to reduce the maintenance burden of E2E testing in Mambo by using an agentic loop that understands the app's context (testIDs, navigation) and self-corrects based on execution errors.

## User Review Required
> [!IMPORTANT]
> **Prerequisite**: This tool assumes `maestro` is installed and a simulator/emulator is **already running**. The tool will not start the simulator for you in v1.

> [!WARNING]
> **Token Usage**: The tool sends simplified file contents to the LLM. While optimized, heavy usage will consume Gemini tokens.

## Proposed Changes

### Scripts & Logic
#### [NEW] [mambo-qa](file:///c:/Users/marti/Visual/App%20fitness/mambo/scripts/mambo-qa/)
New directory to contain the agent logic, separating it from general scripts.

#### [NEW] [context_loader.ts](file:///c:/Users/marti/Visual/App%20fitness/mambo/scripts/mambo-qa/context_loader.ts)
Responsible for:
1.  Reading existing Maestro YAMLs (Few-shot examples).
2.  Scanning `app/**/*.tsx` for `testID` props to map available interactable elements.
3.  Preparing the "System Prompt" with this context.

#### [NEW] [llm_client.ts](file:///c:/Users/marti/Visual/App%20fitness/mambo/scripts/mambo-qa/llm_client.ts)
Wrapper around Google Generative AI SDK to handle:
-  Zero-shot / Few-shot prompting.
-  JSON mode for structured steps (if needed) or raw YAML generation.

#### [NEW] [runner.ts](file:///c:/Users/marti/Visual/App%20fitness/mambo/scripts/mambo-qa/runner.ts)
The execution engine:
1.  Writes the generated YAML to a temporary file.
2.  Runs `maestro test <temp_file>`.
3.  Captures `stdout` (success) or `stderr` (failure).
4.  If failure: Feeds error back to `llm_client.ts` for re-generation (Max 3 retries).

#### [NEW] [index.ts](file:///c:/Users/marti/Visual/App%20fitness/mambo/scripts/ai-test-runner.ts)
The main entry point (CLI):
-  Accepts user prompt via argument or interactive input.
-  Orchestrates the `Context -> Generate -> Run -> Fix` loop.

### Configuration
#### [MODIFY] [package.json](file:///c:/Users/marti/Visual/App%20fitness/mambo/package.json)
-  Add script `"test:ai": "ts-node scripts/ai-test-runner.ts"`.

## Verification Plan

### Automated Verification
-  **Unit Tests**: Not strictly applicable for the agent logic itself in v1, but we can verify the parsers.
-  **Self-Correction Test**:
    1.  We will provide a prompt that is *slightly* wrong (e.g. "Click the button that doesn't exist").
    2.  The agent should fail, see the error, and attempt to find a valid button or report failure gracefully.

### Manual Verification
1.  **Scenario: Usage Streak**:
    -  Run: `npm run test:ai -- "Verify that finishing a workout updates the streak"`
    -  Expectation: Agent generates a YAML that navigates `Workout -> Finish -> Home`, asserts Streak element visibility.
    -  Result: Maestro runs successfully (Green checkmarks).
