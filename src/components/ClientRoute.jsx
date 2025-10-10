import { useEffect } from 'react'
import {
    useOutlet
} from "react-router-dom"

import { useUIState } from '../state/ui/UIStateContext'

const ProtectedRoute = () => {
    const children = useOutlet()
    const ui = useUIState()

    useEffect(() => {
        if (ui.isLoading) {
            return
        }
        if (ui.isAuthorized) {
            return
        }

        // navigate("/login")
    }, [ui])

    return children
}

export default ProtectedRoute
