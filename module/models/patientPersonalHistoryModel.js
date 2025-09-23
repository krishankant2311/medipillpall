import mongoose from "mongoose";
import Patient from "./patientModel.js";
// import status from "statuses";
const personalHistorySchema = new mongoose.Schema({
patient_id : {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Patient",
    default:""
},
title:{
    type:String,
    default:""
},
historyType:{
type:String,
default:""
},
description:{
    type:String,
    default:""
},
status:{
    type:String,
    enum:["Active","Delete"],
    default:"Active",
},
},{timestamps:true});

 const PersonalHistory = mongoose.model("PersonalHistory",personalHistorySchema)
 export default PersonalHistory;