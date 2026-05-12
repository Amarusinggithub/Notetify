# Notetify Architecture

> A comprehensive guide to the Notetify application architecture, data models, and sharing system.
> This document evolves as the application grows.

**Last Updated:** January 12, 2026
**Status:** Living Document

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Entity Hierarchy](#entity-hierarchy)
4. [Data Models](#data-models)
5. [Sharing Architecture](#sharing-architecture)
6. [Permission System](#permission-system)
7. [Database Schema](#database-schema)
8. [API Design Patterns](#api-design-patterns)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Open Questions](#open-questions)

---

## Overview

Notetify is a note-taking application with a hierarchical organization system:

```
Space → Notebook → Note
```

Each level supports:
- **Personal metadata** (pins, favorites, trash) per user
- **Sharing** with other users with granular permissions
- **Cascading behavior** when sharing parent containers

### Key Principles

1. **User-Centric Metadata**: A note's state (pinned,  tags) is stored per-user, not globally
2. **Cascading Shares**: Sharing a Space shares all its Notebooks; sharing a Notebook shares all its Notes
3. **Permission Inheritance**: Child entities inherit parent permissions unless explicitly overridden
4. **Separation of Content and Access**: Note content is global; access/metadata is per-user

---

## Core Concepts

### Ownership vs Access

| Concept | Description | Example |
|---------|-------------|---------|
| **Owner** | The user who created the entity | User A creates a note |
| **Collaborator** | A user with shared access | User A shares note with User B |
| **Personal Copy** | User-specific metadata record | User B's `UserNote` record for that note |

### Personal vs Shared State

| State Type | Storage Location | Visibility |
|------------|------------------|------------|
| **Pin in notebook** | `UserNote.is_pinned_in_notebook` | Only the user |
| **Pin in space** | `UserNote.is_pinned_in_space` | Only the user |
| **Pin to home** | `UserNote.is_pinned_to_home` | Only the user |
| **Personal Tags** | `UserNoteTag` | Only the user |
| **Broadcast Highlight** | `NoteShare.is_highlighted` | Owner broadcasts importance to all collaborators |

---

## Entity Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                   │
│  (Authentication, Profile, Preferences)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ owns
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                           SPACE                                  │
│  (Workspace container - e.g., "Work", "Personal", "Projects")   │
│                                                                  │
│  Fields: name, description, icon, color, is_default, order      │
│  Sharing: SpaceShare (future)                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ contains (via notebook.space_id)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         NOTEBOOK                                 │
│  (Collection of notes - e.g., "Meeting Notes", "Ideas")         │
│                                                                  │
│  Fields: name                                                    │
│  User Metadata: UserNotebook (favorite, pinned, trashed)        │
│  Sharing: NotebookShare                                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ contains (via user_note.notebook_id)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                           NOTE                                   │
│  (Individual document with rich content)                         │
│                                                                  │
│  Fields: content (longText)                                      │
│  User Metadata: UserNote (favorite, pinned, trashed, notebook)  │
│  User Tags: UserNoteTag                                          │
│  Attachments: File (via file_note)                              │
│  Tasks: Task (todos, reminders, events)                         │
│  Sharing: NoteShare                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Tag

Tags are personal — each tag is owned by a single user. There are no shared or global tags.

```php
Tag {
    id: uuid (primary)
    user_id: uuid (foreign → users)
    name: string
    color: string (nullable)  // hex color
    order: integer (nullable) // display order

    // Relations
    user(): belongsTo → User
    userNotes(): belongsToMany → UserNote (via user_note_tag)
}
```

> Tags are already per-user (`Tag.user_id`), so no `UserTag` model is needed — `Tag` is the per-user model.
> Tags are never shared with collaborators; each user manages their own tag set independently.

---

### Primary Entities

#### User
The authenticated user.

```php
User {
    id: uuid (primary)
    email: string (unique)
    first_name: string
    last_name: string
    password: string (hashed)

    // Relations
    spaces(): belongsToMany → Space (via user_space)
    notebooks(): belongsToMany → Notebook (via user_notebook)
    notes(): belongsToMany → Note (via user_note)
    tags(): hasMany → Tag
    tasks(): hasMany → Task
    files(): hasMany → File
}
```

#### Space
Top-level organizational container.

```php
Space {
    id: uuid (primary)
    created_by_user_id: uuid (foreign → users)  // original creator; never changes
    name: string
    description: text (nullable)
    icon: string (nullable)  // emoji or icon name
    color: string (nullable) // hex color

    // Relations
    creator(): belongsTo → User
    users(): belongsToMany → User (via user_space)
    notebooks(): hasMany → Notebook
    shares(): hasMany → SpaceShare
}
```

#### Notebook
Collection of related notes.

```php
Notebook {
    id: uuid (primary)
    created_by_user_id: uuid (foreign → users)  // original creator; never changes
    space_id: uuid (foreign → spaces, nullable)  // the one space this notebook belongs to
    name: string

    // Relations
    creator(): belongsTo → User
    space(): belongsTo → Space
    users(): belongsToMany → User (via user_notebook)
    notes(): hasMany → Note (via user_note where notebook_id = this)
    shares(): hasMany → NotebookShare
}
```

#### Note
The core content entity.

```php
Note {
    id: uuid (primary)
    created_by_user_id: uuid (foreign → users)  // original creator; never changes

    // Body — two representations of the same content (planned: collab via Hocuspocus)
    content: jsonb        // Tiptap JSON — derived from ydoc_state, used for reads/search
    ydoc_state: bytea     // Yjs CRDT binary — source of truth during live collaboration;
                          // written by Hocuspocus persistence webhook, never via REST

    // Relations
    creator(): belongsTo → User
    userNotes(): hasMany → UserNote
    tasks(): hasMany → Task
    files(): belongsToMany → File (via file_note)
    shares(): hasMany → NoteShare
}
```

> **Content rule**: `ydoc_state` is the authoritative source during collaboration. `content`
> is derived from it (via Hocuspocus → persistence webhook → Laravel) and is what the REST
> API reads from. Body edits — including title changes — must never be written via `PUT /notes/:id`;
> they go through Hocuspocus. The note title is the first H1 inside `content`, extracted via
> JSONB path query with an `'Untitled'` fallback — there is no separate `title` column.

### User Metadata Models (Pivot Tables with Rich Data)

These models store **per-user state** for each entity.

#### UserNote
User-specific note metadata. This is the **primary access point** for notes.

```php
UserNote {
    id: uuid (primary)
    user_id: uuid (foreign → users)
    note_id: uuid (foreign → notes)
    notebook_id: uuid (foreign → notebooks, nullable)

    // Pinning (contextual — three independent pin surfaces)
    is_pinned_in_notebook: boolean  // pinned inside the notebook it belongs to
    is_pinned_in_space: boolean     // pinned inside the space the notebook belongs to
    is_pinned_to_home: boolean      // pinned to the user's home/dashboard

    pinned_in_notebook_at: timestamp (nullable)
    pinned_in_space_at: timestamp (nullable)
    pinned_to_home_at: timestamp (nullable)

    // Trash
    is_trashed: boolean
    trashed_at: timestamp (nullable)

    // Ownership
    is_owner: boolean (default: true for creator, false for collaborators)

    // Ordering
    order: integer (nullable)

    // Relations
    user(): belongsTo → User
    note(): belongsTo → Note
    notebook(): belongsTo → Notebook
    tags(): belongsToMany → Tag (via user_note_tag)

    // Scopes
    forUser($userId)
    withTag($tagName)
    search($term)
    whereFlag($flag, $value)
    pinnedInNotebook()
    pinnedInSpace()
    pinnedToHome()
    trashed()
    notTrashed()
    inNotebook($notebookId)
}
```

#### UserSpace
User-specific space metadata. Follows the same pattern as `UserNote` and `UserNotebook`.

```php
UserSpace {
    id: uuid (primary)
    user_id: uuid (foreign → users)
    space_id: uuid (foreign → spaces)

    // Ownership
    is_owner: boolean  // true for creator, false for collaborators

    // Permission (for collaborators; null for owner who has full access)
    permission: enum('view', 'comment', 'edit') (nullable)

    // Ordering / trash only — spaces cannot be pinned or favorited
    is_trashed: boolean
    trashed_at: timestamp (nullable)
    order: integer (nullable)

    // Relations
    user(): belongsTo → User
    space(): belongsTo → Space
}
```

#### UserNotebook
User-specific notebook metadata.

```php
UserNotebook {
    id: uuid (primary)
    user_id: uuid (foreign → users)
    notebook_id: uuid (foreign → notebooks)

    is_owner: boolean (default: true for creator, false for collaborators)

    // Pinning (two independent pin surfaces)
    is_pinned_in_space: boolean  // pinned inside the space the notebook belongs to
    is_pinned_to_home: boolean   // pinned to the user's home/dashboard

    pinned_in_space_at: timestamp (nullable)
    pinned_to_home_at: timestamp (nullable)

    is_trashed: boolean
    is_default: boolean  // user's default notebook
    trashed_at: timestamp (nullable)

    // Relations
    user(): belongsTo → User
    notebook(): belongsTo → Notebook
}
```

#### UserNoteTag
Tags applied to a specific user's note.

```php
UserNoteTag {
    id: uuid (primary)
    user_note_id: uuid (foreign → user_note)
    tag_id: uuid (foreign → tags)
    order: integer (nullable)

    // Relations
    userNote(): belongsTo → UserNote
    tag(): belongsTo → Tag
}
```

---

## Sharing Architecture

### Sharing Hierarchy

When you share a container, all its contents become accessible:

```
Share a Space
    └── All Notebooks in that Space become accessible
        └── All Notes in those Notebooks become accessible

Share a Notebook
    └── All Notes in that Notebook become accessible

Share a Note
    └── Only that specific Note is accessible
```

### Share Models

#### NoteShare
Direct note sharing between users.

```php
NoteShare {
    id: uuid (primary)
    note_id: uuid (foreign → notes)
    shared_by_user_id: uuid (foreign → users)
    shared_with_user_id: uuid (foreign → users)

    permission: enum('view', 'comment', 'edit')
    expires_at: timestamp (nullable)
    accepted_at: timestamp (nullable)
    accepted: boolean (default: false)

    // Broadcast pin — set by the owner to highlight this note for all collaborators
    // Each collaborator can still independently pin/unpin via their own UserNote
    is_highlighted: boolean (default: false)
    highlighted_at: timestamp (nullable)

    // Relations
    note(): belongsTo → Note
    sharedBy(): belongsTo → User
    sharedWith(): belongsTo → User

    // Scopes
    valid() // accepted = true AND (expires_at is null OR > now)
}
```

#### NotebookShare
Notebook sharing between users.

```php
NotebookShare {
    id: uuid (primary)
    notebook_id: uuid (foreign → notebooks)
    shared_by_user_id: uuid (foreign → users)
    shared_with_user_id: uuid (foreign → users)

    permission: enum('view', 'comment', 'edit')
    expires_at: timestamp (nullable)
    accepted_at: timestamp (nullable)
    accepted: boolean (default: false)

    // Broadcast pin — set by the owner to highlight this notebook for all collaborators
    // Each collaborator can still independently pin/unpin via their own UserNotebook
    is_highlighted: boolean (default: false)
    highlighted_at: timestamp (nullable)

    // Relations
    notebook(): belongsTo → Notebook
    sharedBy(): belongsTo → User
    sharedWith(): belongsTo → User
    notes(): Notes accessible through this share

    // Scopes
    valid()
}
```

#### SpaceShare (Future)
Space sharing between users.

```php
SpaceShare {
    id: uuid (primary)
    space_id: uuid (foreign → spaces)
    shared_by_user_id: uuid (foreign → users)
    shared_with_user_id: uuid (foreign → users)

    permission: enum('view', 'comment', 'edit')
    expires_at: timestamp (nullable)
    accepted_at: timestamp (nullable)
    accepted: boolean (default: false)

    // Relations
    space(): belongsTo → Space
    sharedBy(): belongsTo → User
    sharedWith(): belongsTo → User
    notebooks(): Notebooks accessible through this share
    notes(): Notes accessible through this share (via notebooks)
}
```

### Sharing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     SHARING A NOTE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User A creates NoteShare record                             │
│     - note_id, shared_with_user_id, permission                  │
│     - accepted = false (pending)                                │
│                                                                  │
│  2. User B receives notification (future: real-time)            │
│                                                                  │
│  3. User B accepts the share                                    │
│     - NoteShare.accepted = true                                 │
│     - System creates UserNote for User B                        │
│       (so they can have personal pins, tags, etc.)              │
│                                                                  │
│  4. User B can now:                                             │
│     - View the note (always)                                    │
│     - Comment (if permission >= 'comment')                      │
│     - Edit content (if permission = 'edit')                     │
│     - Add personal tags, pin, favorite (always - personal)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Sharing a Notebook (Cascading)

```
┌─────────────────────────────────────────────────────────────────┐
│                   SHARING A NOTEBOOK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User A creates NotebookShare record                         │
│                                                                  │
│  2. User B accepts the share                                    │
│     - NotebookShare.accepted = true                             │
│     - System creates UserNotebook for User B                    │
│                                                                  │
│  3. Access to notes is DERIVED (not duplicated):                │
│                                                                  │
│     When User B queries notes:                                  │
│     - Check UserNote (personal notes)                           │
│     - Check NoteShare (directly shared notes)                   │
│     - Check NotebookShare → Notebook → Notes (inherited)        │
│                                                                  │
│  4. When User B first interacts with a note:                    │
│     - Create UserNote record (lazy creation)                    │
│     - This allows personal metadata (tags, pins)                │
│                                                                  │
│  5. New notes added to shared notebook:                         │
│     - Automatically accessible to User B                        │
│     - No new share record needed                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Permission System

### Permission Levels

| Level | View | Comment | Edit | Delete | Share |
|-------|------|---------|------|--------|-------|
| `view` | Yes | No | No | No | No |
| `comment` | Yes | Yes | No | No | No |
| `edit` | Yes | Yes | Yes | No | No |
| `owner` | Yes | Yes | Yes | Yes | Yes |

### Permission Enum

Permissions are represented by a backed PHP enum `App\Enums\Permission`. The enum is cast on every model that carries a `permission` column (`NoteShare`, `NotebookShare`, `SpaceShare`, `UserSpace`). The DB columns for `note_shares` and `notebook_shares` are Postgres `ENUM` types; `space_shares.permission` should be migrated to match.

```php
// app/Enums/Permission.php
enum Permission: string
{
    case View    = 'view';
    case Comment = 'comment';
    case Edit    = 'edit';
}
```

The `owner` level is not a `Permission` value — ownership is expressed by `is_owner = true` on the relevant pivot (`UserNote`, `UserNotebook`, `UserSpace`) or `created_by_user_id` on the resource. Owners are never stored with a `Permission` value; they bypass the permission check entirely (see Access Resolution Algorithm below).

### Permission Inheritance

Permissions flow down the hierarchy but can be restricted:

```
Space (edit)
  └── Notebook inherits (edit)
      └── Note inherits (edit)

Space (edit)
  └── Notebook explicitly set to (view)  ← Restriction
      └── Note inherits (view)
```

**Rule**: A child can have EQUAL or LOWER permissions than its parent, never higher.

### Access Resolution Algorithm

When checking if User B can access Note X:

```python
def can_access(user, note, required_permission):
    # 1. Is user the creator?
    if note.created_by_user_id == user.id:
        return True

    # 2. Direct note share?
    note_share = NoteShare.where(
        note_id=note.id,
        shared_with_user_id=user.id,
        accepted=True
    ).valid().first()

    if note_share and note_share.permission >= required_permission:
        return True

    # 3. Notebook share? (note's notebook — look up via creator's UserNote)
    user_note = UserNote.where(note_id=note.id, user_id=note.created_by_user_id).first()
    if user_note and user_note.notebook_id:
        notebook_share = NotebookShare.where(
            notebook_id=user_note.notebook_id,
            shared_with_user_id=user.id,
            accepted=True
        ).valid().first()

        if notebook_share and notebook_share.permission >= required_permission:
            return True

    # 4. Space share? (notebook's space) - Future
    # Similar logic traversing up

    return False
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐       ┌───────────────┐       ┌──────────┐
│  users   │───────│  user_note    │───────│  notes   │
└──────────┘  1:N  └───────────────┘  N:1  └──────────┘
     │                    │                      │
     │                    │                      │
     │              ┌─────┴─────┐                │
     │              │           │                │
     │              ▼           ▼                │
     │       ┌───────────┐  ┌──────────┐        │
     │       │user_note  │  │notebooks │        │
     │       │   _tag    │  └──────────┘        │
     │       └───────────┘       │              │
     │              │            │              │
     │              ▼            │              │
     │        ┌─────────┐        │              │
     │        │  tags   │        │              │
     │        └─────────┘        │              │
     │                           │              │
     │    ┌──────────────────────┘              │
     │    │                                     │
     │    ▼                                     │
     │ ┌────────────────┐                       │
     │ │ user_notebook  │                       │
     │ └────────────────┘                       │
     │                                          │
     │                                          │
     ▼                                          ▼
┌──────────────┐                        ┌──────────────┐
│ note_shares  │                        │notebook_share│
└──────────────┘                        └──────────────┘

┌──────────┐                               ┌──────────┐
│  spaces  │──────────────────────────────▶│notebooks │
└──────────┘          1:N (space_id)       └──────────┘
```

### Key Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Authentication | email, password |
| `spaces` | Workspaces | created_by_user_id, name, color |
| `user_space` | User↔Space metadata | is_owner, permission, is_trashed, order |
| `notebooks` | Note collections | created_by_user_id, space_id, name |
| `notes` | Documents | created_by_user_id, content (jsonb), ydoc_state (bytea) |
| `tags` | Per-user tag definitions | user_id, name, color, order |
| `tasks` | Todos/Events | type, status, due_at |
| `files` | Uploads | path, mime_type |
| `user_note` | User↔Note metadata | is_owner, is_pinned_in_notebook, is_pinned_in_space, is_pinned_to_home, notebook_id |
| `user_notebook` | User↔Notebook metadata | is_owner, is_pinned_in_space, is_pinned_to_home |
| `user_note_tag` | User's note tags | user_note_id, tag_id |
| `note_shares` | Note sharing | permission, accepted |
| `notebook_shares` | Notebook sharing | permission, accepted |
| `file_note` | File↔Note | order |

---

## API Design Patterns

### Resource Endpoints

```
# Notes (accessed through UserNote)
GET    /notes                    # List user's notes (with filters)
GET    /notes/:id                # Get single note
POST   /notes                    # Create note
PUT    /notes/:id                # Update note
DELETE /notes/:id                # Soft delete note

# Notebooks
GET    /notebooks                # List user's notebooks
GET    /notebooks/:id            # Get notebook with notes
POST   /notebooks                # Create notebook
PUT    /notebooks/:id            # Update notebook
DELETE /notebooks/:id            # Soft delete notebook
GET    /notebooks/:id/notes      # List notes in notebook

# Spaces
GET    /spaces                   # List user's spaces
GET    /spaces/:id               # Get space with notebooks
POST   /spaces                   # Create space
PUT    /spaces/:id               # Update space
DELETE /spaces/:id               # Soft delete space
GET    /spaces/:id/notebooks     # List notebooks in space

# Sharing
POST   /notes/:id/share          # Share a note
GET    /notes/:id/shares         # List shares for a note
DELETE /notes/:id/shares/:shareId # Revoke share
POST   /shares/:id/accept        # Accept a share invitation

POST   /notebooks/:id/share      # Share a notebook
GET    /notebooks/:id/shares     # List shares for notebook

# Tags
GET    /tags                     # List user's tags
POST   /tags                     # Create tag
PUT    /tags/:id                 # Update tag (color, name)
DELETE /tags/:id                 # Delete tag

# Shared with me
GET    /shared                   # All items shared with current user
GET    /shared/notes             # Notes shared with me
GET    /shared/notebooks         # Notebooks shared with me
```

### Query Parameters (Notes Index)

```
GET /notes?
    tag=work                     # Filter by tag
    search=meeting               # Search content
    notebook_id=xxx              # Filter by notebook
    pinned_in_notebook=true      # Filter pinned in notebook
    pinned_in_space=true         # Filter pinned in space
    pinned_to_home=true          # Filter pinned to home
    is_trashed=false             # Exclude trash
    sort_by=updated_at           # Sort field
    sort_direction=desc          # Sort order
    page=1                       # Pagination
    per_page=20                  # Page size
```

### Response Shapes

```json
// Note (via UserNote)
{
    "id": "user-note-uuid",
    "note_id": "note-uuid",
    "notebook_id": "notebook-uuid",
    "is_pinned_in_notebook": true,
    "is_pinned_in_space": false,
    "is_pinned_to_home": false,
    "is_trashed": false,
    "pinned_in_notebook_at": "2026-01-12T10:00:00Z",
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-01-12T10:00:00Z",
    "note": {
        "id": "note-uuid",
        "content": "# Meeting Notes\n\nDiscussed..."
    },
    "tags": [
        { "id": "tag-uuid", "name": "work" },
        { "id": "tag-uuid", "name": "meetings" }
    ],
    "notebook": {
        "id": "notebook-uuid",
        "name": "Work Notes"
    }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Current)
- [x] User authentication
- [x] Notes CRUD
- [x] UserNote metadata (pins, favorites, trash)
- [x] Tags (per-user via UserNoteTag)
- [x] Notebooks
- [x] Note ↔ Notebook assignment
- [x] Spaces

### Phase 2: Sharing - Notes
- [ ] Add `is_pinned`, `pinned_at` to `note_shares` table
- [ ] NoteShare create/accept/revoke endpoints
- [ ] Create UserNote on share acceptance
- [ ] Query shared notes in notes index
- [ ] Real-time notifications for share invites

### Phase 3: Sharing - Notebooks
- [ ] NotebookShare CRUD
- [ ] Cascading access to notes
- [ ] Lazy UserNote creation on first interaction
- [ ] Include notebook-shared notes in queries

### Phase 4: Sharing - Spaces
- [ ] Create SpaceShare model and migration
- [ ] SpaceShare CRUD
- [ ] Cascading access to notebooks and notes
- [ ] Permission inheritance enforcement

### Phase 5: Advanced Features
- [ ] Shared tags (visible to all collaborators)
- [ ] Comments system
- [ ] Activity feed / audit log
- [ ] Real-time collaboration (WebSocket)
- [ ] Link sharing (public URLs with tokens)
- [ ] Team/Organization workspaces

### Phase 6: Polish
- [ ] Permission caching for performance
- [ ] Batch operations
- [ ] Export/Import
- [ ] Offline support
- [ ] Search indexing (Elasticsearch/Meilisearch)

---

## Open Questions

### Architecture Decisions Needed

1. **Lazy vs Eager UserNote Creation**
   - When User B gets access via NotebookShare, do we create UserNote records immediately for all notes, or lazily on first access?
   - **Recommendation**: Lazy creation to avoid bloat

2. **Permission Override Granularity**
   - Can a note in a shared notebook have different permissions than the notebook?
   - **Recommendation**: Yes, allow restriction (not elevation)

3. **Deletion Cascade Behavior**
   - When owner deletes a shared note, what happens?
   - **Options**:
     - A) Delete for everyone
     - B) Transfer ownership
     - C) Keep as "orphaned" for collaborators
   - **Recommendation**: Option A with soft-delete grace period

4. **Space Ownership Model**
   - Can a Space be transferred to another user?
   - Can a Space have multiple owners?
   - **Recommendation**: Single owner initially, evaluate team needs later

### Technical Debt

None outstanding.

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| **Owner** | User who created an entity |
| **Collaborator** | User with shared access |
| **Personal State** | Metadata visible only to one user |
| **Shared State** | Metadata visible to all collaborators |
| **Cascading** | Access flowing from parent to children |
| **Pivot Table** | Junction table for many-to-many relationships |

### File Structure

```
api/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── NoteController.php
│   │       ├── NotebookController.php
│   │       ├── SpaceController.php
│   │       ├── TagController.php
│   │       └── ShareController.php (future)
│   └── Models/
│       ├── User.php
│       ├── Space.php
│       ├── Notebook.php
│       ├── Note.php
│       ├── Tag.php
│       ├── Task.php
│       ├── File.php
│       ├── UserNote.php
│       ├── UserNotebook.php
│       ├── UserNoteTag.php
│       ├── NoteShare.php
│       ├── NotebookShare.php
│       └── SpaceShare.php (future)
└── database/
    └── migrations/
```

---

*This document is maintained as part of the Notetify codebase. Update it as architecture evolves.*
