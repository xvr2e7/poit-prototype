import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { calculateTimeUntilTomorrow } from "../../../../utils/timeUtils";

export const TimeDisplay = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const { hours, minutes } = calculateTimeUntilTomorrow();
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center text-gray-600">
      <Clock className="w-4 h-4 mr-2" />
      <span>Resets in {timeLeft}</span>
    </div>
  );
};
