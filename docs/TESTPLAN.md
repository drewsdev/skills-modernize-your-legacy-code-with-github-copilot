# Student Account COBOL Test Plan

This test plan covers the current business logic and implementation behavior of the COBOL application so results can be validated with business stakeholders and reused for Node.js unit/integration test design.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Main menu displays all options | Application compiled as `accountsystem` | 1. Run `./accountsystem` | Menu is shown with options 1 (View Balance), 2 (Credit Account), 3 (Debit Account), 4 (Exit) | TBD during execution | TBD | Verifies entry-point behavior in MainProgram |
| TC-002 | Exit option ends the session | App is running at main menu | 1. Enter `4` | Program exits loop and displays `Exiting the program. Goodbye!` | TBD during execution | TBD | Validates `CONTINUE-FLAG` stop condition |
| TC-003 | Invalid menu choice is rejected | App is running at main menu | 1. Enter `9` 2. Observe response | Message `Invalid choice, please select 1-4.` is displayed and menu continues | TBD during execution | TBD | Covers `WHEN OTHER` branch |
| TC-004 | View balance returns default initial balance | Fresh app run (new process) | 1. Enter `1` 2. Enter `4` to exit | Displayed balance is `1000.00` (or equivalent COBOL numeric display for 1000.00) | TBD during execution | TBD | Confirms DataProgram initial `STORAGE-BALANCE` |
| TC-005 | Credit increases balance by entered amount | Fresh app run | 1. Enter `2` 2. Enter `200.00` 3. Enter `1` | New balance after credit is `1200.00` and view balance shows same value | TBD during execution | TBD | Validates READ -> ADD -> WRITE flow |
| TC-006 | Multiple credits are cumulative | Fresh app run | 1. Enter `2`, amount `100.00` 2. Enter `2`, amount `50.00` 3. Enter `1` | Displayed balance becomes `1150.00` | TBD during execution | TBD | Confirms repeated WRITE updates |
| TC-007 | Debit with sufficient funds reduces balance | Fresh app run | 1. Enter `3` 2. Enter `250.00` 3. Enter `1` | Debit succeeds; resulting balance is `750.00` | TBD during execution | TBD | Validates sufficient-funds branch |
| TC-008 | Debit equal to current balance is allowed | Fresh app run | 1. Enter `3` 2. Enter `1000.00` 3. Enter `1` | Debit succeeds and resulting balance is `0.00` | TBD during execution | TBD | Boundary condition for `FINAL-BALANCE >= AMOUNT` |
| TC-009 | Debit with insufficient funds is rejected | Fresh app run | 1. Enter `3` 2. Enter `1000.01` 3. Enter `1` | Message `Insufficient funds for this debit.` and balance remains `1000.00` | TBD during execution | TBD | Confirms no WRITE on insufficient funds |
| TC-010 | Balance inquiry reflects latest committed state | Fresh app run | 1. Enter `2`, amount `300.00` 2. Enter `3`, amount `125.00` 3. Enter `1` | Balance shown is `1175.00` | TBD during execution | TBD | Covers combined credit/debit sequence |
| TC-011 | Balance persists during one running session | App is running | 1. Enter `2`, amount `10.00` 2. Return to menu and enter `1` multiple times | Same updated balance is shown consistently during same process lifetime | TBD during execution | TBD | Confirms in-memory persistence while app runs |
| TC-012 | Balance resets on new application run | Complete TC-005 first, then exit app | 1. Restart `./accountsystem` 2. Enter `1` | Balance resets to `1000.00` on new process start | TBD during execution | TBD | Confirms no external persistence |
| TC-013 | Amount precision supports two decimal places | Fresh app run | 1. Enter `2`, amount `0.25` 2. Enter `1` | Balance increases to `1000.25` (2-decimal precision retained) | TBD during execution | TBD | Aligns with `PIC 9(6)V99` amount format |
| TC-014 | Operation routing maps menu options to correct behavior | Fresh app run | 1. Enter `1` 2. Enter `2` with `10.00` 3. Enter `3` with `5.00` 4. Enter `4` | Option 1 shows balance, option 2 credits, option 3 debits, option 4 exits | TBD during execution | TBD | End-to-end mapping of MainProgram to Operations |

## Traceability to Current Business Rules

- Initial balance set to 1000.00: TC-004, TC-012
- Balance inquiry via READ: TC-004, TC-010
- Credit updates persisted balance: TC-005, TC-006, TC-010
- Debit requires sufficient funds: TC-007, TC-008, TC-009
- Insufficient debit does not update balance: TC-009
- Runtime in-memory storage behavior: TC-011, TC-012
- Menu and routing behavior in main loop: TC-001, TC-002, TC-003, TC-014
