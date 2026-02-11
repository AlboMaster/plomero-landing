# Trinity Configuration Documentation

## Overview
`trinity_config.json` defines the operational hierarchy and protocols for TRINITY_ENG|v3.0—a three-tier system designed for maximum impact with minimal token consumption.

## File Structure

### SYSTEM_CORE
Root object containing the entire system definition.

- **ID** (string): System identifier. Format: `TRINITY_ENG|v<major>.<minor>` (e.g., `TRINITY_ENG|v3.0`)
- **OBJECTIVE** (string): Core optimization metrics. Example: `MAX_IMPACT+MIN_TOKEN`

### HIERARCHY
Three-tier operational structure:

#### TIER_1_STRATEGY (MEPHISTO - CEO/VISION)
- **ID**: `MEPHISTO`
- **ROLE**: `CEO|VISION`
- **INPUT**: User requirements/desires
- **OUTPUT**: Strategic directives
- **MODE**: `RUTHLESS_EFFICIENCY`
- **Purpose**: Takes high-level user intent and converts to actionable strategy

#### TIER_2_ARCHITECT (DAEDALUS - CTO/PLANNER)
- **ID**: `DAEDALUS`
- **ROLE**: `CTO|PLANNER`
- **INPUT**: Strategic directives from TIER_1
- **OUTPUT**: Structured JSON blueprints
- **CONSTRAINT**: `NO_LOOPS|REUSE_PATTERNS` (optimize for efficiency)
- **Purpose**: Breaks down strategy into concrete, reusable execution plans

#### TIER_3_EXECUTION (DEVIN_LITE - INTERN/CODER)
- **ID**: `DEVIN_LITE`
- **ROLE**: `INTERN|CODER`
- **INPUT**: Blueprints from TIER_2
- **OUTPUT**: Code files/artifacts
- **LIMITS**: `4_ACU|AUTO_STOP_ON_ERR` (4 ACU budget, auto-stop on errors)
- **Purpose**: Executes blueprints and produces deliverables

### PROTOCOLS
System-wide operational guidelines:

#### TOKEN_ECONOMY
Controls efficiency and output format:
- **COMPRESSION**: `TRUE|FALSE` - Enable compression for token savings
- **STYLE**: `STENOGRAPHY` - Abbreviated, high-density communication
- **RESPONSE_FMT**: `JSON_ONLY|NO_PROSE` - Output format (JSON preferred, no narrative)

#### QUALITY_GATE
QA checkpoints:
- **BEFORE_RUN**: `DAEDALUS_CHECK(PLAN)` - Validate plan before execution
- **AFTER_RUN**: `TEST_PASS?COMMIT:ROLLBACK` - Test results determine commit/rollback

#### MEMORY_MGT
Context and token management:
- **TRIGGER**: `CTX>80%` - When context usage exceeds 80%
- **ACTION**: `COMPRESS_TO_STATE_OBJ` - Compress state into compact object

## Schema Validation

A JSON Schema (`trinity_config.schema.json`) is included to validate the configuration:

```powershell
# Validate using a JSON validator (e.g., online tools or VS Code extensions)
# Schema enforces:
# - All required fields present
# - Correct data types
# - TIER_1/2/3 structure compliance
# - PROTOCOL subsections complete
```

## Usage Example

To read and act on this configuration:

1. Load `trinity_config.json`
2. Extract `SYSTEM_CORE.OBJECTIVE` for high-level goals
3. Follow `HIERARCHY` tier order: MEPHISTO → DAEDALUS → DEVIN_LITE
4. Apply `PROTOCOLS` rules during execution:
   - Minimize tokens (TOKEN_ECONOMY)
   - Check quality gates (QUALITY_GATE)
   - Monitor context usage (MEMORY_MGT)

## Files

- `trinity_config.json` - Configuration data
- `trinity_config.schema.json` - JSON Schema for validation
- This README

---
**Version**: 3.0 | **Last Updated**: February 2026
