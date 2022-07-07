import { useContext, useEffect } from "react";
import Can from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupApiClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
    const { user, isAuthenticated } = useContext(AuthContext);

    const useCanSeeMetrics = useCan({
        permissions: ['metrics.list']
    });

    useEffect(() => {
        api.get('/me')
            .then(response => console.log(response))
            .catch(error => console.log(error))
    }, [])

    return (
        <>
            <h1>User: {user?.email}</h1>
            <Can permissions={['metrics.list']}>
                <div>Métricas</div>
            </Can>
        </>
    );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    //@ts-ignore
    const apiClient = setupApiClient(ctx);
    const response = await apiClient.get('me')

    return {
        props: {}
    }
})