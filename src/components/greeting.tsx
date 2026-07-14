"use client";

import { useEffect, useState } from "react";

interface GreetingProps {
  firstName: string;
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good morning, ${name}`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}`;
  if (hour >= 17 && hour < 21) return `Good evening, ${name}`;
  return `Hello, ${name}`;
}

export function Greeting({ firstName }: GreetingProps) {
  const [greeting, setGreeting] = useState(() => getGreeting(firstName));

  useEffect(() => {
    setGreeting(getGreeting(firstName));
  }, [firstName]);

  return (
    <h1 className="text-xl font-semibold text-gray-900">
      {greeting}
    </h1>
  );
}
