A REST API, and in the future a web-based front end, to handle the casting for
regularly scheduled performances.

This is being created for Theatre on the Edge (http://tote.ca), but others may
find it useful.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Server Configuration](#server-configuration)
  - [Environment Variables](#environment-variables)
- [Using the API](#using-the-api)
  - [Authentication](#authentication)
  - [Creating & Modifying Objects](#creating-&-modifying-objects)
  - [Permissions](#permissions)
- [API Routes](#api-routes)
  - [Authentication](#authentication-1)
    - [`POST /api/auth/login`](#post-apiauthlogin)
  - [Players](#players)
    - [Player Object](#player-object)
    - [`GET /api/players/`](#get-apiplayers)
    - [`POST /api/players/` (Authenticated)](#post-apiplayers-authenticated)
    - [`GET /api/players/:player`](#get-apiplayersplayer)
    - [`PATCH /api/players/:player` (Authenticated)](#patch-apiplayersplayer-authenticated)
    - [Planned: `DELETE /api/players/:player` (Authenticated)](#planned-delete-apiplayersplayer-authenticated)
  - [Planned: Shows](#planned-shows)
    - [Show Object](#show-object)
    - [Planned: `GET /api/shows/`](#planned-get-apishows)
    - [Planned: `POST /api/shows/` (Authenticated)](#planned-post-apishows-authenticated)
    - [Planned: `GET /api/shows/:show`](#planned-get-apishowsshow)
    - [Planned: `PATCH /api/shows/:show` (Authenticated)](#planned-patch-apishowsshow-authenticated)
    - [Planned: `DELETE /api/shows/:show`](#planned-delete-apishowsshow)
  - [Users](#users)
    - [User Object](#user-object)
    - [`GET /api/users/` (Authenticated)](#get-apiusers-authenticated)
    - [`POST /api/users` (Authenticated)](#post-apiusers-authenticated)
    - [`GET /api/users/:user` (Authenticated)](#get-apiusersuser-authenticated)
    - [Planned: `PATCH /api/users/:user` (Authenticated)](#planned-patch-apiusersuser-authenticated)
    - [Planned: `DELETE /api/users/:user` (Authenticated)](#planned-delete-apiusersuser-authenticated)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Server Configuration

### Environment Variables

The server uses a number of environment variables to configure how it connects
to the database, and perform various functions.

**Required**

- `TOTE_DB_HOST`
- `TOTE_DB_DATABASE`
- `TOTE_DB_USER`
- `TOTE_DB_PASSWORD`
- `TOTE_JWT_SECRET`: Secret key for signing JSON Web Tokens

**Optional**

- `TOTE_SESSION_LENGTH_MINUTES`: How long a token will be valid for without
  being used. Defaults to 20 minutes.

## Using the API

These are subject to change, and are here for testing reference only.

Organization/sorting will come later.

### Authentication

**Authenticated** routes require a JSON Web Token to authenticate against.
To send the token, add an `Authorization` to the request. The value must begin
with `JWT` followed by a space, followed by a token retrieved from the server
from the `/api/auth/login` route.

Routes that require authentication are noted as **Authenticated**.

### Creating & Modifying Objects

Objects are created by **POST**ing to the appropriate endpoint.
The body of the request must be a JSON object containing the data for the object
to create. This MUST NOT include an ID.

Objects are modified by sending a **PATCH** to the appropriate endpoint.
The body of the request must be a JSON object containing the fields to be
modified. No other attributes for the object will be affected.

Both creation and modification will return a the object in its new state.

### Permissions

Some routes, notably those marked as **Authenticated**, require the accessing
user to have one or more **Permission**s to successfully perform the desired
action.

*Note: These checks are currently implemented and enforced, but management of
them has not.*

## API Routes

### Authentication

#### `POST /api/auth/login`
Log in with your username & password, and get a JSON Web Token to authenticate
further requests to **Authenticated** routes.

*Request Body*
```JSON
{
    "username": <string[username]>,
    "password": <string>
}
```

*Response*
```JSON
{
  "token": <string[JWT]>
}
```

### Players

#### Player Object

```JSON
{
  "id": <id[player]>,
  "name": <string>,
  "email": <string[email]>,
  "bio": <string>
}
```

#### `GET /api/players/`
Fetch a list of all active Players.

#### `POST /api/players/` (Authenticated)
*Requires **Manage Players** permission*

Create a new Player.

#### `GET /api/players/:player`
Fetch the information for an individual Player.

#### `PATCH /api/players/:player` (Authenticated)
*Requires **Manage Players** permission*

Update the information for an individual Player.

#### Planned: `DELETE /api/players/:player` (Authenticated)
*Requires **Manage Players** permission*

Delete a player.

### Planned: Shows

#### Show Object

TBD

#### Planned: `GET /api/shows/`

Fetch a list of upcoming Shows.

#### Planned: `POST /api/shows/` (Authenticated)
*Requires **Manage Shows** permission*

Create a new Show.

#### Planned: `GET /api/shows/:show`

Fetch the information for an individual Show.

#### Planned: `PATCH /api/shows/:show` (Authenticated)
*Requires **Manage Shows** permission*

Update the information for an individual Show.

#### Planned: `DELETE /api/shows/:show`
*Requires **Manage Shows** permission*

Delete a Show.

### Users

#### User Object

```JSON
{
  "username": <string[username]>,
  "playerId": <id[player]>,
  "password": <string>
}
```

**Note:** Objects returned WILL NOT contain a `password` field. This is used for
creation and modification only.

#### `GET /api/users/` (Authenticated)
*Requires **Manage Users** permission*

Get an array containing all active Users.

#### `POST /api/users` (Authenticated)
*Requires **Manage Users** permission*

Create a new User.

#### `GET /api/users/:user` (Authenticated)
*Requires **Manage Users** permission*

Fetch the information for an individual User.

#### Planned: `PATCH /api/users/:user` (Authenticated)
*Requires **Manage Users** permission*

Update a user.

#### Planned: `DELETE /api/users/:user` (Authenticated)
*Requires **Manage Users** permission*

Delete a user.
