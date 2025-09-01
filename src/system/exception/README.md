# 📑 Exception Handling Contract

This document defines how our services handle, log, and expose exceptions.  
The goal is to provide **consistent error signals** across services while keeping logs safe and useful for debugging.

---

## 🔹 Error Code Structure

Error codes are **stable identifiers** that describe the cause of a failure.  
They are designed for **machine handling** (caller logic, retries, UI decisions), not just human readability.

- **Format:**  
```

<CATEGORY>*<CONTEXT>*<DETAIL>

````
Example:
- `ORDER_ALREADY_PROCESSED`
- `PAYMENT_CARD_EXPIRED`
- `AUTH_UNAUTHORIZED`

- **Categories:**

| Category  | Purpose                        | Example Codes                  |
|-----------|--------------------------------|--------------------------------|
| INPUT     | Invalid or missing request data | `INPUT_INVALID_FIELD`          |
| AUTH      | Authentication / authorization  | `AUTH_FORBIDDEN`, `AUTH_EXPIRED` |
| BUSINESS  | Domain/business rule violation | `ORDER_ALREADY_PROCESSED`      |
| RESOURCE  | Missing or locked resources    | `RESOURCE_NOT_FOUND`           |
| SYSTEM    | Technical/internal failures    | `SYSTEM_TIMEOUT`, `SYSTEM_DOWN` |
| UNKNOWN   | Catch-all for uncategorized    | `UNKNOWN_ERROR`                |

---

## 🔹 Logging vs. Exposing

### Logging (internal)
- Log **full context** for debugging:
- Request metadata (requestId, service, method, duration)
- Error code & category
- Exception stack trace
- **Sensitive fields must be redacted**:
- Passwords, tokens, API keys
- Credit card numbers, CVV, bank account info
- Personal data (email, phone, address) unless anonymized

### Exposing (to caller)
- Expose **only safe, structured error contract**:
```json
{
  "code": "ORDER_ALREADY_PROCESSED",
  "message": "Order has already been processed",
  "category": "BUSINESS"
}
````

* Do not expose:

    * Internal stack traces
    * Database errors
    * Vendor/system exception details

---

## 🔹 Registry / Governance

To keep error codes consistent across services:

* **Central Registry**:
  All error codes are defined in a shared package (e.g. `common/error-codes.ts` or `error.proto`).

* **Review Process**:

    * New error codes require review in PRs.
    * Avoid duplicates and ambiguous naming.

* **Immutability**:

    * Once published, codes must not change.
    * Only add new codes when needed.

---

## 🔹 Why Business Exceptions?

Business exceptions represent **expected domain-level failures**.
They are **not system bugs**, but rule violations that the caller can handle gracefully.

Examples:

* Trying to pay with an expired card → `PAYMENT_CARD_EXPIRED`
* Submitting an already completed order → `ORDER_ALREADY_PROCESSED`

These allow:

* **Frontends** to show user-friendly messages.
* **Other services** to branch logic (skip, retry, compensate).
* **Clear separation** between *business failures* and *system failures*.

---

## 🔹 Handling HTTP & Other Errors

* **HTTP errors** (400, 401, 404, 500, …) and **gRPC status codes** are mapped to our **error code categories**.
* **Third-party library errors** (database, cache, network) are caught, logged, and wrapped into a consistent `SYSTEM_*` or `RESOURCE_*` error.
* **Logging** ensures we keep raw details for debugging internally.
* **Exposing** ensures callers only see safe, structured errors.

---

## ✅ Summary

* **Error codes** are stable, machine-readable identifiers.
* **Logs** contain full details (with sensitive fields redacted).
* **Exposed errors** contain structured, safe error contracts.
* **Registry/governance** prevents chaos and ensures consistency.
* **Business exceptions** make domain failures explicit and actionable.

```

---

Do you want me to also include a **diagram** (sequence of: exception thrown → filter maps it → log raw → expose clean) so it’s super easy for new devs to grasp?
```
