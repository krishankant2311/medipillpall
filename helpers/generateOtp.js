export const genrateOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expireTime = Date.now() + 5  * 60 * 1000;
  return {
    otpValue: otp.toString(),
    otpExpiry: expireTime 
  };
};
export default genrateOTP;
