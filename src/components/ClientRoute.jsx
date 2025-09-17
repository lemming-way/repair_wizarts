import { useEffect } from 'react'
import { useSelector } from "react-redux"
import {
    useNavigate,
    useOutlet
} from "react-router-dom"
import { selectUI } from '../slices/ui.slice'

const ProtectedRoute = () => {
    const navigate = useNavigate()
    const children = useOutlet()
    const ui = useSelector(selectUI)

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
