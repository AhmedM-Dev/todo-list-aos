# To-do List

## Description

A Todo list web API based on GraphQL and MongoDB that offers the following features:

- Manage users (Admin only)
- Add tasks
- Delete tasks
- Complete / uncomplete tasks
- Share tasks to other users
- Comment on tasks

## Running the API



### Local environment
**Requirements**
- Node.js (v14 and later recommended)
- npm or yarn
- MongoDB server instance
- git

**Run steps**

1. clone the project:
    * `git clone https://github.com/AhmedM-Dev/todo-list-aos.git`

2. from inside the project folder, install its node modules dependecies
    * `npm install` or `yarn`

3. make sure that you have your MongoDB server running on 'http://localhost:27017'*

4. run the project using:
    * `npm run start` or `yarn start`

If everything goes as planned, you should see logs similar to the following in your terminal session:

```
\ Connecting to MongoDB database...
✔ Successfully connected to MongoDB database.
✔ Successfully seeded database with minimal data.
✔ Server is running, GraphQL Playground available at http://localhost:4000/graphql
```

*Notes:* If your MongoDB server instance is running on a different address or port, you can configure that in the **default** connection parameters inside the **ormconfig.json** file in the root of the project.

### Docker environment
**Requirements**
- docker
- docker-compose
- git

**Run steps**

1. clone the project:
    * `git clone https://github.com/AhmedM-Dev/todo-list-aos.git`

2. from inside the project folder, run the following command to build the docker container image
    * `docker build -t todo-list-aos .`

3. wait until docker finishes building the API container image

4. run the api:
    * `docker-compose up`
    * you can also run it as a daemon (service) using: `docker-compose up -d`

The docker-compose script will prepare a containeraise MongoDB server instance and run it along with the API image container. If everything wasa set up correctly you should see many logs without any error in your terminal session.

## GraphQL Playground

After running the API server using one of the previous guide methods, open a new browser tab and go to: http://localhost:4000/graphql

You should have access to the GraphQL Playground UI:

![alt text](https://imagizer.imageshack.com/img923/1617/zLcJZQ.png)

## How to test

When the API is launched, we intialize the database with an admin user with whom we can create new users.

The admin user creadentials are:
  * **email:** admin@todolist.aos
  * **password:** admin
 
---
### Authentication
To test the API you need to have a valid token.

Generate a new token for the admin user using the following query:
```json
{
  autorization: getToken(email: "admin@todolist.aos", password: "admin")
}
```

you should get a response similar to the following:
```json
{
  "data": {
    "autorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjNWZmYmE4LWQ4ODctNDBhYy05NGVhLTk1N2Y3Nzk3YjgzNiIsImVtYWlsIjoiYWRtaW5AdG9kb2xpc3QuYW9zIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsInBhc3N3b3JkIjoiJDJ5JDEwJFNwd0ZLc1loYVNXbHB4dGs2VU5LY2VwLjl1Q1BPdWx0QzBGb3YwTUdrY2dWZnIvdFFWWTg2IiwiaWF0IjoxNjIzMTIzODU0fQ.jqlkMapYgdImHIWemJvaX-paD-_rkugg_eUS8qpwBsE"
  }
}
```

now we need to set the received authorization token in the HTTP headers as follows:
![alt text](https://imagizer.imageshack.com/img924/2919/Tf6MkT.png)

now we are authenticated as admin

***Note**: you need to copy the entire token and not with the '...'*

---

### Users management

**Create new user**

Authenticated as admin you can create a new user using the following mutation:

```json
mutation {
  addUser(data: { email: "ahmed@test.com", username: "ahmed" }) {
    id
    email
    username
    role
    password
  }
}
```

**Notes**:
- *you can optionally provide a password otherwise the API will automatically generate a new password for the new user and return it as plain text just for the sake of test convenience.*

- *you can now get authenticated with the newly created user by generating a new token using the new user's email and password, then set the new token in the HTTP authorization header*

**update user**

Only the admin or the user himself can updaate his inforamtions using this mutation as an example:

```json
mutation {
  updateUser(data: { id: "bbcbf477-ff51-4e14-898c-592a6e333878", username: "my_username2" }) {
    id
    username
    email
  }
}
```

**delete user**

Only the admin can delete users using the following mutation:

```json
mutation {
  deleteUser(id: "3fa5012e-93d3-4dff-951c-ea4ea24bec62")
}
```

---

### Tasks management

**Create a new task**

```json
mutation {
  addTask(data: {  name: "another task", description: "I need to get the API docs done"}) {
    id
    name
    description
    status
    access
    ownerId
  }
}
```

**Update task**

```json
mutation {
  updateTask(data: {id: "2679ef24-e3e1-4a8b-96bb-62b14c39b1f5", description: "I am updating this task's description"}) {
    id
    name
    description
  }
}
```

***Note**: You need to be the owner of the task in order to delete it, otherwise you will get an error as response*

**Delete task**

```json
mutation {
  deleteTask (id: "b58751da-66f1-4757-8ebd-d47d20d3eadb")
}
```

***Note**: You need to be the owner of the task in order to delete it, otherwise you will get an error as response*

**List your own tasks**

```json
{
  getOwnTasks {
    id
    name
    description
    status
    ownerId
  }
}
```

**List all tasks that you access to**

You can fetch the list of tasks that the authenticated user can access (his own tasks + tasks that were shared to him) using the following query as an example:

```json
{
  getAllTasks {
    id
    name
    ownerId
    comments {
      author {
        id
        username
      }
    }
  }
}
```

**Change task status**

changing a task's status works like a toggle, you only need to provide the task id. Of course you need to be the owner of that task otherwise you will get an error response.

```json
mutation {
  completeTask(data: { id: "2679ef24-e3e1-4a8b-96bb-62b14c39b1f5" })
}
```

**Share task to other users**

```json
mutation {
  shareTask(data: {id: "", toUsersIds: ["c1ebf4a1-28ad-46bd-934b-b5f79ed6eca6", "2e5bb575-8f59-4f38-b2bf-43ca271ae612"]}) {
    id
    name
  }
}
```

**Add a comment on a task**

```json
mutation {
  addComment(data: {text: "I need to get that done before 2 PM", taskId: "8e0fdbd5-4df0-413e-b714-f6dc1d955e13"}) {
    id
    text
    date
  }
}
```