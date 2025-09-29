// Greeting.tsx
import { User } from "../type";

interface GreetingProps {
  user: User | null;
}

export const Greeting: React.FC<GreetingProps> = ({ user }) => {
  const hour = new Date().getHours();
  const timeOfDay =
    hour < 12 ? "Good Morning" : hour < 16 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="mb-2 sm:mb-4 text-white font-semibold text-base sm:text-lg md:text-xl">
      Hi, {user ? user.name : "Guest"}! {user && timeOfDay}
    </div>
  );
};
