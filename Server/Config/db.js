const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected:", conn.connection.host);

    // Drop the stale username_1 index if it exists without sparse:true
    // This causes E11000 when username is null for multiple users
    try {
      const usersCollection = conn.connection.collection("users");
      const indexes = await usersCollection.indexes();
      const usernameIndex = indexes.find((i) => i.name === "username_1");

      if (usernameIndex && !usernameIndex.sparse) {
        await usersCollection.dropIndex("username_1");
        console.log("Dropped stale username_1 index — will be recreated as sparse");
      }
    } catch (indexErr) {
      // Non-fatal — index may not exist
      console.warn("Index check skipped:", indexErr.message);
    }

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
