const curBrowser = (typeof chrome !== 'undefined') ? chrome : (typeof browser !== 'undefined' ? browser : null);


const controller = new AbortController();
const signal = controller.signal;

async function sendRequest(text) {
  const containerUrl = ""; // MUST CHANGE

  // Set the request body
  const postData = {
    rawDocument: {
      text: text,
    },
  };

  // This attempts to send the request to the sentiment analysis model
  // It waits until a response is received
  try {
    const response = await fetch(containerUrl, {
      method: "POST",
      body: JSON.stringify(postData),
      headers: {
        "Content-Type": "application/json",
        "grpc-metadata-mm-model-id":
          "sentiment_aggregated-cnn-workflow_lang_en_stock",
      },
      signal,
    });
    // Parse and save the response from the sentiment analysis model
    const data = await response.json();

    // Handle the response data from the sentiment analysis model
    const label = data["documentSentiment"]["label"];
    if (label == "SENT_POSITIVE") return 1;
    if (label == "SENT_NEGATIVE") return -1;
    return 0;
  } catch (error) {
    // Handle any errors that occurred while making the request, right now just display it in the browser console
    console.error(error);
  }
}

async function analyzeSentiment(text) {
  // send the request with the text that needs to be analyzed
  const sentiment = await sendRequest(text);
  tweetSentiment[text] = sentiment; // save response in an object
  // send the sentiment data out to other scripts
  browser.runtime.sendMessage({
    type: "sentiment",
    data: tweetSentiment,
  });
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


curBrowser.runtime.onMessage.addListener(function (message) {
  // reset sentiment if `resetSentiment` is seen
  if (message.type === "resetSentiment") tweetSentiment = {};
});
