import { AppBar } from "../components/AppBar";
import { Users } from "../components/User";
import { Balance } from "../components/Balance";

export function Dashboard() {
  return (
    <>
      <AppBar />
      <div className="m-8">
        <Balance value={"10,000"}></Balance>
      </div>
      <Users />
    </>
  );
}
