import { User } from "../type";

interface GreetingProps {
  user: User | null;
}

export const Greeting: React.FC<GreetingProps> = ({ user }) => {
  const hour = new Date().getHours();
  const timeOfDay =
    hour < 12 ? "Good Morning" : hour < 16 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="mb-4 text-white font-semibold text-lg">
      Hi, {user ? user.name : "Guest"}! {user && timeOfDay}
    </div>
  );
};
