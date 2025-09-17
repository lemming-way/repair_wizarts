import { useLocation, useNavigate, useParams } from "react-router-dom"

const withRouter = (Component) => (props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()

    return (
        <Component
            {...props}
            match={{ location, navigate, params }}
        />
    )
}

export default withRouter
