# Examples

This document provides practical examples of steering files, hooks, and MCP tools for common use cases.

## Table of Contents

- [Steering File Examples](#steering-file-examples)
- [Hook Examples](#hook-examples)
- [Complete Project Setups](#complete-project-setups)
- [Advanced Patterns](#advanced-patterns)

## Steering File Examples

### Example 1: TypeScript Project Standards

**File**: `.kiro/steering/typescript-standards.md`

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.ts"
priority: 8
---

# TypeScript Standards

## Type Safety

- Never use `any` - use `unknown` if type is truly unknown
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for public functions
- Enable strict mode in tsconfig.json

## Async/Await

- Always use async/await instead of raw promises
- Handle errors with try-catch blocks
- Never use `.catch()` without re-throwing or logging

## Imports

- Use absolute imports with path aliases
- Group imports: external → internal → relative
- Sort imports alphabetically within groups

## Example

\`\`\`typescript
// Good
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UserService } from '@/services/user.service';
import { User } from '@/models/user';

import { formatDate } from './utils';

@Injectable()
export class UserManager {
  async getUser(id: string): Promise<User> {
    try {
      return await this.userService.fetchUser(id);
    } catch (error) {
      this.logger.error('Failed to fetch user', error);
      throw error;
    }
  }
}
\`\`\`
```

---

### Example 2: React Component Guidelines

**File**: `.kiro/steering/react-components.md`

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.{tsx,jsx}"
priority: 7
---

# React Component Guidelines

## Component Structure

1. Imports
2. Type definitions
3. Component function
4. Styled components (if using styled-components)
5. Export

## Hooks Rules

- Call hooks at the top level
- Use custom hooks for reusable logic
- Name custom hooks with `use` prefix
- Keep useEffect dependencies accurate

## Props

- Define prop types with TypeScript interfaces
- Use destructuring in function parameters
- Provide default values when appropriate
- Document complex props with JSDoc

## State Management

- Use useState for local state
- Use useReducer for complex state logic
- Lift state up when needed by multiple components
- Consider context for deeply nested prop drilling

## Example

\`\`\`typescript
import React, { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  onUpdate 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getUser(userId);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage />;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
\`\`\`
```

---

### Example 3: API Design Standards

**File**: `.kiro/steering/api-design.md`

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/api/**/*.ts"
priority: 6
---

# API Design Standards

## REST Endpoints

- Use nouns for resources, not verbs
- Use plural nouns for collections
- Use HTTP methods correctly (GET, POST, PUT, DELETE)
- Return appropriate status codes

## Request/Response Format

- Use JSON for request and response bodies
- Include pagination for list endpoints
- Provide meaningful error messages
- Use consistent field naming (camelCase)

## Error Handling

- Return errors in consistent format
- Include error code and message
- Provide helpful error details
- Log errors server-side

## Example

\`\`\`typescript
// Good endpoint design
GET    /api/users           // List users
GET    /api/users/:id       // Get user
POST   /api/users           // Create user
PUT    /api/users/:id       // Update user
DELETE /api/users/:id       // Delete user

// Response format
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}

// Error format
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 123 not found",
    "details": {
      "userId": "123"
    }
  }
}
\`\`\`
```

---

### Example 4: Database Query Patterns

**File**: `.kiro/steering/database-patterns.md`

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/repositories/**/*.ts"
priority: 5
---

# Database Query Patterns

## Repository Pattern

- One repository per entity
- Keep queries in repositories, not services
- Use transactions for multi-step operations
- Handle database errors gracefully

## Query Optimization

- Use indexes for frequently queried fields
- Avoid N+1 queries - use joins or eager loading
- Limit result sets with pagination
- Use connection pooling

## Naming Conventions

- `findById(id)` - Get single record by ID
- `findAll(options)` - Get all records with filters
- `create(data)` - Create new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record

## Example

\`\`\`typescript
export class UserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error('Failed to find user', { id, error });
      throw new DatabaseError('Failed to fetch user');
    }
  }

  async findAll(options: FindOptions): Promise<User[]> {
    const { limit = 10, offset = 0, orderBy = 'created_at' } = options;
    
    const result = await this.db.query(
      'SELECT * FROM users ORDER BY $1 LIMIT $2 OFFSET $3',
      [orderBy, limit, offset]
    );
    
    return result.rows;
  }

  async create(data: CreateUserData): Promise<User> {
    const transaction = await this.db.beginTransaction();
    
    try {
      const user = await transaction.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [data.name, data.email]
      );
      
      await transaction.commit();
      return user.rows[0];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
\`\`\`
```

---

### Example 5: Testing Guidelines

**File**: `.kiro/steering/testing-guidelines.md`

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.test.ts"
priority: 9
---

# Testing Guidelines

## Test Structure

- Use AAA pattern: Arrange, Act, Assert
- One assertion per test when possible
- Use descriptive test names
- Group related tests with describe blocks

## Test Naming

Format: `should <expected behavior> when <condition>`

Examples:
- `should return user when ID exists`
- `should throw error when ID is invalid`
- `should update user when data is valid`

## Mocking

- Mock external dependencies
- Don't mock the system under test
- Use realistic test data
- Clean up mocks after tests

## Coverage

- Aim for 80% code coverage
- Test happy paths and error cases
- Test edge cases and boundary conditions
- Don't test implementation details

## Example

\`\`\`typescript
describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    
    userService = new UserService(mockRepository);
  });

  describe('getUser', () => {
    it('should return user when ID exists', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: userId, name: 'John' };
      mockRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUser(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUser('999'))
        .rejects
        .toThrow('User not found');
    });
  });
});
\`\`\`
```

---

## Hook Examples

### Example 1: Comprehensive Test Runner

**File**: `.kiro/hooks/test-runner.json`

```json
{
  "name": "Comprehensive Test Runner",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.test.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "I just saved a test file. Please:\n1. Run the tests in this file\n2. Report which tests passed and failed\n3. For any failures, explain what went wrong\n4. Suggest fixes if tests are failing\n5. Check if test coverage is adequate"
  },
  "enabled": true,
  "preventRecursion": true
}
```

---

### Example 2: Code Quality Check

**File**: `.kiro/hooks/code-quality.json`

```json
{
  "name": "Code Quality Check",
  "trigger": {
    "type": "onSave",
    "filePattern": "src/**/*.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "Review this file for code quality issues:\n- Check for code smells\n- Identify potential bugs\n- Suggest performance improvements\n- Verify error handling\n- Check naming conventions\n- Ensure proper documentation"
  },
  "enabled": false,
  "preventRecursion": true
}
```

---

### Example 3: Import Organizer

**File**: `.kiro/hooks/organize-imports.json`

```json
{
  "name": "Organize Imports",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.{ts,tsx}"
  },
  "action": {
    "type": "prompt",
    "prompt": "Check if imports in this file are properly organized:\n1. Group: external → internal → relative\n2. Sort alphabetically within groups\n3. Remove unused imports\n4. Fix any import errors\nIf imports need reorganization, please fix them."
  },
  "enabled": false,
  "preventRecursion": true
}
```

---

### Example 4: Security Audit

**File**: `.kiro/hooks/security-audit.json`

```json
{
  "name": "Security Audit",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/api/**/*.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "Perform a security audit of this API endpoint:\n- Check for SQL injection vulnerabilities\n- Verify input validation\n- Check authentication/authorization\n- Look for sensitive data exposure\n- Verify error messages don't leak information\n- Check for rate limiting\nReport any security concerns found."
  },
  "enabled": true,
  "preventRecursion": true
}
```

---

### Example 5: Documentation Generator

**File**: `.kiro/hooks/doc-generator.json`

```json
{
  "name": "Documentation Generator",
  "trigger": {
    "type": "onFileCreate",
    "filePattern": "src/**/*.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "This is a new file. Please:\n1. Add a file-level JSDoc comment explaining its purpose\n2. Add JSDoc comments for all exported functions/classes\n3. Include @param and @returns tags\n4. Add usage examples for complex functions\n5. Document any important implementation details"
  },
  "enabled": false,
  "preventRecursion": true
}
```

---

### Example 6: Commit Message Helper

**File**: `.kiro/hooks/commit-helper.json`

```json
{
  "name": "Commit Message Helper",
  "trigger": {
    "type": "onPreCommit"
  },
  "action": {
    "type": "prompt",
    "prompt": "Review the staged changes and suggest a commit message following conventional commits format:\n\n<type>(<scope>): <subject>\n\n<body>\n\nTypes: feat, fix, docs, style, refactor, test, chore\n\nProvide:\n1. Appropriate type and scope\n2. Clear, concise subject line\n3. Detailed body explaining what and why\n4. Reference any related issues"
  },
  "enabled": true,
  "preventRecursion": false
}
```

---

## Complete Project Setups

### Setup 1: Node.js/TypeScript Backend

**Directory structure**:
```
.kiro/
├── steering/
│   ├── typescript-standards.md
│   ├── api-design.md
│   ├── database-patterns.md
│   └── testing-guidelines.md
└── hooks/
    ├── test-runner.json
    ├── security-audit.json
    └── commit-helper.json
```

**typescript-standards.md**: See Example 1 above  
**api-design.md**: See Example 3 above  
**database-patterns.md**: See Example 4 above  
**testing-guidelines.md**: See Example 5 above  
**test-runner.json**: See Hook Example 1 above  
**security-audit.json**: See Hook Example 4 above  
**commit-helper.json**: See Hook Example 6 above

---

### Setup 2: React Frontend

**Directory structure**:
```
.kiro/
├── steering/
│   ├── react-components.md
│   ├── typescript-standards.md
│   ├── styling-guidelines.md
│   └── testing-guidelines.md
└── hooks/
    ├── test-runner.json
    ├── component-validator.json
    └── accessibility-check.json
```

**react-components.md**: See Example 2 above  
**typescript-standards.md**: See Example 1 above  
**testing-guidelines.md**: See Example 5 above

**styling-guidelines.md**:
```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.{tsx,jsx,css,scss}"
priority: 6
---

# Styling Guidelines

## CSS-in-JS

- Use styled-components or emotion
- Define styled components at bottom of file
- Use theme variables for colors and spacing
- Avoid inline styles

## Naming

- Use descriptive names for styled components
- Prefix with component name
- Use PascalCase

## Responsive Design

- Mobile-first approach
- Use theme breakpoints
- Test on multiple screen sizes

## Example

\`\`\`typescript
const UserCardContainer = styled.div\`
  padding: \${({ theme }) => theme.spacing.md};
  background: \${({ theme }) => theme.colors.background};
  border-radius: \${({ theme }) => theme.borderRadius.md};
  
  @media (min-width: \${({ theme }) => theme.breakpoints.md}) {
    padding: \${({ theme }) => theme.spacing.lg};
  }
\`;
\`\`\`
```

**component-validator.json**:
```json
{
  "name": "Component Validator",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.{tsx,jsx}"
  },
  "action": {
    "type": "prompt",
    "prompt": "Validate this React component:\n- Check prop types are defined\n- Verify hooks are used correctly\n- Check for missing keys in lists\n- Verify accessibility attributes\n- Check for performance issues\n- Ensure error boundaries where needed"
  },
  "enabled": true,
  "preventRecursion": true
}
```

**accessibility-check.json**:
```json
{
  "name": "Accessibility Check",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.{tsx,jsx}"
  },
  "action": {
    "type": "prompt",
    "prompt": "Check this component for accessibility issues:\n- Verify semantic HTML usage\n- Check for alt text on images\n- Verify ARIA labels where needed\n- Check keyboard navigation\n- Verify color contrast\n- Check for focus indicators"
  },
  "enabled": false,
  "preventRecursion": true
}
```

---

### Setup 3: Full-Stack Application

Combine both setups above, plus:

**architecture.md**:
```markdown
---
inclusion: always
priority: 10
---

# Full-Stack Architecture

## Project Structure

\`\`\`
project/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/           # Node.js API
│   ├── src/
│   │   ├── api/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── models/
│   └── package.json
└── shared/            # Shared types and utilities
    └── src/
        └── types/
\`\`\`

## Communication

- Frontend calls backend via REST API
- Use TypeScript interfaces from shared package
- Handle errors gracefully on both sides
- Use environment variables for API URLs

## Development Workflow

1. Define types in shared package
2. Implement backend endpoint
3. Test endpoint with unit tests
4. Implement frontend feature
5. Test integration

## Deployment

- Frontend: Static hosting (Vercel, Netlify)
- Backend: Container (Docker) on cloud platform
- Database: Managed service (RDS, MongoDB Atlas)
```

---

## Advanced Patterns

### Pattern 1: Context-Aware Documentation

Use multiple steering files with different priorities to provide layered context:

```markdown
<!-- .kiro/steering/01-overview.md -->
---
inclusion: always
priority: 10
---

# Project Overview
High-level project description and goals...

<!-- .kiro/steering/02-architecture.md -->
---
inclusion: always
priority: 9
---

# Architecture
Detailed architecture information...

<!-- .kiro/steering/03-typescript.md -->
---
inclusion: fileMatch
fileMatchPattern: "**/*.ts"
priority: 8
---

# TypeScript Guidelines
Language-specific rules...

<!-- .kiro/steering/04-react.md -->
---
inclusion: fileMatch
fileMatchPattern: "**/*.tsx"
priority: 7
---

# React Guidelines
Framework-specific rules...
```

---

### Pattern 2: Progressive Hook Enablement

Start with hooks disabled, enable progressively:

```json
// Phase 1: Testing only
{
  "name": "Test Runner",
  "enabled": true,
  "trigger": { "type": "onSave", "filePattern": "**/*.test.ts" },
  "action": { "type": "prompt", "prompt": "Run tests..." }
}

// Phase 2: Add documentation
{
  "name": "Doc Check",
  "enabled": true,
  "trigger": { "type": "onSave", "filePattern": "src/**/*.ts" },
  "action": { "type": "prompt", "prompt": "Check docs..." }
}

// Phase 3: Add quality checks
{
  "name": "Quality Check",
  "enabled": true,
  "trigger": { "type": "onSave", "filePattern": "src/**/*.ts" },
  "action": { "type": "prompt", "prompt": "Check quality..." }
}
```

---

### Pattern 3: Conditional Steering with Manual Override

```markdown
<!-- .kiro/steering/advanced-patterns.md -->
---
inclusion: manual
---

# Advanced Patterns

This file contains advanced patterns that are only loaded when explicitly needed.

## Performance Optimization Patterns
...

## Security Hardening Patterns
...

## Scalability Patterns
...
```

Reference in chat with: `#advanced-patterns`

---

## Tips and Best Practices

### Steering Files

1. **Start simple**: Begin with basic rules, add complexity as needed
2. **Use examples**: Include code examples in steering files
3. **Keep focused**: One concern per file
4. **Test patterns**: Verify AI follows rules by testing generated code
5. **Iterate**: Refine rules based on AI behavior

### Hooks

1. **Test manually first**: Run prompts manually before creating hooks
2. **Start disabled**: Enable hooks after verifying they work correctly
3. **Monitor performance**: Check hook execution times
4. **Use specific patterns**: Avoid triggering on too many files
5. **Provide clear prompts**: Be explicit about what AI should do

### General

1. **Version control**: Commit `.kiro/` directory to git
2. **Document decisions**: Explain why rules exist
3. **Share with team**: Ensure team understands the setup
4. **Review regularly**: Update rules as project evolves
5. **Measure effectiveness**: Track if AI follows rules correctly

---

## Additional Resources

- [Configuration Guide](./CONFIGURATION.md) - Detailed configuration options
- [README](../README.md) - General documentation
- [Development Guide](../DEVELOPMENT.md) - Development instructions
