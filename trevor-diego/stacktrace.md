### Stacktrace.md
This md file tries to explain where files are within the process of ajax calls, database queries, and etc.

## The New Article Route
Right now, we have nothing to direct the user to new-article so if the user just asks for new.html by printing it in the URL they’d get it. That would straight hit app.get /new-article. It is given a request object as request, that will send the file to the user in new.html. Then, new.html does its thing which aside from the libraries calls articleView.initNewArticlePage(), which creates listeners to the page. Other than that, nothing else is chained. 

## The Home Route

this runs autonomously when index.html loads. 
fetchAll(ArticleView.initIndexPage); 
does an AJAX call to get /articles and hits our server.
it hits on our app.get /articles, which gets the request as an express object in the param variable request. It proceeds to run an SQL statement to SELECT every article and send their row content back to the client as a JSON object that gets interpreted by the browser into a normal object. You do this with the response object which sends back to the client using the send method.

Then, fetchAll takes the results and passes it to loadAll, which takes the AJAX data and puts it into the array Article.all.

now, initIndexPage() is called as a callback through fetchAll().

initIndexPage() calls
	forEach on Article.all to do article.toHtml() which renders the articles as html using jquery,
and also calls
  articleView.populateFilters();, which literally just adds content to both category and author filters using jquery listeners,
  articleView.handleCategoryFilter();, which adds a listener to the category filter that changes the html content based on what is selected,
  articleView.handleAuthorFilter();, which adds a listener to the author filter that changes the html content based on what is selected,
  articleView.handleMainNav();, which adds a listener to the tabs on the navigation bar to redirect users to pages of their choice,
  articleView.setTeasers();, which hides elements of an article so that only the titles, author, publish date, and first paragraph are showing until you click on the read-on which is managed by a listener, 

and sets up a function for highlight code using jquery.