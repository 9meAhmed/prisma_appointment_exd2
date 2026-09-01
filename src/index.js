const { connectDB, disconnectDB } = require("./db/prisma");
const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start application:", error);
  process.exit(1);
});
