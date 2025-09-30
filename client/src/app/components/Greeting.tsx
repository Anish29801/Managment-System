import { User } from "../type";

interface GreetingProps {
  user: User | null;
}

export const Greeting: React.FC<GreetingProps> = ({ user }) => {
  const hour = new Date().getHours();
  const timeOfDay =
    hour < 12 ? "Good Morning" : hour < 16 ? "Good Afternoon" : "Good Evening";

  // Get first name only
  const firstName = user?.name.split(" ")[0] || "Guest";

  return (
    <div className="mb-2 sm:mb-4 text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl whitespace-nowrap">
      Hi, {firstName}! {user && timeOfDay}
    </div>
  );
};
