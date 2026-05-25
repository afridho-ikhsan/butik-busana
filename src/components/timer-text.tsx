'use client'

import { useEffect, useState } from "react"

function TimerText({ targetDate, ...props }: { targetDate: number, [key: string]: any }) {
    const [seconds, setSeconds] = useState((targetDate - Date.now()) / 1000);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds - 1);
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup saat komponen unmount
    }, []);

    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const secs = Math.floor(timeInSeconds % 60);

        if (timeInSeconds <= 0) {
            return "00:00:00"; // Jika waktu habis, tampilkan 00:00:00
        }

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };


    return (
        <p {...props} >
            {formatTime(seconds)}
        </p>
    )
}

export default TimerText
