document.addEventListener("DOMContentLoaded", () => {
    const hourSelect = document.getElementById("hour");
    const minuteSelect = document.getElementById("minute");
    const daySpan = document.getElementById("daySpan");
    const timestampInput = document.querySelector('input[name="timestamp"]');

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    function updateAlarmDay() {
        const now = new Date();
        const selectedHour = parseInt(hourSelect.value, 10);
        const selectedMinute = parseInt(minuteSelect.value, 10);

        // Create a Date object for the alarm today
        const alarmDate = new Date();
        alarmDate.setHours(selectedHour, selectedMinute, 0, 0);

        // If the alarm time is earlier or equal to current time, it's set for tomorrow
        if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }

        // Get the corresponding day string (e.g., "FRI", "SAT")
        const targetDayStr = days[alarmDate.getDay()];

        // Update UI span
        daySpan.textContent = targetDayStr;

        // Store the exact Unix timestamp in the hidden input
        timestampInput.value = alarmDate.getTime();
    }

    // Listen for changes on selects
    hourSelect.addEventListener("change", updateAlarmDay);
    minuteSelect.addEventListener("change", updateAlarmDay);

    // Run immediately on load to prevent any placeholder lag
    updateAlarmDay();
});