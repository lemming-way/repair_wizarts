import React, { useEffect } from "react";
import '../../../scss/chat.css'
import { Link } from 'react-router-dom'

function App() {

    useEffect(() => {
        document.title = 'Чат';
    }, []);

    return (
        <div className="frame_messages frame_messages__fullchat">

            <div className="block_messages font_inter">
                <div className="messages_text">
                    <h2>
                        Сообщения
                    </h2>
                </div>
                <div className="magnafire df align">
                    <div className="magnafire_img">
                        <img src="/img/chat_img/лупа.png" alt="no photo" />
                    </div>
                    <div className="magnafire_input">
                        <input type="text" placeholder="Поиск..." />
                    </div>
                </div>
            </div>

            <div className="big_messages__wrap">

                <div className="big_messages">
                    <Link to={window.location.href.includes("master")
                        ? "/master/chat/111"
                        : "/client/chat/111"
                    }>
                        <div className="ilya df font_inter align">
                            <div className="ilya_img">
                                <img src="/img/chat_img/ilya.png" alt="no photo" />
                            </div>

                            <div className="ilya_text">
                                <h2>
                                    Илья Брага
                                </h2>

                                <h3 className="txt-text-small-ver" style={{color: "#D9573B"}}>
                                    Печатает...
                                </h3>
                            </div>

                            <div className="ilya_text-2">
                                <h2>
                                    14:12
                                </h2>

                                <h3>
                                    1
                                </h3>
                            </div>
                        </div>
                        <div className="line_ilya"></div>
                    </Link>
                </div>

                <div className="big_messages">
                    <Link to={window.location.href.includes("master")
                        ? "/master/chat/168789461"
                        : "/client/chat/168789461"
                    }>
                        <div className="ilya df font_inter align">
                            <div className="ilya_img">
                                <img src="/img/chat_img/тех подержка.png" alt="no photo" />
                            </div>

                            <div className="ilya_text">
                                <h2>
                                    Тех поддержка
                                </h2>

                                <h3 className="txt-text-small-ver">
                                    Хорошо
                                </h3>
                            </div>

                            <div className="ilya_text-2">
                                <h2>
                                    14:12
                                </h2>

                                <h3>
                                    1
                                </h3>
                            </div>
                        </div>
                        <div className="line_ilya"></div>
                    </Link>
                </div>

                <div className="big_messages">
                    <Link to={window.location.href.includes("master")
                        ? "/master/chat/16854163"
                        : "/client/chat/16854163"
                    }>
                        <div className="ilya df font_inter align">
                            <div className="ilya_img">
                                <img src="/img/chat_img/кирил.png" alt="no photo" />
                            </div>

                            <div className="ilya_text">
                                <h2>
                                    Кирилл Воронов
                                </h2>

                                <h3 className="txt-text-small-ver">
                                    Смогу приехать через час
                                </h3>
                            </div>

                            <div className="ilya_text-2">
                                <h2>
                                    14:02
                                </h2>
                            </div>
                        </div>
                        <div className="line_ilya"></div>
                    </Link>
                </div>
                <div className="big_messages">
                    <Link to={window.location.href.includes("master")
                            ? "/master/chat/16854163"
                            : "/client/chat/16854163"
                        }>
                        <div className="ilya df font_inter align">
                            <div className="ilya_img">
                                <img src="/img/chat_img/кирил.png" alt="no photo" />
                            </div>

                            <div className="ilya_text">
                                <h2>
                                    Кирилл Воронов
                                </h2>

                                <h3 className="txt-text-small-ver">
                                    Смогу приехать через час
                                </h3>
                            </div>

                            <div className="ilya_text-2">
                                <h2>
                                    14:02
                                </h2>
                            </div>
                        </div>
                        <div className="line_ilya"></div>
                    </Link>
                </div>

                <div className="big_messages">
                    <div className="ilya df font_inter align">
                        <div className="ilya_img">
                            <img src="/img/chat_img/елена.png" alt="no photo" />
                        </div>

                        <div className="ilya_text">
                            <h2>
                                Елена Ионова
                            </h2>

                            <h3 className="txt-text-small-ver">
                                Фото пришлю позже
                            </h3>
                        </div>

                        <div className="ilya_text-2">
                            <h2>
                                11:57
                            </h2>
                        </div>
                    </div>
                    <div className="line_ilya"></div>
                </div>

                <div className="big_messages">
                    <div className="ilya df font_inter align">
                        <div className="ilya_img">
                            <img src="/img/chat_img/флипп.png" alt="no photo" />
                        </div>
                        <div className="ilya_text">
                            <h2>
                                Филипп Терешов
                            </h2>

                            <h3 className="txt-text-small-ver">
                                Спасибо
                            </h3>
                        </div>

                        <div className="ilya_text-2">
                            <h2>
                                10:33
                            </h2>
                        </div>
                    </div>
                    <div className="line_ilya"></div>
                </div>

                <div className="big_messages">
                    <div className="ilya df font_inter align">
                        <div className="ilya_img">
                            <img src="/img/chat_img/михаил.png" alt="no photo" />
                        </div>

                        <div className="ilya_text">
                            <h2>
                                Михаил Серов
                            </h2>

                            <h3 className="txt-text-small-ver">
                                Отправьте адрес
                            </h3>
                        </div>

                        <div className="ilya_text-2">
                            <h2>
                                09:56
                            </h2>
                        </div>
                    </div>
                    <div className="line_ilya"></div>
                </div>

                <div className="big_messages">
                    <div className="ilya df font_inter align">
                        <div className="ilya_img">
                            <img src="/img/chat_img/евгений.png" alt="no photo" />
                        </div>

                        <div className="ilya_text">
                            <h2>
                                Евгений Конеев
                            </h2>

                            <h3 className="txt-text-small-ver">
                                Спасибо
                            </h3>
                        </div>

                        <div className="ilya_text-2">
                            <h2>
                                09:23
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default App;