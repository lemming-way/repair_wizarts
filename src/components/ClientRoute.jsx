import { useEffect } from 'react'
import {
    useOutlet
} from "react-router-dom"

import { useUserQuery } from '../hooks/useUserQuery'

const ProtectedRoute = () => {
    const children = useOutlet()
    const { user = {} } = useUserQuery()

    useEffect(() => {
        if (!!user.u_id) {
            return
        }

        // navigate("/login")
    }, [user])

    return children
}

export default ProtectedRoute
