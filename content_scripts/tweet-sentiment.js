if (typeof chrome !== 'undefined') {
  const browser = chrome;
}

// This function performs sentiment analysis on a given string of text
function analyzeSentiment(text) {
  // For now, just randomly return a sentiment value (1, -1, or 0)
  const sentiments = [1, -1, 0];
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

  // Save this sentiment value to this text in an object called `tweetSentiment`
  tweetSentiment[text] = sentiment;

  // NOTE: instead of "browser" please use "chrome" if you are planning to run the extension on the chrome browser
  // Send the other scripts the object with all the calculated sentiments
  browser.runtime.sendMessage({
    type: "sentiment",
    data: tweetSentiment,
  });

  // return the calculated sentiment value to use somewhere else
  return sentiment;
}


// This function performs sentiment analysis on the text of a Twitter post
// NOTE: This function does not handle the case with only an image, gif or video
function categorizeTweet(tweet) {
  // check if the tweet's DOM element already has been seen, if it has move on
  if (tweet.hasAttribute("sentiment")) return;
  // Grab all the span elements from the tweet (these contain all the text inside the tweet)
  const spans = tweet.querySelectorAll("span");
  // Create a spans array to hold all the different text in the spans
  const spanTexts = [];
  // Loop through each span and add them to the spanTexts array
  spans.forEach((span) => {
    spanTexts.push(span.innerText);
  });
  // Create a single string from all the elements in the array by joining each string. These are separated by a space.
  const text = spanTexts.join(" ");
  // Check if the text has been analyzed before if it has save the sentiment to the tweet's DOM element so it doesnt need to analyze it again
  if (text in tweetSentiment) {
    const sentiment = tweetSentiment[text];
    tweet.setAttribute("sentiment", sentiment);
    return;
  }
  // If the text hasnt been analyzed, do the sentiment analysis and save the sentiment to the DOM element
  const sentiment = analyzeSentiment(text);
  tweet.setAttribute("sentiment", sentiment);
}


// This function categorizes all tweets on the page by performing sentiment analysis on each one
function categorizeAllTweets(tweets) {
  // Loop through each object in tweets and find it's sentiment
  tweets.forEach((tweet) => {
    categorizeTweet(tweet);
  });
}


// This function gets all tweets and then categorizes them all
function doSentimentAnalysis() {
  tweets = document.querySelectorAll('[data-testid="tweetText"]');
  categorizeAllTweets(tweets);
}


// Make a global object that stores the current Tweet Sentiments that have been made
tweetSentiment = {};

// Make the Analysis happen everytime the page is scrolled
document.addEventListener("scroll", function () {
  doSentimentAnalysis();
});


browser.runtime.onMessage.addListener(function (message) {
  // reset sentiment if `resetSentiment` is seen
  if (message.type === "resetSentiment") tweetSentiment = {};
});
