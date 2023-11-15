const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const JWT_SECRET =
  "a5f9e724d62c32cef6a47cbe9a9681894ea5f355ec31de3996d0167cde87bbff1646496728919bc8ea40d209a777d3b9151e0d79ce1a927334f2148f31abde5f";
// Require all models
const db = require("./models");
console.log(db);

// Require body parser and logger
const bodyParser = require("body-parser");
const logger = require("morgan");

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://mohsin:R359rWDQHmq3c42C@dash.puuvdd7.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(
    (_) => {
      console.log(`Server correctly connected`);
    },
    (err) => {
      console.log("Error occured while connecting", err);
    }
  );

const port = 4000;

// Initialize Express
const app = express();

// Enable All CORS Requests
app.use(cors());

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public static folder
app.use(express.static("public"));

// const Volunteer = require("./models/Volunteer")

mongoose.set("useFindAndModify", false);

// use body parser and logger
app.use(logger("dev"));
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/register", async (req, res) => {
  try {
    const user = new db.User(req.body);
    await user.save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/add-doctor", async (req, res) => {
  try {
    const user = new db.User({ type: "Doctor", ...req.body });
    await user.save();
    res.status(201).send({ message: "Doctor created successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.patch("/update-doctor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialisation } = req.body;
    const updatedDoctor = await db.User.findOneAndUpdate(
      { _id: id, type: "doctor" },
      { name: name, specialisation: specialisation },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).send({ message: "Doctor not found" });
    }

    res.send({ message: "Doctor updated successfully", updatedDoctor });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/delete-doctor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await db.User.findByIdAndDelete({
      _id: id,
      type: "Doctor",
    });

    if (!doctor) {
      return res.status(404).send({ message: "Doctor not found" });
    }

    res.send({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("error", error);
    res.status(500).send(error);
  }
});

app.get("/get-doctors", async (req, res) => {
  try {
    const doctors = await db.User.find({ type: "doctor" });
    res.status(200).send(doctors);
  } catch (error) {
    console.log("error", error);
    res.status(500).send(error);
  }
});

app.post("/add-patient", async (req, res) => {
  try {
    const patient = new db.Patient(req.body);
    await patient.save();
    res.status(201).send({ message: "Patient created successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(400).send(error);
  }
});

app.patch("/update-patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      address,
      age,
      dateOfBirth,
      disease,
      email,
      fullName,
      gender,
      phone,
    } = req.body;
    const updatedPatient = await db.Patient.findOneAndUpdate(
      { _id: id },
      {
        address,
        age,
        dateOfBirth,
        disease,
        email,
        fullName,
        gender,
        phone,
      },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).send({ message: "Patient not found" });
    }

    res.send({ message: "Patient updated successfully", updatedPatient });
  } catch (error) {
    console.error("error", error);
    res.status(400).send(error);
  }
});

app.get("/get-all-patients", async (req, res) => {
  try {
    const patients = await db.Patient.find({});
    res.status(200).send(patients);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/delete-patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await db.Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).send({ message: "Patient not found" });
    }

    res.send({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("error", error);
    res.status(500).send(error);
  }
});

app.post("/add-appointment", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      // date: convertToDate(req.body?.date),
    };
    const appointment = new db.Appointment(payload);
    await appointment.save();

    res
      .status(201)
      .send({ message: "Appointment created successfully", appointment });
  } catch (error) {
    console.log("error", error);
    res.status(400).send(error);
  }
});

app.get("/get-appointments", async (req, res) => {
  try {
    const { patientId, doctorId, startDate, endDate } = req.query;
    let query = {};

    if (patientId) {
      query.patient = patientId;
    } else if (doctorId) {
      query.doctor = doctorId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const appointments = await db.Appointment.find(query).populate(
      "doctor patient"
    );
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch("/cancel-appointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAppointment = await db.Appointment.findByIdAndUpdate(
      id,
      { status: "CANCELED" },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).send({ message: "Appointment not found" });
    }

    res.send({
      message: "Appointment canceled successfully",
      updatedAppointment,
    });
  } catch (error) {
    console.log("🚀 ~ error:", error);
    res.status(500).send(error);
  }
});

app.patch("/reschedule-appointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body; // assuming the new date is passed in the request body

    // Validate newDate or convert to correct format if necessary

    const updatedAppointment = await db.Appointment.findByIdAndUpdate(
      id,
      { date: newDate },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).send({ message: "Appointment not found" });
    }

    res.send({
      message: "Appointment rescheduled successfully",
      updatedAppointment,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/bookings/all", async (req, res) => {
  try {
    const appointments = await db.Appointment.find().populate("doctor patient");
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/doctor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointments = await db.Appointment.find({ doctor: id }).populate(
      "doctor patient"
    );
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/bookings/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointments = await db.Appointment.find({ patient: id }).populate(
      "doctor patient"
    );
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
  }
});

function convertToDate(dateString) {
  const parts = dateString.split("-");
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

// Route for retrieving a Volunteer by id and populating it's Addresses.
app.get("/volunteer/:vid", function (req, res) {
  // Using the vid passed in the vid parameter, prepare a query that finds the matching one in our db...
  db.Volunteer.findOne({ _id: req.params.vid })
    // ..and populate all of the address associated with it
    .populate("address")
    .populate("followers")
    .populate("following")
    .then(function (dbVolunteer) {
      // If we were able to successfully find an Volunteer with the given id, send it back to the client
      return res.send({
        success: true,
        message: "volunteer",
        data: dbVolunteer,
      });
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
