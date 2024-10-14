import HomeLayout from "./ui/home/layout";
import Home from "./ui/home/page";
import Maintenance from "./ui/maintenance/maintenance";

export default function HomeApp() {
  const showMaintenance =
    process.env.NODE_ENV !== "development" &&
    process.env.MAINTENANCE_MODE === "true";
  return (
    <div>
      {showMaintenance ? (
        <Maintenance />
      ) : (
        <HomeLayout>
          <Home />
        </HomeLayout>
      )}
    </div>
  );
}
