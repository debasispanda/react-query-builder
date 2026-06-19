# JQL

JQL is a react component where user can write queries like JIRA QUERY LANGUAGE.

e.g: "project = "Design" AND status = ToDo and priority = High OR priority ORDER BY created DESC"

## Core Components

1. Field - The field you want to query. E.g - project, status etc.
2. Operator - Used for connecting field with value. e.g - (=, !=, >, IN, WAS, ~, AND, OR, NOT, ORDER BY)
3. Value - Expected value of the field

## Business Requirement 

### MVP (Minimum Viable Product)
The goal for the MVP is to deliver a functional, hard-coded query builder that allows users to create basic Field + Operator + Value statements without breaking.

- Basic Auto-complete Dropdown: Triggered on focus or as the user types.

    - Supports a limited, hard-coded list of Fields (e.g., project, status, assignee).

    - Supports basic Operators based on the field type (e.g., =, !=, IN).

- Plain Text Value Input: Users manually type the value (no nested dropdowns for values yet).

- Single-Clause Logic: Supports a single query condition (e.g., project = "Marketing").

- Basic Validation & Error Handling: Visual cue (like a red underline) if the query syntax is incomplete or invalid.

- Output Query String: A developer-facing requirement: the component must output a clean text string to be sent to the backend.

## Complete Product

The goal for the complete product is to match Jira’s native capability: rich data fetching, complex logic, and a flawless user experience.

- Dynamic Data Fetching (Async Loading):
    - Fields, operators, and values are fetched dynamically via API (e.g., typing assignee = fetches a list of actual users from the database).

- Advanced Logical Operators:
    - Support for chaining multiple clauses using AND, OR, and NOT.
    - Support for grouping using parentheses () to dictate order of operations.

- Smart Auto-complete & Syntax Highlighting:
    - Color-coded text (e.g., Fields in blue, Operators in green, Values in grey).
    - Smart suggestions that know what comes next (if a user types a field, suggest operators; if they type an operator, suggest values).

- Functions Support:
    - Support for dynamic JQL functions like currentUser(), now(), or startOfDay().

- Keyboard Navigation:
    - Fully accessible via keyboard (Arrow keys to navigate dropdowns, Enter to select, Tab to move forward).

- Recent / Saved Searches:
    - Ability to save a constructed query string, name it, and reload it later.

- Switchable UI Modes:
    - Ability to toggle between Basic Mode (form-based dropdown builders) and Advanced Mode (the actual JQL text bar).