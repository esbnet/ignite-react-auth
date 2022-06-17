import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    console.log(user);
    return (
        <h1>Dashboard</h1>
    );
}