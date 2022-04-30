# Hosting on MongoDB

**Create an account at the [official MongoDB site](https://account.mongodb.com/account/login).**

**Create a new [MongoDB project](https://docs.atlas.mongodb.com/tutorial/manage-projects/#create-a-project).**

**After creation, fill the following variables in the [.env](https://github.com/Fronvo/server/blob/master/.env.example) file:**

- **``FRONVO_PRISMA_URL``**
- **``FRONVO_MONGODB_USERNAME``**
- **``FRONVO_MONGODB_PASSWORD``**
- **``FRONVO_MONGODB_PROJECT``**

**And optionally:**

- **``FRONVO_MONGODB_DB``**

**Finally set ``FRONVO_LOCAL_MODE`` to ``false``**

**After everything is working, copy the [hosting command](https://github.com/Fronvo/server/blob/master/Procfile) to the respectable option of your hosting platform of choice.**

# Demo

<img src='https://raw.githubusercontent.com/Fronvo/server/master/.github/assets/demo-run-hosting.svg' alt='Fronvo demo hosted run'>
