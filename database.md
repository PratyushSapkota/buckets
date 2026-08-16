# `buckets`


| Column       | Type          | Constraints | Description                 |
| ------------ | ------------- | ----------- | --------------------------- |
| `id`         | `uuid`        | Primary Key | Bucket identifier           |
| `user_id`    | `uuid`        | NOT NULL    | Owner of the bucket         |
| `name`       | `text`        | NOT NULL    | Display name                |
| `type`       | `text`        | NOT NULL    | Type of financial account   |
| `currency`   | `text`        | NOT NULL    | Currency used by the bucket |
| `color`      | `text`        | NULL        | Display color               |
| `closed_at`  | `timestamptz` | NULL        | When the bucket was closed  |
| `created_at` | `timestamptz` | NOT NULL    | Creation time               |
| `updated_at` | `timestamptz` | NOT NULL    | Last modification time      |

A bucket is open when `closed_at` is `NULL`.

---

# `accounts`


| Column       | Type          | Constraints                 | Description                   |
| ------------ | ------------- | --------------------------- | ----------------------------- |
| `id`         | `uuid`        | Primary Key                 | Account identifier            |
| `user_id`    | `uuid`        | NOT NULL                    | Owner of the account          |
| `bucket_id`  | `uuid`        | FK → `buckets.id`, NOT NULL | Bucket containing the account |
| `name`       | `text`        | NOT NULL                    | Display name                  |
| `closed_at`  | `timestamptz` | NULL                        | When the account was closed   |
| `created_at` | `timestamptz` | NOT NULL                    | Creation time                 |
| `updated_at` | `timestamptz` | NOT NULL                    | Last modification time        |

An account is open when `closed_at` is `NULL`.


---

# `categories`


| Column       | Type          | Constraints | Description            |
| ------------ | ------------- | ----------- | ---------------------- |
| `id`         | `uuid`        | Primary Key | Category identifier    |
| `user_id`    | `uuid`        | NOT NULL    | Owner of the category  |
| `name`       | `text`        | NOT NULL    | Category name          |
| `color`      | `text`        | NULL        | Display color          |
| `created_at` | `timestamptz` | NOT NULL    | Creation time          |
| `updated_at` | `timestamptz` | NOT NULL    | Last modification time |

---

# `transactions`

| Column        | Type          | Constraints | Description                                      |
| ------------- | ------------- | ----------- | ------------------------------------------------ |
| `id`          | `uuid`        | Primary Key | Transaction identifier                           |
| `user_id`     | `uuid`        | NOT NULL    | Owner of the transaction                         |
| `type`        | `text`        | NOT NULL    | `income`, `expense`, `transfer`, or `adjustment` |
| `description` | `text`        | NULL        | Optional description                             |
| `occurred_at` | `timestamptz` | NOT NULL    | When the financial event occurred                |
| `created_at`  | `timestamptz` | NOT NULL    | Creation time                                    |
| `updated_at`  | `timestamptz` | NOT NULL    | Last modification time                           |


---

# `transaction_entries`

| Column           | Type     | Constraints                      | Description                           |
| ---------------- | -------- | -------------------------------- | ------------------------------------- |
| `id`             | `uuid`   | Primary Key                      | Entry identifier                      |
| `transaction_id` | `uuid`   | FK → `transactions.id`, NOT NULL | Parent transaction                    |
| `account_id`     | `uuid`   | FK → `accounts.id`, NOT NULL     | Account whose balance is affected     |
| `category_id`    | `uuid`   | FK → `categories.id`, NULL       | Optional transaction category         |
| `amount`         | `bigint` | NOT NULL                         | Signed amount in minor currency units |

---

## Relationships
    bucket
      └── accounts
            └── transaction_entries
                  ├── transaction
                  └── category

A bucket can contain many accounts.

An account can contain many transaction entries.

A transaction can contain one or more transaction entries.

A category can be referenced by many transaction entries.

All relationships must remain within the same owner.

---
