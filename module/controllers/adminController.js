import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, } from "../../helpers/jwt.js";
import sendEmail from "../../helpers/mailSender.js";
// import { isEmailvalid, isPasswordValid } from "../../helpers/validation.js";
import { genrateOTP } from "../../helpers/generateOtp.js"
import validator from "validator";
// import forgototpTemplate from "../../emailTemplates/forgototpTemplate.js";
import CryptoJS from "crypto-js";

import Patient from "../models/patientModel.js"
import Guardian from "../models/guardiansModel/guardianModel.js"
import Caretaker from "../models/caretakerModel/caretakerModel.js";

const isValidEmail = (email) => {
  return validator.isEmail(email);
};

const isStrongPassword = (password, newPassword) => {
  const options = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumber: 1,
    minSymbol: 1,
  };
  return validator.isStrongPassword(password, newPassword, options);
};
export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim();
    password = password?.trim();

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email required",
        result: {},
      });
    }
    if (!password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Password required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ email:email });
    console.log("admin",admin);
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    if (admin.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Admin account has been deleted",
        result: {},
      });
    }

    const dec_password = await bcrypt.compare(password, admin.password);
    console.log("dec_password",dec_password);
    if (!dec_password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Password mismatch",
        result: {},
      });
    }

    const _id = admin._id;
    const token = await generateAccessToken({
      _id: admin._id,
      email: admin.email,
      role: "admin", // extra info add kar sakte ho
    });

    admin.accesstoken = token;
    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Admin login successful",
      result: {
        _id,
        token,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in admin login API",
      result: {},
    });

  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const token = req.token; // middleware se aa raha hoga

    const admin = await Admin.findOne({ token });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    if (admin.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Admin account has been deleted",
        result: {},
      });
    }

    if (!admin.token) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    admin.token = "";
    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Admin logout successfully",
      result: {},
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in logout admin API",
      result: {},
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    let { _id } = req.token;
    let { oldPassword, newPassword, confirmPassword } = req.body;

    oldPassword = oldPassword?.trim();
    newPassword = newPassword?.trim();
    confirmPassword = confirmPassword?.trim();

    if (!_id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Id required",
        result: {},
      });
    }

    const admin = await Admin.findById(_id);

    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    if (admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    if (!oldPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required old password",
        result: {},
      });
    }

    if (!newPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required new password",
        result: {},
      });
    }

    if (!isPasswordValid(newPassword)) {
      return res.send({
        statusCode: 400,
        success: false,
        message:
          "Password must have at least one uppercase, one lowercase, one number, and one symbol",
        result: {},
      });
    }

    if (!confirmPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required confirm password",
        result: {},
      });
    }

    if (newPassword !== confirmPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Confirm password must be same as new password",
        result: {},
      });
    }

    const isOldMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isOldMatch) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Old Password is incorrect",
        result: {},
      });
    }

    const isMatch = await bcrypt.compare(newPassword, admin.password);

    if (isMatch) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "New password cannot be same as old password",
        result: {},
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      result: {},
    });
  } catch (error) {
    console.log(error);

    return res.send({
      statusCode: 400,
      success: false,
      message: error.message + " Error in change password API",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email?.toLowerCase()?.trim();
    otp = otp?.trim();
    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email is required",
      });
    }
    if (!otp) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "OTP is required",
      });
    }
    if (otp.length !== 4) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "OTP should be 4 digits",
      });
    }

    let admin = await Admin.findOne({ email, status: "Active" });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
      });
    }
    if (admin === "Delete") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Admin account has been delete",
      });
    }
    if (admin === "Blocked") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Admin account has been Block",
        result: {},
      });
    }
    if (admin.otp.otpValue !== otp) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Invalid OTP",
        result: {},
      });
    }
    if (admin.otp.otpExpiry < Date.now()) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "OTP expired",
      });
    }
    admin.otp.otpValue = null;
    admin.otp.otpExpiry = null;

    const securityToken = CryptoJS.lib.WordArray.random(16).toString(
      CryptoJS.enc.Hex
    );
    admin.securityToken = securityToken;
    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      result: { securityToken },
    });
  } catch (error) {
    console.log(error);
    return res.send({
      success: false,
      message: error.message + " Error in verify OTP API",
      statusCode: 400,
    });
  }
};

// export const adminForgotPassword = async (req, res) => {
//   try {
//     let { email } = req.body;
//     email = email?.toLowerCase()?.trim();

//     if (!email) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Email is required",
//         result: {},
//       });
//     }

//     if (!isValidEmail(email)) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Invalid email format",
//         result: {},
//       });
//     }

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.send({
//         statusCode: 404,
//         success: false,
//         message: "Admin not found",
//         result: {},
//       });
//     }

//     if (admin.status === "Delete" || admin.status === "Block") {
//       return res.send({
//         statusCode: 403,
//         success: false,
//         message:
//           admin.status === "Delete"
//             ? "Admin account has been deleted"
//             : "Admin account has been blocked",
//         result: {},
//       });
//     }

//     // Generate OTP
//     const { otpValue, otpExpiry } = genrateOTP();
//     admin.otp = { otpValue, otpExpiry };

//     // Prepare inline HTML
//     const name = admin.adminName || "Admin";
//     const subject = "OTP for Forgot Password";

//     const body = `
//       <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f6f6;">
//         <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #ddd;">
//           <h2 style="color: #333;">Hello ${name},</h2>
//           <p style="font-size: 16px; color: #555;">
//             You requested to reset your password. Use the following OTP to proceed:
//           </p>
//           <div style="text-align: center; margin: 20px 0;">
//             <span style="display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2c3e50; background: #f1f1f1; padding: 10px 20px; border-radius: 6px;">
//               ${otpValue}
//             </span>
//           </div>
//           <p style="font-size: 14px; color: #777;">
//             This OTP is valid for the next <strong>10 minutes</strong>. Please do not share it with anyone.
//           </p>
//           <p style="font-size: 14px; color: #777;">
//             If you did not request a password reset, please ignore this email.
//           </p>
//           <hr style="margin: 20px 0;" />
//           <p style="font-size: 12px; color: #999; text-align: center;">
//             &copy; ${new Date().getFullYear()} Medipillpall. All rights reserved.
//           </p>
//         </div>
//       </div>
//     `;  

//     // Send email
//     if (admin.email) {
//       await sendEmail(subject, admin.email, body);
//     }

//     await admin.save();

//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "OTP sent successfully to registered email",
//       result: { otpValue }, // ⚠️ production में हटा देना better रहेगा
//     });
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: "Error in forgot password API: " + error.message,
//       result: {},
//     });
//   }
// };

export const adminForgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase()?.trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        result: {},
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        result: {},
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    // Generate OTP
    const { otpValue, otpExpiry } = genrateOTP();
    admin.otp = { otpValue, otpExpiry };

    await admin.save();

    const subject = "OTP for Admin Forgot Password";
    const body = `
      <p>Hello ${admin.adminName || "Admin"},</p>
      <p>Your OTP is: <strong>${otpValue}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      if (admin.email) {
        await sendEmail(subject, admin.email, body);
        console.log("OTP email sent to:", admin.email);
      }
    } catch (err) {
      console.error("Email sending failed:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: "OTP generated and email sent (if SMTP allows)",
      result: { otpValue }, // ⚠️ production me remove kar dena better
    });
  } catch (error) {
    console.error("Admin Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in admin forgot password API: " + error.message,
      result: {},
    });
  }
};


// export const adminForgotPassword = async (req, res) => {
//   try {
//     let { email } = req.body;
//     email = email?.toLowerCase()?.trim();

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//         result: {},
//       });
//     }

//     if (!isValidEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//         result: {},
//       });
//     }

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(404).json({
//         success: false,
//         message: "Admin not found",
//         result: {},
//       });
//     }

//     if (admin.status === "Delete" || admin.status === "Block") {
//       return res.status(403).json({
//         success: false,
//         message:
//           admin.status === "Delete"
//             ? "Admin account has been deleted"
//             : "Admin account has been blocked",
//         result: {},
//       });
//     }

//     // Generate OTP
//     const { otpValue, otpExpiry } = genrateOTP();
//     admin.otp = { otpValue, otpExpiry };

//     // Save OTP first
//     await admin.save();
//     console.log("OTP saved for:", admin.email, "OTP:", otpValue);

//     // Prepare simple mail (Resend OTP style)
//     const subject = "Your OTP for Forgot Password";
//     const body = `
//       <p>Hello ${admin.adminName || "Admin"},</p>
//       <p>Your OTP is: <strong>${otpValue}</strong></p>
//       <p>This OTP is valid for 10 minutes.</p>
//       <p>If you did not request this, please ignore this email.</p>
//     `;

//     // Use same sendEmail as Resend OTP
//     try {
//       if (admin.email) {
//         await sendEmail(subject, String(admin.email), body);
//         console.log("Email sent successfully to:", admin.email);
//       }
//     } catch (err) {
//       console.error("Email sending failed:", err.message);
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "OTP generated and email sent (if SMTP allows) — works like Resend OTP",
//       result: { otpValue }, // ⚠️ production me remove kar dena better
//     });
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error in forgot password API: " + error.message,
//       result: {},
//     });
//   }
// };


export const changeForgotPassword = async (req, res) => {
  try {
    let { email, newPassword, confirmPassword, securityToken } = req.body;

    email = email?.toLowerCase()?.trim();
    newPassword = newPassword?.trim();
    confirmPassword = confirmPassword?.trim();

    // ✅ Validations
    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email is required",
        result: {},
      });
    }

    if (!newPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Please enter new password",
        result: {},
      });
    }

    if (!confirmPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Please enter confirm password",
        result: {},
      });
    }

    if (!securityToken) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Security token is required",
        result: {},
      });
    }

    if (newPassword !== confirmPassword) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Confirm password must match new password",
        result: {},
      });
    }

    // ✅ Find admin with email + token
    const admin = await Admin.findOne({ email, securityToken });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found or invalid token",
        result: {},
      });
    }

    // ✅ Prevent reusing same password
    const isMatch = await bcrypt.compare(newPassword, admin.password);
    if (isMatch) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "New password cannot be same as old password",
        result: {},
      });
    }

    // ✅ Hash and save new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    admin.password = hashedPassword;
    admin.securityToken = ""; // clear token after use

    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Password reset successfully",
      result: {},
    });
  } catch (error) {
    console.error("Change Forgot Password Error:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message || "Error in change forgot password API",
      result: {},
    });
  }
};

// exports.changepassword = async (req, res) => {
//   try {
//     let { _id } = req.token;
//     let { oldPassword, newPassword, confirmPassword } = req.body;

//     oldPassword = oldPassword?.trim();
//     newPassword = newPassword?.trim();
//     confirmPassword = confirmPassword?.trim();
//     if (!_id) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Id required",
//         result: {},
//       });
//     }

//     const admin = await Admin.findOne({ _id: _id });
//     if (!admin) {
//       return res.send({
//         statusCode: 404,
//         success: false,
//         message: "Admin not found",
//         result: {},
//       });
//     }
//     if (admin.status === "Delete") {
//       return res.send({
//         statusCode: 401,
//         success: false,
//         message: "unauthorise access",
//         result: {},
//       });
//     }
//     if (!oldPassword) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Required old password",
//         result: {},
//       });
//     }
//     if (!newPassword) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Required new password",
//         result: {},
//       });
//     }
//     if (!isPasswordValid(newPassword)) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message:
//           "Password must have at least one uppercase one lowercase one one number and one symbol",
//         result: {},
//       });
//     }
//     if (!confirmPassword) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Required confirm password",
//         result: {},
//       });
//     }
//     if (newPassword != confirmPassword) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "confirm password must be same as new password",
//         result: {},
//       });
//     }
//     let isOldMatch = await bcrypt.compare(oldPassword, admin.password);

//     if (!isOldMatch) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Old Password is incorrect",
//         result: {},
//       });
//     }
//     let isMatch = await bcrypt.compare(newPassword, admin.password);

//     if (isMatch) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "New password can not be same as old password",
//         result: {},
//       });
//     }
//     const ene_password = await bcrypt.hashSync(newPassword, 10);
//     if (ene_password) {
//       admin.password = ene_password;
//       await admin.save();
//       return res.send({
//         statusCode: 200,
//         success: true,
//         message: "Password change successfully",
//         result: {},
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.send({
//       success: false,
//       message: error.message + " Error in change password API",
//       statusCode: 400,
//     });
//   }
// };

export const resendOTPForChangePassword = async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase();

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required email",
        result: {},
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    if (admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    const currentTime = Date.now();
    if (
      admin.otp?.otpExpiry &&
      currentTime < admin.otp.otpExpiry - 5 * 60 * 1000 + 30 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait! You can request OTP after 30 seconds",
        result: {},
      });
    }

    // Generate new OTP
    const { otpValue, otpExpiry } = genrateOTP();

    // Inline HTML template for email
    const body = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;">
        <h2 style="color:#2c3e50;">Change Password OTP</h2>
        <p>Hello ${admin.fullName || "Admin"},</p>
        <p>Resend OTP to forgot password is:</p>
        <h3 style="color:#e74c3c;">${otpValue}</h3>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <br/>
        <p style="color:#7f8c8d;">Regards,<br/>Support Team</p>
      </div>
    `;

    await sendEmail("OTP to Change Password", admin.email, body);

    // Save OTP in DB
    admin.otp.otpValue = otpValue;
    admin.otp.otpExpiry = otpExpiry;
    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP resent successfully",
      result: { otpValue }, // remove in production for security
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in resendOTPForChangePassword API",
      result: {},
    });
  }
};


export const sendForgotPasswordOTP = async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase();

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required email",
        result: {},
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    if (admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    // const currentTime = Date.now();
    // if (
    //   admin.otp?.otpExpiry &&
    //   currentTime < admin.otp.otpExpiry - 5 * 60 * 1000 + 30 * 1000
    // ) {
    //   return res.status(429).json({
    //     success: false,
    //     message: "Please wait! You can request OTP after 30 seconds",
    //     result: {},
    //   });
    // }

    // Generate new OTP
    const { otpValue, otpExpiry } = genrateOTP();

    // Inline HTML template for email
    const body = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;">
        <h2 style="color:#2c3e50;">Forgot Password OTP</h2>
        <p>Hello ${admin.fullName || "Admin"},</p>
        <p>Your forgot password OTP is:</p>
        <h3 style="color:#e74c3c;">${otpValue}</h3>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <br/>
        <p style="color:#7f8c8d;">Regards,<br/>Support Team</p>
      </div>
    `;

    await sendEmail("Forgot Password OTP", admin.email, body);

    // Save OTP in DB
    admin.otp.otpValue = otpValue;
    admin.otp.otpExpiry = otpExpiry;
    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP sent successfully",
      result: { otpValue }, // remove in production for security
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in sendForgotPasswordOTP API",
      result: {},
    });
  }
};

export const getDashboardPiechart = async (req, res) => {
  try {
    const token = req.token;
    const admin = await Admin.findOne({ _id: token._id, status: "Active" });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    const range = req.query.range || "month";
    let dateFilter = {};
    const now = new Date();

    if (range === "week") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateFilter.createdAt = { $gte: start };
    } else if (range === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.createdAt = { $gte: start };
    } else if (range === "year") {
      const start = new Date(now.getFullYear(), 0, 1);
      dateFilter.createdAt = { $gte: start };
    } else if (range === "custom") {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (!isNaN(startDate) && !isNaN(endDate)) {
        dateFilter.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    const totalActivePatients = await Patient.countDocuments({
      status: "Active",
      ...dateFilter,
    });
    const totalActiveGuardians = await Guardian.countDocuments({
      status: "Active",
      ...dateFilter,
    });
    const totalActiveCaretakers = await Caretaker.countDocuments({
      status: "Active",
      ...dateFilter,
    });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient, Guardian & Caretaker stats fetched successfully",
      result: {
        range,
        totalActivePatients,
        totalActiveGuardians,
        totalActiveCaretakers,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getDashboardPiechart",
      result: {},
    });
  }
};

export const getUserPiechartData = async (req, res) => {
  try {
    const token = req.token;
    const admin = await Admin.findOne({ _id: token._id, status: "Active" });
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    const range = req.query.range || "month";
    let dateFilter = {};
    const now = new Date();

    if (range === "week") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateFilter.createdAt = { $gte: start };
    } else if (range === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.createdAt = { $gte: start };
    } else if (range === "year") {
      const start = new Date(now.getFullYear(), 0, 1);
      dateFilter.createdAt = { $gte: start };
    } else if (range === "custom") {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (!isNaN(startDate) && !isNaN(endDate)) {
        dateFilter.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    const totalActivePatients = await Patient.countDocuments({
      status: "Active",
      ...dateFilter,
    });
    const totalPendingPatients = await Patient.countDocuments({
      status: "Pending",
      ...dateFilter,
    });
    const totalBlockedPatients = await Patient.countDocuments({
      status: "Blocked",
      ...dateFilter,
    });

    const totalActiveGuardians = await Guardian.countDocuments({
      status: "Active",
      ...dateFilter,
    });
    const totalPendingGuardians = await Guardian.countDocuments({
      status: "Pending",
      ...dateFilter,
    });
    const totalBlockedGuardians = await Guardian.countDocuments({
      status: "Blocked",
      ...dateFilter,
    });

    const totalActiveCaretakers = await Caretaker.countDocuments({
      status: "Active",
      ...dateFilter,
    });
    const totalPendingCaretakers = await Caretaker.countDocuments({
      status: "Pending",
      ...dateFilter,
    });
    const totalBlockedCaretakers = await Caretaker.countDocuments({
      status: "Blocked",
      ...dateFilter,
    });

    const totalPatients = totalActivePatients + totalPendingPatients + totalBlockedPatients;
    const totalGuardians = totalActiveGuardians + totalPendingGuardians + totalBlockedGuardians;
    const totalCaretakers = totalActiveCaretakers + totalPendingCaretakers + totalBlockedCaretakers;

    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient, Guardian & Caretaker stats fetched successfully",
      result: {
        range,
        totalActivePatients,
        totalPendingPatients,
        totalBlockedPatients,
        totalActiveGuardians,
        totalPendingGuardians,
        totalBlockedGuardians,
        totalActiveCaretakers,
        totalPendingCaretakers,
        totalBlockedCaretakers,
        patientPercentage: {
          active: totalPatients ? ((totalActivePatients / totalPatients) * 100).toFixed(2) : "0.00",
          pending: totalPatients ? ((totalPendingPatients / totalPatients) * 100).toFixed(2) : "0.00",
          blocked: totalPatients ? ((totalBlockedPatients / totalPatients) * 100).toFixed(2) : "0.00",
        },
        guardianPercentage: {
          active: totalGuardians ? ((totalActiveGuardians / totalGuardians) * 100).toFixed(2) : "0.00",
          pending: totalGuardians ? ((totalPendingGuardians / totalGuardians) * 100).toFixed(2) : "0.00",
          blocked: totalGuardians ? ((totalBlockedGuardians / totalGuardians) * 100).toFixed(2) : "0.00",
        },
        caretakerPercentage: {
          active: totalCaretakers ? ((totalActiveCaretakers / totalCaretakers) * 100).toFixed(2) : "0.00",
          pending: totalCaretakers ? ((totalPendingCaretakers / totalCaretakers) * 100).toFixed(2) : "0.00",
          blocked: totalCaretakers ? ((totalBlockedCaretakers / totalCaretakers) * 100).toFixed(2) : "0.00",
        },
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getUserPiechartData",
      result: {},
    });
  }
};
