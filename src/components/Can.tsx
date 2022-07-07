import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
    children: ReactNode;
    permissions?: string[];
    roles?: string[]
}

export default function Can({ children, permissions, roles }: CanProps) {
    const useCanSeeComponent = useCan({ permissions, roles })

    return (
        <>
            {children}
        </>
    )
}