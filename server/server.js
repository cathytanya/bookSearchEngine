const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
// import ApolloServer
const {ApolloServer} = require('apollo-server-express');
// import typeDef and resolvers
const {typeDef,resolvers}= require('./schema')
// import authMiddleware from auth.js file 
const{ authMiddleware } = require('./utils/auth');
const app = express();
const PORT = process.env.PORT || 3001;

// create a new apollo server to pass in schema data
const server = new ApolloServer({
  typeDef,
  resolvers,
  context: authMiddleware
})

// use ApolloServer with express
server.applyMiddleware({app})

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
