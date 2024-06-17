if (typeof chrome !== 'undefined') {
  const browser = chrome;
}


let tweetSentiment = {};
// NOTE FOR CHROME: please swap "browser" for "chrome"
browser.runtime.onMessage.addListener(function (message) {
  // Listen for the "sentiment" message, if seen update the `tweetSentiment` object to the data received
  if (message.type === "sentiment") tweetSentiment = message.data;
});


let sentimentValues = [];

function countSentiments(obj) {
  // Use the Object.values method to convert the object into an array of values
  let values = Object.values(obj);

  // Use the reduce method to count the number of occurrences of each value
  let counts = values.reduce(
    (acc, val) => {
      acc[val == -1 ? String(val) : val]++;
      return acc;
    },
    { "-1": 0, 0: 0, 1: 0 }
  );

  // return the values of the object in an array
  return Object.values(counts);
}


// NOTE: instead of "browser" please use "chrome" if you are planning to run the extension on the chrome browser
browser.runtime.onMessage.addListener(function (message) {
  if (message.type === "sentiment") tweetSentiment = message.data; // Set the object to the data received

  // Get the counts of each sentiment value and send it to the other scripts
  sentimentValues = countSentiments(tweetSentiment);
  browser.runtime.sendMessage({
    type: "sentimentValues",
    data: sentimentValues,
  });
});
