import { useEffect } from 'react'
import { useSelector } from "react-redux"
import {
    useNavigate,
    useOutlet
} from "react-router-dom"
import { selectUser } from '../slices/user.slice'
import { selectUI } from '../slices/ui.slice'

const MasterRoute = () => {
    const navigate = useNavigate()
    const children = useOutlet()
    const ui = useSelector(selectUI)
    const user = useSelector(selectUser)

    useEffect(() => {
        if (ui.isLoading) {
            return
        }
        if (ui.isAuthorized) {
            if (user.master?.[0]) {
                return
            }

            // return navigate("/register/master")
        }
        
        // navigate('/login')
    }, [ui.isAuthorized])

    return children
}

export default MasterRoute

