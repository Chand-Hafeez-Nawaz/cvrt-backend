const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const galleryRoutes =
require("./routes/galleryRoutes");
const complaintRoutes =
require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const facultyRoutes =
require("./routes/facultyRoutes");
const leaveRoutes =
  require("./routes/leaveRoutes");


app.use(cors());
app.use("/uploads",express.static("uploads"));
app.use("/api/gallery",galleryRoutes);
app.use("/api/complaints",complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty",facultyRoutes);
app.use(
  "/api/leave",leaveRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));

app.get("/", (req, res) => {
  res.send("CVRT Digital Notice Board Backend Running");
});

app.listen(5000, "0.0.0.0", () => {

  console.log(
    "Server Running on Port 5000"
  );

});
