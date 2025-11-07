// // File: src/components/Auth/LoginForm.tsx (Updated)
// import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import {
//   Alert,
//   Box,
//   Button,
//   Checkbox,
//   CircularProgress,
//   IconButton,
//   InputAdornment,
//   TextField,
//   Typography,
// } from "@mui/material";
// import React, { useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
// import FormTitle from "./FormTitle";

// interface LoginFormProps {
//   onSubmit: () => void;
// }

// const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);

//   const { agencyLogin, isLoginLoading, loginError } = useAuth();

//   const handleTogglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!email || !password) {
//       return;
//     }

//     agencyLogin({ email, password });
//   };

//   // Get error message
//   const getErrorMessage = () => {
//     if (!loginError) return null;

//     if (loginError instanceof Error) {
//       return loginError.message;
//     }

//     if (typeof loginError === "object" && "response" in loginError) {
//       const axiosError = loginError as any;
//       return axiosError.response?.data?.message || "Login failed. Please try again.";
//     }

//     return "An unexpected error occurred.";
//   };

//   return (
//     <>
//       <FormTitle title="Console Login" />

//       {/* Container with fixed height to prevent layout shift */}
//       <Box
//         sx={{
//           width: "400px",
//           height: "360px", // Increased to accommodate error message
//           display: "flex",
//           flexDirection: "column",
//           position: "relative",
//         }}
//       >
//         {/* Error Alert - Positioned absolutely to avoid layout shift */}
//         {loginError && (
//           <Alert
//             severity="error"
//             sx={{
//               position: "absolute",
//               top: "0",
//               left: "0",
//               right: "0",
//               zIndex: 10,
//               fontSize: "12px",
//               padding: "8px 16px",
//               marginBottom: "0",
//               "& .MuiAlert-message": {
//                 fontSize: "12px",
//                 lineHeight: "16px",
//               },
//             }}
//           >
//             {getErrorMessage()}
//           </Alert>
//         )}

//         {/* Form Content with top margin when error is present */}
//         <Box
//           component="form"
//           onSubmit={handleSubmit}
//           sx={{
//             width: "400px",
//             height: "280px",
//             display: "flex",
//             flexDirection: "column",
//             gap: "56px",
//             marginTop: loginError ? "56px" : "0", // Push content down when error is visible
//             transition: "margin-top 0.3s ease-in-out", // Smooth transition
//           }}
//         >
//           {/* Fields */}
//           <Box
//             sx={{
//               width: "400px",
//               height: "176px",
//               display: "flex",
//               flexDirection: "column",
//               gap: "24px",
//             }}
//           >
//             {/* Email Field */}
//             <TextField
//               fullWidth
//               type="email"
//               placeholder="Email"
//               variant="outlined"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               disabled={isLoginLoading}
//               required
//               sx={{
//                 width: "400px",
//                 height: "48px",
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "6px",
//                   height: "48px",
//                   background: "#FFFFFF",
//                 },
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "#A3A3A3",
//                   borderWidth: "1px",
//                 },
//                 "& .MuiInputBase-input": {
//                   padding: "16px",
//                 },
//               }}
//             />

//             {/* Password Field */}
//             <TextField
//               fullWidth
//               type={showPassword ? "text" : "password"}
//               placeholder="Password"
//               variant="outlined"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               disabled={isLoginLoading}
//               required
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton
//                       aria-label="toggle password visibility"
//                       onClick={handleTogglePasswordVisibility}
//                       edge="end"
//                       disabled={isLoginLoading}
//                       sx={{ color: "#94A3B8" }}
//                     >
//                       {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//               sx={{
//                 width: "400px",
//                 height: "48px",
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "6px",
//                   height: "48px",
//                   background: "#FFFFFF",
//                 },
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "#A3A3A3",
//                   borderWidth: "1px",
//                 },
//                 "& .MuiInputBase-input": {
//                   padding: "16px",
//                 },
//               }}
//             />

//             {/* Supporting Actions */}
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 width: "100%",
//               }}
//             >
//               {/* Remember Me */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   width: "150px",
//                   height: "24px",
//                   gap: "4px",
//                   paddingTop: "2px",
//                   paddingBottom: "2px",
//                 }}
//               >
//                 <Checkbox
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   disabled={isLoginLoading}
//                   size="small"
//                   sx={{
//                     width: "20px",
//                     height: "20px",
//                     color: "#94A3B8",
//                     "&.Mui-checked": {
//                       color: "#2E7CF6",
//                     },
//                   }}
//                 />
//                 <Typography
//                   sx={{
//                     width: "75px",
//                     height: "16px",
//                     fontSize: "12px",
//                     color: "#A3A3A3",
//                     fontWeight: "500",
//                     paddingTop: "4px",
//                     paddingBottom: "4px",
//                     lineHeight: "8px",
//                     letterSpacing: "0%",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   Remember Me
//                 </Typography>
//               </Box>

//               {/* Forgot Password */}
//               <Button
//                 variant="text"
//                 disabled={isLoginLoading}
//                 sx={{
//                   fontSize: "14px",
//                   fontWeight: 500,
//                   color: "#2E7CF6",
//                   padding: "0",
//                   minWidth: "auto",
//                   textTransform: "uppercase",
//                 }}
//                 onClick={() => console.log("Forgot password clicked")}
//               >
//                 FORGOT PASSWORD ?
//               </Button>
//             </Box>
//           </Box>

//           {/* Login Button */}
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               width: "100%",
//             }}
//           >
//             <Button
//               type="submit"
//               disabled={isLoginLoading || !email || !password}
//               sx={{
//                 width: "280px",
//                 height: "48px",
//                 backgroundColor: "#FFFFFF",
//                 color: "#2A77D5",
//                 borderRadius: "8px",
//                 padding: "16px 24px",
//                 textTransform: "uppercase",
//                 fontWeight: 700,
//                 fontSize: "24px",
//                 lineHeight: "40px",
//                 letterSpacing: "0%",
//                 boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
//                 "&:hover": {
//                   backgroundColor: "#FFFFFF",
//                   boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
//                 },
//                 "&.Mui-disabled": {
//                   backgroundColor: "#F0F0F0",
//                   color: "#A0A0A0",
//                   boxShadow: "none",
//                 },
//               }}
//             >
//               {isLoginLoading ? <CircularProgress size={24} color="inherit" /> : "LOGIN"}
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </>
//   );
// };

// export default LoginForm;

// File: src/components/Auth/LoginForm.tsx (Updated)
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import FormTitle from "./FormTitle";

interface LoginFormProps {
  onSubmit: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { agencyLogin, isLoginLoading, loginError, loginSuccess } = useAuth();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    agencyLogin({ email, password });
  };

  // Get error message
  const getErrorMessage = () => {
    if (!loginError) return null;

    if (loginError instanceof Error) {
      return loginError.message;
    }

    if (typeof loginError === "object" && "response" in loginError) {
      const axiosError = loginError as any;
      return axiosError.response?.data?.message || "Login failed. Please try again.";
    }

    return "An unexpected error occurred.";
  };

  return (
    <>
      <FormTitle title="Console Login" />

      {/* Container with fixed height to prevent layout shift */}
      <Box
        sx={{
          width: "400px",
          height: "360px", // Increased to accommodate error message
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Success Alert */}
        {loginSuccess && (
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon />}
            sx={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              zIndex: 10,
              fontSize: "12px",
              padding: "8px 16px",
              marginBottom: "0",
              "& .MuiAlert-message": {
                fontSize: "12px",
                lineHeight: "16px",
              },
            }}
          >
            Login successful! Redirecting...
          </Alert>
        )}

        {/* Error Alert - Positioned absolutely to avoid layout shift */}
        {loginError && !loginSuccess && (
          <Alert
            severity="error"
            sx={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              zIndex: 10,
              fontSize: "12px",
              padding: "8px 16px",
              marginBottom: "0",
              "& .MuiAlert-message": {
                fontSize: "12px",
                lineHeight: "16px",
              },
            }}
          >
            {getErrorMessage()}
          </Alert>
        )}

        {/* Form Content with top margin when error/success is present */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "400px",
            height: "280px",
            display: "flex",
            flexDirection: "column",
            gap: "56px",
            marginTop: loginError || loginSuccess ? "56px" : "0", // Push content down when alert is visible
            transition: "margin-top 0.3s ease-in-out", // Smooth transition
          }}
        >
          {/* Fields */}
          <Box
            sx={{
              width: "400px",
              height: "176px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Email Field */}
            <TextField
              fullWidth
              type="email"
              placeholder="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoginLoading || loginSuccess}
              required
              sx={{
                width: "400px",
                height: "48px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  height: "48px",
                  background: "#FFFFFF",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#A3A3A3",
                  borderWidth: "1px",
                },
                "& .MuiInputBase-input": {
                  padding: "16px",
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoginLoading || loginSuccess}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={isLoginLoading || loginSuccess}
                      sx={{ color: "#94A3B8" }}
                    >
                      {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "400px",
                height: "48px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  height: "48px",
                  background: "#FFFFFF",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#A3A3A3",
                  borderWidth: "1px",
                },
                "& .MuiInputBase-input": {
                  padding: "16px",
                },
              }}
            />

            {/* Supporting Actions */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Remember Me */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "150px",
                  height: "24px",
                  gap: "4px",
                  paddingTop: "2px",
                  paddingBottom: "2px",
                }}
              >
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoginLoading || loginSuccess}
                  size="small"
                  sx={{
                    width: "20px",
                    height: "20px",
                    color: "#94A3B8",
                    "&.Mui-checked": {
                      color: "#2E7CF6",
                    },
                  }}
                />
                <Typography
                  sx={{
                    width: "75px",
                    height: "16px",
                    fontSize: "12px",
                    color: "#A3A3A3",
                    fontWeight: "500",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    lineHeight: "8px",
                    letterSpacing: "0%",
                    whiteSpace: "nowrap",
                  }}
                >
                  Remember Me
                </Typography>
              </Box>

              {/* Forgot Password */}
              <Button
                variant="text"
                disabled={isLoginLoading || loginSuccess}
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2E7CF6",
                  padding: "0",
                  minWidth: "auto",
                  textTransform: "uppercase",
                }}
                onClick={() => console.log("Forgot password clicked")}
              >
                FORGOT PASSWORD ?
              </Button>
            </Box>
          </Box>

          {/* Login Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              type="submit"
              disabled={isLoginLoading || !email || !password || loginSuccess}
              sx={{
                width: "280px",
                height: "48px",
                backgroundColor: loginSuccess ? "#4CAF50" : "#FFFFFF",
                color: loginSuccess ? "#FFFFFF" : "#2A77D5",
                borderRadius: "8px",
                padding: "16px 24px",
                textTransform: "uppercase",
                fontWeight: 700,
                fontSize: "24px",
                lineHeight: "40px",
                letterSpacing: "0%",
                boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
                "&:hover": {
                  backgroundColor: loginSuccess ? "#4CAF50" : "#FFFFFF",
                  boxShadow: "0px 1px 4px 0px rgba(112, 112, 112, 0.2)",
                },
                "&.Mui-disabled": {
                  backgroundColor: loginSuccess ? "#4CAF50" : "#F0F0F0",
                  color: loginSuccess ? "#FFFFFF" : "#A0A0A0",
                  boxShadow: "none",
                },
              }}
            >
              {isLoginLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : loginSuccess ? (
                <>
                  <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                  SUCCESS
                </>
              ) : (
                "LOGIN"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LoginForm;
