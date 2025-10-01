import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connect} from "./config/db.js"
// import adminRoutes from "./routes/adminRoutes.js";
import patientRouter from "./module/routes/patientRoute.js"
import patientRecordRouter from "./module/routes/patientRecordRoute.js"
import medicationRouter from "./module/routes/medicationRoute.js";
import medicalHistoryRouter from "./module/routes/medicalHistoryRoute.js"
import prescriptionRouter from "./module/routes/prescriptionRoute.js"
import patientDietRouter from "./module/routes/patientDietRoutes.js"
import medicalReportRouter from "./module/routes/medicalReportRoute.js"
import HealthcareProviderRouter from "./module/routes/healthcareProviderRoute.js"
import patientTaskRouter from "./module/routes/patientTaskRoute.js"
import reminderRouter from "./module/routes/reminderRoute.js"
import adminRouter from "./module/routes/adminRoute.js"
import faqrouter from "./module/routes/patientFAQRoute.js"
import mealRouter from "./module/routes/patientMealRoute.js"
import activityRouter from "./module/routes/patientActivityRoute.js"
import termsandconditionRouter from "./module/routes/termsAndConditionsRoute.js"
import visitorRouter from "./module/routes/patientVisitorRoute.js"

dotenv.config();
connect();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api", (req, res) => {
  res.send("Server is Working Fine of medipillpall and successfully connected to database");
});
app.use("/api/admin", (req, res, next) => {
  console.log("Admin route hit:----", req.method, req.url);
  next();
});
// Routes
app.use('/api/patient', patientRouter);
app.use('/api/patientRecord',patientRecordRouter)  
app.use('/api/medication',medicationRouter)
app.use('/api/medicalHistory',medicalHistoryRouter)
app.use('/api/prescription',prescriptionRouter)
app.use('/api/patientDiet',patientDietRouter)
app.use('/api/medicalReport',medicalReportRouter)
app.use('/api/healthcareProvider',HealthcareProviderRouter)
app.use('/api/patientTask',patientTaskRouter) 
app.use('/api/reminder',reminderRouter)   
app.use('/api/admins',adminRouter)
app.use('/api/faq',faqrouter)
app.use('/api/termsAndConditions',termsandconditionRouter)
app.use('/api/meal',mealRouter)
app.use('/api/activity',activityRouter)
app.use('/api/visitor',visitorRouter)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  