# Member Discount API Specification

## Goal

Add an API that returns a member rank and discount rate from monthly purchase amount.

## Endpoint

```text
GET /discount?amount=50000
```

## Successful response example

```json
{
  "rank": "gold",
  "discountRate": 0.05
}
```

## Rank rules

| amount | rank | discountRate |
|---:|---|---:|
| 0 - 9999 | bronze | 0 |
| 10000 - 49999 | silver | 0.03 |
| 50000 - 99999 | gold | 0.05 |
| 100000 or more | platinum | 0.1 |

## Invalid input

Return HTTP 400 for:

- missing `amount`
- non-numeric `amount`
- negative `amount`
- decimal `amount`

## Architecture expectation

- Define the route in `src/routes/`.
- Keep HTTP request/response handling in `src/controllers/`.
- Keep member discount business rules in `src/services/`.
- Add tests under `tests/`.
