'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');

const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
// const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';

// Mac:
const conString = 'postgres://localhost:5432/kilovolt';

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new-article', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  // This is at step 5. It doesn't interact with article.js until the user interacts with the page, and loads new.html. this is a read since the user gains the new page.
  response.sendFile('new.html', { root: './public' });
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This gets all of the articles from the database, so it's at step 3. It's a query to get the files. Later on in the code, it goes to step 4 with the result, and then step 5 with the response to the user back again, but for the most part the proceeding line is step 3. fetchAll() is interacting with this get by getting every article. This is a read.
  let SQL = 'SELECT * from articles;'
  client.query(SQL)
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
      response.status(500).send(err);
    })
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // The post corresponds to step 2. later on, it goes to 3, and 4, and 5 but the proceeding code corresponds to a request which is step 2. This post is in charge of rendering the articles, which is a create. it doesn't interact with any element in article.js, but the data eventually gets toHtml()'d.
  let SQL = `
    INSERT INTO articles(title, author, author_url, category, published_on, body)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  let values = [
    request.body.title,
    request.body.author,
    request.body.author_url,
    request.body.category,
    request.body.published_on,
    request.body.body
  ]

  client.query(SQL, values)
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
      response.status(500).send(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is an update. This is step number 3 and 4 and 5 of the mvc model: it asks for the particular article to be updated, it returns a result and gives a response to the user. it interacts with updateRecord().

  let SQL = `UPDATE articles 
  SET 
    title = $1,
    author = $2,
    author_url = $3,
    category = $4, 
    published_on = $5,
    body = $6
  WHERE article_id = $7;`;
  let values = [
    request.body.title,
    request.body.author,
    request.body.author_url,
    request.body.category,
    request.body.published_on,
    request.body.body,
    request.params.id
  ];

  client.query(SQL, values)
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
      response.status(500).send(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is 3,4,5 steps and interacts with deleteRecord() in article.js. It is a destroy.

  let SQL = `DELETE FROM articles WHERE article_id=$1;`;
  let values = [request.params.id];

  client.query(SQL, values)
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
      response.status(500).send(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is steps 3, 4, and 5. It interacts with Article.truncateTable(). It is a Destroy. 

  let SQL = 'TRUNCATE TABLE articles';
  client.query(SQL)
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
      response.status(500).send(err);
    });
});

// COMMENT: What is this function invocation doing?
// loadDB() creates the database if it doesn't exist and loads all of the articles to be shown on the page through an SQL query.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //  This creates the view for the user. It interacts with the loadAll() and fetchAll(). this is a Read, since it reads things in the database for the viewer to view.

  let SQL = 'SELECT COUNT(*) FROM articles';
  client.query(SQL)
    .then(result => {
      // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
      // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
      // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if (!parseInt(result.rows[0].count)) { // "250" => 250
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            let SQL = `
              INSERT INTO articles(title, author, author_url, category, published_on, body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `;
            let values = [ele.title, ele.author, ele.author_url, ele.category, ele.published_on, ele.body];
            client.query(SQL, values);
          })
        })
      }
    })
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is step 4 and 5. It is being interacted with by fetchAll(). It is a Create if the table doesn't exist, and is a Read anyways. 
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      author_url VARCHAR (255),
      category VARCHAR(20),
      published_on DATE,
      body TEXT NOT NULL);`)
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
