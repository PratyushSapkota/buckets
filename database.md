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

| Column                | Type                                | Constraints                  | Description                                      |
| --------------------- | ----------------------------------- | ---------------------------- | ------------------------------------------------ |
| `id`                  | `uuid`                              | Primary Key                  | Transaction identifier                           |
| `description`         | `text`                              | NULL                         | Optional description                             |
| `amount`              | `integer`                           | NOT NULL, greater than `0`   | Amount in minor currency units                   |
| `type`                | `enum(credit, debit, transfer)`     | NOT NULL                     | How the transaction affects the account          |
| `category_id`         | `uuid`                              | FK → `categories.id`, NULL   | Optional category; normally `NULL` for transfers |
| `account_id`          | `uuid`                              | FK → `accounts.id`, NOT NULL | Account credited, debited, or transferred from   |
| `transfer_account_id` | `uuid`                              | FK → `accounts.id`, NULL     | Destination account for a transfer               |
| `occurred_at`         | `timestamptz`                       | NULL                         | When the financial event occurred                |


`transfer_account_id` must be present only for transfers and must differ from
`account_id`.

---

## Relationships
    bucket
      └── accounts
            ├── transactions
            └── incoming transfers

    category
      └── transactions

A bucket can contain many accounts.

An account can be referenced by many transactions through `account_id`.

An account can receive many transfers through `transfer_account_id`.

A category can be referenced by many transactions.

All relationships must remain within the same owner.

Account balances are derived from transactions:
    credits - debits - outgoing transfers + incoming transfers

---
