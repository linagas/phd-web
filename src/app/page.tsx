import HomeLayout from "./ui/home/layout";
import Home from "./ui/home/page";

export default function HomeApp() {
  return (
    <div>
      <HomeLayout>
        <Home />
      </HomeLayout>
    </div>
  );
}
