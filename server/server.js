const express = require('express');
const path = require('path');
const db = require('./config/connection');
// import ApolloServer
const {ApolloServer} = require('apollo-server-express');
// import typeDef and resolvers
const {typeDefs,resolvers}= require('./schemas')
// import authMiddleware from auth.js file 
const{ authMiddleware } = require('./utils/auth');
const app = express();
const PORT = process.env.PORT || 3001;

// create a new apollo server to pass in schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context:authMiddleware
})

// use ApolloServer with express
server.start().then(res=>
  server.applyMiddleware({app})
  );
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// app.use(routes);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
