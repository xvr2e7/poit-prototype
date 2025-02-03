import { useState } from "react";

export const useAuthForm = (onLogin) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the API call for login/register
    console.log(
      `${isRegistering ? "Registering" : "Logging in"} with:`,
      formData
    );
    onLogin(formData);
  };

  const toggleMode = () => {
    setIsRegistering((prev) => !prev);
    // Clear form when switching modes
    setFormData({
      username: "",
      password: "",
    });
  };

  return {
    isRegistering,
    formData,
    handleInputChange,
    handleSubmit,
    toggleMode,
  };
};
