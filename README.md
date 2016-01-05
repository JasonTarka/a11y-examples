## Required environment variables

- `TOTE_DB_HOST`
- `TOTE_DB_DATABASE`
- `TOTE_DB_USER`
- `TOTE_DB_PASSWORD`
- `TOTE_JWT_SECRET`

## API

These are subject to change, and are here for testing reference only.

Organization/sorting will come later.

### Authentication

#### `POST /api/auth/login`
Log in with your username & password, and get a JSON Web Token to authenticate
further requests.

*Example Body*
```JSON
{
    "username": "root",
    "password": "toor"
}
```

*Example Response*
```JSON
{
  "token": "eyJ0eXAiOiJKV1QiLC...J9.eyJpZCI6...MH0.DAJ4y...OaLWc"
}
```

### Players

#### `GET /api/players/view/:player`
Fetch the information for an individual Player.

`:player` is the ID of the player to fetch

*Example Response*
```JSON
{
  "id": 74,
  "name": "John Doe",
  "email": null,
  "bio": "This person has nothing witty to say yet."
}
```

#### `GET /api/players/`
Fetch a list of all active Players.

### Users

#### `GET /api/users/view/:user` (Authenticated)
Fetch the information for an individual User.

`:user` is the ID of the User to fetch

*Example Response*
```JSON
{
  "id": 258,
  "username": "John.Doe",
  "playerId": 74
}
```

#### `POST /api/users/create` (Authenticated)
Create a new User.

*Example Body*
```JSON
{
  "username": "John.Doe",
  "playerId": 74,
  "password": "your new password"
}
```

*Response*
Responds with a User object representing the newly created User

#### `GET /api/users/` (Authenticated)
Get a list of all active Users.
