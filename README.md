# Virtually creating accounts inside financial accounts.

The goal is to represent real-world financial accounts while also allowing me to create virtual accounts inside them for mental organization.

*This project is primarily for me. Scalability is therefore not a major design priority.*

[database](./database.md)

## Core Concepts

* **Buckets**
I use the term `buckets` quite often in this project. A bucket represents a real-world place where money exists, such as a bank account, cash, or PayPal. A bucket can contain multiple virtual accounts.

* **Accounts**
Accounts are virtual accounts I create inside a bucket. They do not represent separate real-world financial accounts. Instead, they logically divide the money contained within a bucket. Each account belongs to exactly one bucket.

* **Transactions**
A transaction represents one financial event from my perspective. Transactions can represent income, expenses, transfers, or adjustments. Transfers should appear as a single transaction in the frontend.

* **Transaction Entries**
Transaction entries represent the actual movement of money caused by a transaction. A normal income or expense will usually have one entry. A transfer will normally have two: a negative entry from the source account and a positive entry into the destination account.


## Design Choices

* **Balances**

Balances should not be stored as the primary source of truth. An account's balance should be derived from its transaction entries. A bucket's balance can then be derived from the accounts inside it. Since this project is primarily for me, calculating balances from transaction history is acceptable. A cached balance can be introduced later if it ever becomes useful.

* **Authentication and Ownership**

Supabase is currently used for authentication, with the intention of being able to migrate to a self-hosted database and authentication solution later. The client should never be trusted to provide record ownership. My authenticated identity is determined on the Next.js server through `requireAuth()`, and that identity is used for database operations.

Database access should happen through the server rather than directly from the browser.

* **Database Independence**

Supabase-specific database features should be avoided where practical, particularly RPC functions containing application business logic.

Multi-step operations such as transfers should instead use normal database transactions through the server-side database layer.

The application should interact with the database through its own `db` abstraction. This keeps the rest of the application independent of the database provider and makes a future migration easier.


## Business Rules

### Ownership

- Buckets, accounts, categories, and transactions belong exclusively to the authenticated account that created them.
- Nothing can be shared between authenticated accounts.
- An account can only belong to a bucket owned by the same person.
- Transactions can only reference accounts and categories owned by the same person.

### Transfers

- Money can only be transferred between accounts owned by the same person.
- The source and destination accounts may belong to different buckets.
- Both sides of a transfer must be created, edited, or deleted atomically.

### Accounts

- Accounts can be edited.
- Accounts cannot be deleted.
- Accounts can be closed and reopened.
- Closing an account does not affect its transaction history.

### Buckets

- Buckets can be edited.
- Buckets cannot be deleted.
- A bucket can only be closed when all accounts inside it are closed.
- Buckets can be reopened.

### Transactions

- Transactions can be edited and deleted.
- Deleting a transaction also deletes its associated transaction entries.
- Changes to a transaction and its entries must happen atomically.

### Money and Balances

- Monetary amounts are stored as integer minor units rather than floating-point values.
- Account balances are derived from transaction entries rather than stored as the primary source of truth.
- Bucket balances are derived from the accounts contained within them.