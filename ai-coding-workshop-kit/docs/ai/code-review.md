# AI Code Review Checklist

Review the diff using these perspectives.

## 1. Correctness

- Does the code satisfy `docs/specs/member-discount.md`?
- Are boundary values handled correctly?
- Are invalid inputs handled correctly?

## 2. Architecture

- Is business logic kept in services?
- Are controllers limited to request/response handling?
- Are unrelated responsibilities mixed together?

## 3. Compatibility

- Did the public API response format change unexpectedly?
- Were unrelated files modified?

## 4. Tests

- Are normal cases covered?
- Are boundary cases covered?
- Are invalid inputs covered?
- Do the tests fail before production code is implemented and pass afterward?

## 5. Maintainability

- Is the implementation simple?
- Are names clear?
- Is there unnecessary abstraction?

## 6. Security and safety

- Were dependencies added?
- Were risky commands or environment files touched?
- Were secrets or `.env` files read or modified?
