# Task 02: Add Tests Only

Read:

- `AGENTS.md`
- `docs/specs/member-discount.md`

Task:
Add tests for the Member Discount API.

Important:
Do not implement production code yet.

Test cases:

- `amount=0` returns `bronze`, `0`
- `amount=9999` returns `bronze`, `0`
- `amount=10000` returns `silver`, `0.03`
- `amount=49999` returns `silver`, `0.03`
- `amount=50000` returns `gold`, `0.05`
- `amount=99999` returns `gold`, `0.05`
- `amount=100000` returns `platinum`, `0.1`
- missing `amount` returns 400
- non-numeric `amount` returns 400
- negative `amount` returns 400
- decimal `amount` returns 400

After adding tests:

1. Run `npm test`
2. Confirm the new tests fail
3. Explain what each test guarantees
