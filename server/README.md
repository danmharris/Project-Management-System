# Project Management API

## Projects
### `POST /projects`
Creates a new project and returns the unique identifier for it.

#### Request:
```
{
    "name": "A Project", /* REQUIRED */
    "description": "A description" /* REQUIRED */
}
```

#### Responses:
* 200: New project has been created successfully
* 400: Required parameters are missing
* 403: The user does not have permission to create projects

### `GET /projects`
Gets a list of all the projects in the database
#### Responses:
* 200: Data has been retrieved successfully
```
[
    {
        "name": "A Project",
        "description": "Description",
        "manager": "abcxyz",
        "status": "0",
        "developers": [
            "abc",
            "def",
        ]
    },
    ...
]
```

### `GET /projects/{uuid}`
Retrieves the information for a specific project

#### Responses:
* 200: Project successfully found
```
{
    "name": "A Project",
    "description": "Description",
    "manager": "abcxyz",
    "status": "0",
    "developers": [
        "abc",
        "def",
    ]
}
```

### `PUT /projects/{uuid}`
Updates the information for a specific project

#### Request:
```
{
    "name": "New Name",
    "description": "New Description",
    "manager": "abc123",
    "status": "1"
}
```

#### Responses:
* 200: Project successfully updated
* 403: User is not allowed to update this project

### `DELETE /projects/{uuid}`
Removes the project from the database

#### Responses:
* 200: Project successfully deleted
* 403: User is not allowed to delete this project

### `POST /projects/{uuid}/developers`
Adds new developers to the project

#### Request:
```
[
    "sub1",
    "sub2"
]
```

#### Responses:
* 200: Users successfully added
* 403: User not allowed to add these users to the project

### `DELETE /projects/{uuid}/developers`
Removes the developer subs from this project

#### Request:
```
[
    "sub1",
    "sub2"
]
```

#### Responses:
* 200: Users successfully removed
* 403: User is not allowed to remove these users from the project

## Users

### `GET /users`
Gets all the users registered on the system

#### Responses:
* 200: Successfully retrieved all users
```
[
    {
        "name": "Joe Bloggs",
        "email": "joe@example.com",
        "address": "123 Fake Street",
        "username": "joebloggs",
        "sub": "abc123"
    },
    ...
]
```

### `GET /users/{sub}`
Gets the skills for a specific user

#### Responses:
* 200: User skills successfully retrieved
```
{
    "sub": "abc123",
    "skills": [
        "skill 1",
        "skill 2"
    ]
}
```

### `POST /users/{sub}`
Update the skills for a specific user

#### Request:
```
{
    "skills": [
        "Skill 3",
        "Skill 4"
    ]
}
```

#### Responses:
* 200: Skills successfully updated
* 403: User not able to update this user's skills

### `GET /user_groups/{username}`
Gets the group for a username

#### Responses:
* 200: Group has successfully been retrieved
```
{
    "group": "Admins"
}
```
* 403: User is not allowed to see group information

### `POST /user_groups/{username}`
Update the group of a given user

#### Request:
```
{
    "group": "Developers"
}
```

#### Responses:
* 200: User group successfully updated
* 403: User is not allowed to update groups (admin only)
