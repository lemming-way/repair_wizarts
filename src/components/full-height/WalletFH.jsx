import React, { useEffect, useRef, useState } from "react";
import { updateUserPhoto } from "../../services/user.service";
import Sidebar from "../sidebar";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../slices/user.slice";
import './startff.css'
import SERVER_PATH from "../../constants/SERVER_PATH";


function App() {
    const user = useSelector(selectUser)

    const [succeeded, setSucceeded] = useState(false)
    const [error, setError] = useState("")
    const inputRef = useRef(null)

    useEffect(() => {
        document.title = 'Настройки';
    }, []);
    
    const onProfilePicUpdate = async (e) => {
        e.preventDefault()
        const file = inputRef.current?.files[0]

        if (file) {
            updateUserPhoto(file, user.id)
                .then(() => { setSucceeded(true); setError("") })
                .catch((err) => { setSucceeded(false); setError(err.message) })
        }
    }

    return (
            <>

                <div className="block-info-12">
                    {error && (
                        <div className="auth-err" style={{ marginTop: "10px" }}>
                            {error}
                        </div>
                    )}
                    {succeeded && (
                        <div className="succeed-v" style={{ marginTop: "10px" }}>
                            Данные были успешно изменены
                        </div>
                    )}
                    <div className="photo-taking">
                        <form onSubmit={onProfilePicUpdate} style={{ marginTop: "20px" }}>
                            <label htmlFor="upfile" style={{marginBottom: "20px"}}>
                                <img
                                    src={user.avatar ? SERVER_PATH + user.avatar : "/img/img-camera.png"}
                                    alt=""
                                    className="settings-picture"
                                />
                            </label>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                id="upfile"
                                style={{ display: "none" }}
                                ref={inputRef}
                            />
                            <div className="block-btn bgpuherpte df">
                                <button className="btn-9 goooSaveButton">Изменить</button>
                            </div>
                        </form>
                    </div>
                </div>
        </>
    )
}


export default App;
