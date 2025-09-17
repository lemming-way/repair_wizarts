import { useEffect } from "react"
import {
    useNavigate,
    useParams
} from "react-router-dom"
import { updateBalance } from "../../services/balance.service"

const WalletConfirm = () => {
    const { id } = useParams()
    const nav = useNavigate()

    useEffect(() => {
        updateBalance(id).then(() => nav('/master/wallet'))
    }, [])
}

export default WalletConfirm
