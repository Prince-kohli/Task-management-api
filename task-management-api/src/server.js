const { createServer } = require('./app');

const port = Number(process.env.PORT || 3000);

createServer()
  .then((app) => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
