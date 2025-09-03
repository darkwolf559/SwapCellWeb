const mongoose = require("mongoose");

const uri = "mongodb+srv://mobile_user:mickeynight242@cluster0.yqjmdmf.mongodb.net/phonemarket?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });
