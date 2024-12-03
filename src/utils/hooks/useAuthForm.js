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
    onLogin(formData);
  };

  const toggleMode = () => setIsRegistering((prev) => !prev);

  return {
    isRegistering,
    formData,
    handleInputChange,
    handleSubmit,
    toggleMode,
  };
};
