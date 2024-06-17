// This function create the pie chart using the data provided
function createPieChart(data) {
  document.getElementById("myChart").remove();
  const canvas = document.createElement("canvas");
  canvas.id = "myChart";
  canvas.height = 400;
  canvas.width = 400;
  document.body.appendChild(canvas);
  const ctx = document.getElementById("myChart").getContext("2d");
  const graph = {
    type: "pie",
    data: {
      labels: ["Negative", "Neutral", "Positive"],
      datasets: [
        {
          label: "Sentiment Analysis",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.3)",
            "rgba(54, 162, 235, 0.3)",
            "rgba(50, 168, 82, 0.3)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(50, 168, 82, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  };
  new Chart(ctx, graph);
  return;
}

sentimentValues = [];

// NOTE: instead of "browser" please use "chrome" if you are planning to run the extension on the chrome browser
// Send a "getSentiment" request to load the sentiments already loaded
if (typeof chrome !== 'undefined') {
  const browser = chrome;
}
browser.runtime.sendMessage({ type: "getSentiment" });
browser.runtime.onMessage.addListener(function (message) {
  // Whenever new sentiments are found, this will trigger updating the sentimentValues data
  if (message.type === "sentimentValues") sentimentValues = message.data; // Set the object to the data received
  // Recreate the pie chart whenever there is any update
  createPieChart(sentimentValues);
});
