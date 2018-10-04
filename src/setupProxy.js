const fruits = [
  { name: "apple", price: 1.99, currency: "EUR" },
  { name: "plum", price: 1.79, currency: "EUR" },
  { name: "watermelon", price: 1.05, currency: "EUR" }
];

// intentionally slow API endpoint, to simulate slow network
module.exports = function(app) {
  app.get("/fruits", (req, res) =>
    setTimeout(() => {
      res.set("Cache-Control", "public, max-age=300");
      res.send(fruits);
    }, 100 + Math.random() * 1900)
  );
};
