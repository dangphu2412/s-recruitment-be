# Member management Backend Project

## Installation

```bash
$ pnpm
```

## Running the app

```bash
# development
$ pnpm start

# watch mode
$ pnpm start:dev

# production mode
$ pnpm start:prod
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```

## Architecture Decision
N-Tier Architecture
Domain Driven Design

Naming Terminology
- Entity: Database Model
```typescript
// Just name it as it is
// bad
class UserEntity {}

// Good
class User {}
```
- DTO: Data Transfer Object
Which is known as an object transfer across the layers
Pattern: [name]DTO
```typescript
// Postfix with DTO
// bad
class User {}

// Good
class UserDTO {}
```
- Incoming request - response communication via network
Pattern: [name]Request, [name]Response
```typescript
// Postfix with Request, Response
// bad
class User {}

// Good
class UserRequest {}
class UserResponse {}
```

When the business give us the small complexity, we can use the following pattern:
N-Tier Architecture
- Controller: Presentation layer
- Service: Business logic
- Repository: Data access layer
Share the same DTO between layers

When the business give us the medium complexity, we can use the following pattern:
Domain Driven Design
- Entity: Database Model
- Repository: Data access layer
- Service: Business logic
- Controller: Presentation layer
- DTO: Data Transfer Object
- Mapper: Convert between Entity and DTO

When the business give us the large complexity, we can use the following pattern:
Domain Driven Design
- Entity: Database Model
- Repository: Data access layer
- Service: Business logic
- Controller: Presentation layer
- DTO: Data Transfer Object
- Mapper: Convert between Entity and DTO
- Domain: Business domain
- Specification: Business rule
- Aggregate: Business transaction
- Event: Business event
- Saga: Business process
- Factory: Business creation
- Value Object: Business value
- Policy: Business policy
- Strategy: Business strategy
- Context: Business context
- Module: Business module
- Layer: Business layer
- Application: Business application
- Infrastructure: Business infrastructure
- Shared Kernel: Business shared kernel
- Anti-corruption Layer: Business anti-corruption layer
- Bounded Context: Business bounded context

## For CRUD operation, keep the same terminology for consistency development experience
- Create
Prefix: create
- Read
Prefix: find
- Update
Prefix: update
- Delete
Prefix: delete
