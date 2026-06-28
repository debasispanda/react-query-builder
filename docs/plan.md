# JQL Query Builder MVP - Detailed Implementation Plan

## Overview

Build a React 18 JQL query builder supporting chained AND/OR clauses with auto-complete suggestions. Use Vite + shadcn/ui Popover + Command components, a regex-based tokenizer, and hardcoded schema for 4 fields (project, status, assignee, priority). Deliver unit + integration tests with Vitest + React Testing Library.

**Key Features**:
- ✅ Single & chained queries: `project = "Design" AND status = "ToDo" AND priority = "High"`
- ✅ Flexible quoting: `project = "My Project"` or `status = active` (quotes required only for values with spaces)
- ✅ Auto-complete suggestions for fields & operators based on cursor context
- ✅ Error handling for incomplete queries (e.g., `project =` without value)
- ✅ Keyboard navigation (arrows, Enter, Tab, Escape)
- ✅ Output both raw (user input) and normalized (standardized spacing) query strings
- ✅ Unit + integration test coverage

---

## Phase 1: Project Scaffolding

**Goal**: Set up Vite + React 18 + TypeScript project with build, dev, and test infrastructure.

### Substeps

- [x] Initialize Vite project with React 18 + TypeScript template
  - Command: `npm create vite@latest . -- --template react-ts`
- [x] Install core dependencies:
  - React UI: `shadcn-ui`, `@radix-ui/react-popover`, `cmdk`
  - Styling: `tailwindcss`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`
  - Testing: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
  - Command: `npm install shadcn-ui @radix-ui/react-popover cmdk tailwindcss postcss autoprefixer clsx tailwind-merge vitest @vitest/ui @testing-library/react @testing-library/user-event jsdom -D`
- [x] Initialize shadcn/ui: `npx shadcn@latest init`
- [x] Create folder structure:
  ```
  src/
  ├── components/
  │   ├── JQLEditor.tsx
  │   ├── QueryInput.tsx
  │   └── SuggestionPopover.tsx
  ├── utils/
  │   ├── schema.ts
  │   ├── tokenizer.ts
  │   ├── contextDetector.ts
  │   ├── suggestionProvider.ts
  │   ├── validator.ts
  │   └── queryBuilder.ts
  ├── types/
  │   └── jql.ts
  ├── __tests__/
  │   ├── tokenizer.test.ts
  │   ├── contextDetector.test.ts
  │   ├── validator.test.ts
  │   ├── queryBuilder.test.ts
  │   └── JQLEditor.integration.test.tsx
  ├── App.tsx
  └── main.tsx
  ```
- [x] Configure `vite.config.ts` for React
- [x] Configure `vitest.config.ts`:
  - Set environment to `jsdom`
  - Add `@testing-library/react` globals
  - Set up path alias for `@/` imports
- [x] Configure Tailwind CSS & PostCSS
- [x] Set up `package.json` scripts:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview",
      "test": "vitest",
      "test:ui": "vitest --ui"
    }
  }
  ```
- [x] Create root `App.tsx` with demo `<JQLEditor />` component wrapper
- [x] Verify `npm run dev` starts without errors
- [x] Verify `npm run test` runs Vitest in watch mode

**Success Criteria**:
- ✅ `npm run dev` launches Vite dev server on http://localhost:5173
- ✅ `npm run test` starts Vitest watch mode
- ✅ No TypeScript errors in `src/`
- ✅ All dependencies installed correctly
- ✅ Folder structure matches above layout

### Verification

- [x] `npm run dev` launches without errors
- [x] `npm run test` starts Vitest watch mode
- [x] Folder structure matches plan
- [x] All dependencies installed

---

## Phase 2: Data Model & Schema Definition

**Goal**: Define TypeScript types, hardcoded field/operator schema, and tokenization logic.

### Substeps

- [x] Create `src/types/jql.ts`:
  ```typescript
  export type TokenType = 'FIELD' | 'OPERATOR' | 'VALUE' | 'CONNECTOR' | 'UNKNOWN';
  
  export interface Token {
    value: string;
    type: TokenType;
  }
  
  export interface FieldDef {
    name: string;
    type: 'string' | 'number' | 'date';
    operators: string[];
  }
  
  export interface ParsedQuery {
    tokens: Token[];
    isValid: boolean;
    error?: string;
  }
  
  export interface QueryOutput {
    raw: string;
    normalized: string;
    tokens: Token[];
    isValid: boolean;
    error?: string;
  }
  ```

- [x] Create `src/utils/schema.ts`:
  ```typescript
  export const SCHEMA_FIELDS: FieldDef[] = [
    { name: 'project', type: 'string', operators: ['=', '!=', 'IN'] },
    { name: 'status', type: 'string', operators: ['=', '!=', 'IN'] },
    { name: 'assignee', type: 'string', operators: ['=', '!='] },
    { name: 'priority', type: 'string', operators: ['=', '!=', 'IN'] }
  ];
  
  export function getOperatorsForField(fieldName: string): string[] {
    const field = SCHEMA_FIELDS.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
    return field?.operators || [];
  }
  
  export function getFieldNames(): string[] {
    return SCHEMA_FIELDS.map(f => f.name);
  }
  
  export function isValidField(fieldName: string): boolean {
    return SCHEMA_FIELDS.some(f => f.name.toLowerCase() === fieldName.toLowerCase());
  }
  ```

- [x] Create `src/utils/tokenizer.ts`:
  - Use regex `/("[^"]*"|[^\s]+)/g` to split by unquoted spaces
  - Strip outer quotes from quoted strings but preserve content
  - Infer token type by position: 1st token = FIELD, 2nd = OPERATOR, 3rd+ = VALUE or CONNECTOR
  - Detect AND/OR/NOT as CONNECTOR type
  - Export function: `tokenize(input: string): Token[]`

- [x] Write tokenizer unit tests in `src/__tests__/tokenizer.test.ts`:
  - [x] Test simple: `project = "Marketing"` → 3 tokens (FIELD, OPERATOR, VALUE)
  - [x] Test with spaces in value: `project = "My Project"` → 3 tokens (VALUE includes space)
  - [x] Test without quotes: `status = active` → 3 tokens (single-word values unquoted)
  - [x] Test chained AND: `project = "Design" AND status = "ToDo"` → 7 tokens
  - [x] Test chained OR: `project = "Design" OR priority = "High"` → 7 tokens
  - [x] Test multiple spaces: `project  =  "value"` → 3 tokens (extra spaces normalized)
  - [x] Test edge case: empty string → empty token array
  - [x] Test edge case: trailing spaces → ignored

- [x] Verify all tokenizer tests pass: `npm run test`

**Success Criteria**:
- ✅ TypeScript types defined in `src/types/jql.ts`
- ✅ Schema with 4 hardcoded fields + operators in `src/utils/schema.ts`
- ✅ Tokenizer correctly splits queries with/without quotes
- ✅ Token types (FIELD, OPERATOR, VALUE, CONNECTOR) correctly inferred
- ✅ All tokenizer unit tests pass (8+ test cases)

### Verification

- [x] `src/types/jql.ts` defines all types
- [x] `src/utils/schema.ts` exports 4 hardcoded fields with operators
- [x] `src/utils/tokenizer.ts` correctly handles quotes, spaces, chaining
- [x] All tokenizer unit tests pass (8+ cases)

---

## Phase 3: Query Input Component

**Goal**: Build textarea component with cursor position tracking and context detection.

### Substeps

- [x] Create `src/utils/contextDetector.ts`:
  - Export function: `detectContext(tokens: Token[], cursorTokenIndex: number): 'FIELD' | 'OPERATOR' | 'VALUE'`
  - Logic: count complete token sequences; determine next expected type
  - Example: after tokens `[FIELD, OPERATOR]`, next context is VALUE
  - Example: after tokens `[FIELD, OPERATOR, VALUE]`, next context is FIELD (for new clause)

- [x] Create `src/components/QueryInput.tsx`:
  - Props: `value`, `onChange`, `onContextChange`, `isError`, `errorMessage`
  - Render `shadcn/ui Textarea` component
  - Track state: `queryText`, `cursorPos`
  - On input change: update `queryText`, re-tokenize, call `onContextChange(context)`
  - On keydown/click: update cursor position (`event.currentTarget.selectionStart`)
  - On blur: close suggestions popover
  - Apply CSS class `jql-input--error` if `isError` prop is true (red border)
  - Display error message below textarea if `errorMessage` provided

- [x] Write contextDetector unit tests in `src/__tests__/contextDetector.test.ts`:
  - [x] After 0 tokens → context is FIELD
  - [x] After 1 token (FIELD) → context is OPERATOR
  - [x] After 2 tokens (FIELD, OPERATOR) → context is VALUE
  - [x] After 3 tokens (FIELD, OPERATOR, VALUE) → context is FIELD (new clause)
  - [x] After 5 tokens (...FIELD, OPERATOR, VALUE, CONNECTOR, FIELD) → context is OPERATOR

- [x] Verify contextDetector tests pass

**Success Criteria**:
- ✅ QueryInput textarea renders and accepts user input
- ✅ Cursor position tracked on keystroke/click
- ✅ Context detection correctly identifies FIELD/OPERATOR/VALUE phases
- ✅ Error styling applied when `isError={true}`
- ✅ All contextDetector unit tests pass

### Verification

- [x] `src/components/QueryInput.tsx` renders textarea
- [x] Cursor position tracked on keystroke
- [x] `src/utils/contextDetector.ts` correctly identifies FIELD/OPERATOR/VALUE
- [x] All contextDetector tests pass

---

## Phase 4: Suggestion Popover & Dropdown UI

**Goal**: Build floating popover with suggestions filtered by context and partial match.

### Substeps

- [x] Create `src/utils/suggestionProvider.ts`:
  - Export function: `getSuggestions(context: 'FIELD' | 'OPERATOR' | 'VALUE', partial: string, currentField?: string): string[]`
  - Context FIELD: filter field names by case-insensitive partial match
    - Example: partial `pro` → suggestions `['project']`
  - Context OPERATOR: filter operators for current field by partial match
    - Example: field `project`, partial `i` → suggestions `['IN']`
  - Context VALUE: return empty array for MVP (values will be API-driven in future phases)
  - Use case-insensitive matching with `.toLowerCase().includes()`

- [x] Create `src/components/SuggestionPopover.tsx`:
  - Props: `isOpen`, `suggestions`, `onSelect`, `context`, `anchorEl` (for positioning)
  - Use `shadcn/ui Popover` + `Command` components from shadcn/ui library
  - Render `CommandList` with suggestions grouped by context (e.g., Fields, Operators)
  - Keyboard navigation: Arrow Up/Down to navigate, Enter/Tab to select, Escape to close
  - Mouse click to select suggestion
  - Highlight filtered suggestions based on partial match

- [x] Integrate SuggestionPopover with QueryInput:
  - Pass state from QueryInput to popover
  - On suggestion select: inject text into textarea at current cursor position
  - Update cursor position after injection
  - Re-tokenize and validate after injection

- [x] Write integration test for suggestion flow:
  - [x] User types `pro` in empty textarea → popover shows `project` suggestion
  - [x] User presses Enter → `project` injected into textarea
  - [x] Cursor positioned after `project`

**Success Criteria**:
- ✅ Popover opens when user types and context is FIELD/OPERATOR
- ✅ Suggestions filter correctly by partial match (case-insensitive)
- ✅ Keyboard navigation works (Arrow Up/Down, Enter, Tab, Escape)
- ✅ Mouse click selects suggestion
- ✅ Selected suggestion injects into textarea at cursor position
- ✅ Cursor positioned correctly after injection

### Verification

- [x] Popover opens when typing
- [x] Suggestions filter by partial match (e.g., `pro` → `project`)
- [x] Keyboard navigation works (arrows, Enter, Escape)
- [x] Selected suggestion injects into textarea

---

## Phase 5: Validation & Error Handling

**Goal**: Validate token sequence for incomplete queries and display errors.

### Substeps

- [x] Create `src/utils/validator.ts`:
  - Export function: `validate(tokens: Token[]): { isValid: boolean; error?: string }`
  - Validation rules for MVP:
    - Query must start with FIELD (or be empty)
    - Sequence must follow: FIELD → OPERATOR → VALUE
    - Cannot end mid-sequence (e.g., `project =` without VALUE is invalid)
    - For chained: pattern is `[FIELD OP VALUE] (CONNECTOR [FIELD OP VALUE])*`
    - Field name must be valid (check against SCHEMA_FIELDS)
    - Operator must be valid for that field (check against field's operators)
  - Error messages:
    - "Incomplete query: expected VALUE after operator"
    - "Invalid field name: unknown_field"
    - "Invalid operator: ~ for field project"
    - "Incomplete query: expected OPERATOR after field"

- [x] Create `src/components/JQLEditor.tsx` (main wrapper):
  - Combine QueryInput + SuggestionPopover
  - Manage state: `queryText`, `tokens`, `isValid`, `error`, `suggestions`, `cursorPos`, `context`
  - Props: `onValidChange` (callback when query validity changes), `onOutputChange` (emit QueryOutput)
  - Re-validate on every input change
  - Update error state and visual feedback

- [x] Write validator unit tests in `src/__tests__/validator.test.ts`:
  - [x] Empty query → valid (empty state)
  - [x] Complete single: `project = "Marketing"` → valid
  - [x] Incomplete single: `project =` → invalid, error message
  - [x] Incomplete single: `project` → invalid, error message
  - [x] Invalid field: `unknown_field = "value"` → invalid, error message
  - [x] Invalid operator: `project ~ "value"` → invalid, error message
  - [x] Valid chained: `project = "Design" AND status = "ToDo"` → valid
  - [x] Incomplete chained: `project = "Design" AND status =` → invalid, error message
  - [x] Invalid CONNECTOR: `project = "Design" XOR status = "ToDo"` → invalid, error message

- [x] Verify all validator tests pass

**Success Criteria**:
- ✅ Validator catches incomplete queries with specific error messages
- ✅ Validator catches invalid field/operator names
- ✅ Error state updates on every keystroke
- ✅ Error clears when query becomes valid
- ✅ JQLEditor component integrates input + popover + validation
- ✅ All validator unit tests pass (8+ test cases)

### Verification

- [x] All validator unit tests pass (8+ cases)
- [x] Incomplete queries show error with message
- [x] Error clears when query becomes valid
- [x] Invalid field/operator names caught

---

## Phase 6: Output Generation

**Goal**: Normalize spacing and build query output (both raw and normalized strings).

### Substeps

- [x] Create `src/utils/queryBuilder.ts`:
  - Export function: `buildQueryOutput(queryText: string, tokens: Token[], isValid: boolean): QueryOutput`
  - Normalize spacing: standardize to single spaces around operators and connectors
    - Example: `project="Marketing"` → `project = "Marketing"`
    - Example: `project  =  "value"` → `project = "value"`
    - Example: `project="Design"AND status="ToDo"` → `project = "Design" AND status = "ToDo"`
  - Preserve spaces inside quoted values: `"My Project"` stays as-is
  - Return object:
    ```typescript
    {
      raw: "user's original input",
      normalized: "standardized spacing",
      tokens: [...],
      isValid: boolean,
      error?: string
    }
    ```

- [x] Integrate output generation with JQLEditor:
  - Export method/callback `getOutput(): QueryOutput` to parent
  - Expose output for debugging/inspection

- [x] Write queryBuilder unit tests in `src/__tests__/queryBuilder.test.ts`:
  - [x] Spacing normalization: `project="Marketing"` → `project = "Marketing"`
  - [x] Multiple spaces: `project  =  "value"` → `project = "value"`
  - [x] Preserve quoted spaces: input `project = "My Project"` → output preserves `"My Project"`
  - [x] Chained query normalization: `project="Design"AND status="ToDo"` → `project = "Design" AND status = "ToDo"`
  - [x] Mixed spacing: normalize consistently

- [x] Verify all queryBuilder tests pass

**Success Criteria**:
- ✅ Output normalizes spacing correctly
- ✅ Quoted values with spaces preserved
- ✅ Both raw and normalized strings returned
- ✅ Output can be consumed by backend API
- ✅ All queryBuilder unit tests pass

### Verification

- [x] All queryBuilder tests pass
- [x] Spacing normalized correctly
- [x] Quoted spaces preserved
- [x] Both raw and normalized strings returned

---

## Phase 7: Integration Tests

**Goal**: Test end-to-end workflows from user input to output.

### Substeps

- [x] Write integration tests in `src/__tests__/JQLEditor.integration.test.tsx`:
  - [x] **Test 1**: User types complete single query → output is valid
    - Type: `project = "Marketing"`
    - Assert: `isValid === true`, output generated
  
  - [x] **Test 2**: User types incomplete query → error shown, invalid state
    - Type: `project =`
    - Assert: `isValid === false`, error message displayed ("Incomplete query...")
  
  - [x] **Test 3**: User deletes operator → error clears when complete
    - Type: `project = "Marketing"` → Delete `=` and space → Type `= "Marketing"`
    - Assert: Error shown during incomplete state, cleared when complete again
  
  - [x] **Test 4**: User selects suggestion from dropdown
    - Type: `pro` → Popover shows `project` → Press Enter or click
    - Assert: `project` injected into textarea, cursor positioned after
  
  - [x] **Test 5**: User types chained AND query → tokenizes correctly
    - Type: `project = "Design" AND status = "ToDo"`
    - Assert: 7 tokens with correct types, query valid
  
  - [x] **Test 6**: Keyboard navigation through suggestions
    - Type: `pro` → Popover opens → Press Arrow Down → Enter
    - Assert: Suggestion highlighted and selected correctly
  
  - [x] **Test 7**: User types invalid field → error caught
    - Type: `invalid_field = "value"`
    - Assert: `isValid === false`, error message: "Invalid field name: invalid_field"
  
  - [x] **Test 8**: User types invalid operator → error caught
    - Type: `project ~ "value"` (tilde not valid for project)
    - Assert: `isValid === false`, error message: "Invalid operator..."

- [x] Use React Testing Library:
  - Render `<JQLEditor />`
  - Use `userEvent` for typing, keyboard navigation, mouse clicks
  - Assert on textarea value, error display, suggestion list visibility, output validity

- [x] Verify all integration tests pass: `npm run test`

**Success Criteria**:
- ✅ All integration tests pass (8+ test cases)
- ✅ End-to-end workflows work: type → validate → select suggestions → output
- ✅ Error states shown and cleared correctly
- ✅ Keyboard and mouse navigation both functional

### Verification

- [x] All integration tests pass (8+ cases)
- [x] End-to-end workflows functional
- [x] Error handling end-to-end

---

## Key Decisions

✅ **Tokenization**: Regex `/("[^"]*"|[^\s]+)/g` (simple, efficient for MVP)  
✅ **Quoting**: Required only for values with spaces (`"My Project"` or `active`)  
✅ **Operators**: Hardcoded per field; no dynamic operators in MVP  
✅ **Values**: Empty suggestions for VALUE context; API-driven in future phases  
✅ **Output**: Both raw and normalized strings (flexibility for backend requirements)  
✅ **Testing**: Vitest + React Testing Library (Vite-native, modern, fast)  
✅ **UI Components**: Use shadcn/ui Popover + Command (ARIA-compliant, keyboard-accessible)  

---

## Files to Create

**Configuration**:
- `vite.config.ts`
- `vitest.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`

**Types**:
- `src/types/jql.ts`

**Utilities**:
- `src/utils/schema.ts`
- `src/utils/tokenizer.ts`
- `src/utils/contextDetector.ts`
- `src/utils/suggestionProvider.ts`
- `src/utils/validator.ts`
- `src/utils/queryBuilder.ts`

**Components**:
- `src/components/QueryInput.tsx`
- `src/components/SuggestionPopover.tsx`
- `src/components/JQLEditor.tsx`

**Tests**:
- `src/__tests__/tokenizer.test.ts`
- `src/__tests__/contextDetector.test.ts`
- `src/__tests__/validator.test.ts`
- `src/__tests__/queryBuilder.test.ts`
- `src/__tests__/JQLEditor.integration.test.tsx`

**Root**:
- `src/App.tsx`
- `src/main.tsx`

---

## Future Enhancements (Post-MVP)

1. **Parentheses & Grouping**: Support `(A AND B) OR C` for complex logic
2. **Value Suggestions from API**: Fetch actual users, statuses, projects from backend
3. **Saved Queries**: Save, name, and reload previously constructed queries
4. **Advanced Mode**: Toggle between form-based builder (current) and raw JQL text editor
5. **Syntax Highlighting**: Color-code fields (blue), operators (green), values (grey)
6. **Functions**: Support JQL functions like `currentUser()`, `now()`, `startOfDay()`
7. **Copy to Clipboard**: Quick action to copy normalized query string