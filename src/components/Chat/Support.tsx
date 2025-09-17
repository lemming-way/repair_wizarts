import React, { useEffect, useState } from "react";
import '../../scss/chat.css'
import Sidebar from "../sidebar";
import { Link } from 'react-router-dom'
import FrameMessages from './frameMessages'
import MediaQuery from 'react-responsive';

function ChoiceOfReplenishmentMethodCard() {

    useEffect(() => {
        document.title = 'Чат';
    }, []);

    const [chooseFile, IschooseFile] = useState(false)

    return (
        <div className="main nal df">

            <Sidebar />
            <section className="page_2 page_2-fffdsd inter">
                <div className="big_frame-chat df">
                    <MediaQuery query="(min-device-width: 1110px)">
                        <FrameMessages />
                    </MediaQuery>

                    <div className="profil">
                        <Link to="/profile-number">

                            <div className="backtoframemessages">
                                <Link to="/chat/frame-message" className="backtoframemessagesLink">
                                    <img src="../img/backarrov.png" alt="no photo" />
                                    <p>Назад</p>
                                </Link>
                            </div>

                            <div className="kiril_profil df font_inter">
                                <div className="kirill df align">
                                    <div className="prof_img">
                                        <img src="../img/chat_img/тех подержка.png" alt="no photo" />
                                    </div>

                                    <div className="nik">
                                        <h2>
                                            Тех поддержка
                                        </h2>

                                        <div className="info_nik df">
                                            <div className="kiril_info">
                                                <h3 className="chat__online">
                                                    Онлайн
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <div className="call_date font_inter">
                            <div className="cal_date-text df align">
                                <div className="date_line-left"></div>
                                <div className="date1">
                                    <h2>21 АВГ</h2>
                                </div>
                                <div className="date_line-right"></div>
                            </div>
                        </div>

                        <div className="chatt">
                            <div className="my_chat">
                                <div className="correspondence-active font_inter df">

                                    <div className="right_menu-img df align">
                                        <img src="../img/chat_img/edid.png" alt="no photo" />
                                        <img className="ansver" src="../img/chat_img/ответ.png" alt="no photo" />
                                    </div>

                                    <div className="message__fix">
                                        <div className="correspondence_ciril-3">
                                            <div className="letter_kiril-3 df">
                                                <div className="letter_text-2">
                                                    <h3>13:54</h3>
                                                </div>
                                                <div className="letter_text-1">
                                                    <h4>Вы</h4>
                                                </div>
                                            </div>

                                            <div className="sms df align">
                                                <div className="viewed_img-2">
                                                    <img src="../img/chat_img/просмотрено.png" alt="no photo" />
                                                </div>
                                                <div className="sms_text-3">
                                                    <h2>Добрый день! Помогите я не могу пополнить баланс из-за ограничении, Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium autem consectetur error est facere harum iure libero magnam necessitatibus non omnis, praesentium quisquam quos repellat sed sequi sint? Ad alias aspernatur consequatur, cupiditate dolor eaque est facere fuga libero nemo nostrum quasi qui reiciendis tempore vero. Animi eaque odit quidem!</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="you-img">
                                            <img src="../img/chat_img/2.png" alt="no photo" />
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="right_menu">
                                <div className="correspondence font_inter df">
                                    <div className="correspondence_ciril-4 df">
                                        <div className="ciril-img">
                                            <img src="../img/chat_img/тех подержка.png" alt="no photo" />
                                        </div>
                                        <div className="let">
                                            <div className="letter">
                                                <div className="letter_kiril-4 df">
                                                    <div className="letter_text-1">
                                                        <h2>Тех поддержка</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>14:02</h3>
                                                    </div>
                                                </div>
                                                <div className="sms df align">
                                                    <div className="sms_text-2">
                                                        <h2>Хорошо</h2>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="right_menu-img df align">
                                        <img className="ansver" src="../img/chat_img/ответ.png" alt="no photo" />
                                        <img src="../img/chat_img/span.png" alt="no photo" />
                                    </div>
                                </div>
                            </div>


                            <div className="my_chat">
                                <div className="correspondence-active font_inter df">

                                    <div className="right_menu-img df align">
                                        <img src="../img/chat_img/edid.png" alt="no photo" />
                                        <img className="ansver" src="../img/chat_img/ответ.png" alt="no photo" />
                                    </div>

                                    <div className="message__fix">
                                        <div className="correspondence_ciril-3">
                                            <div className="letter_kiril-3 df">
                                                <div className="letter_text-2">
                                                    <h3>13:54</h3>
                                                </div>
                                                <div className="letter_text-1">
                                                    <h4>Вы</h4>
                                                </div>
                                            </div>

                                            <div className="sms df align">
                                                <div className="viewed_img-2">
                                                    <img src="../img/chat_img/просмотрено.png" alt="no photo" />
                                                </div>
                                                <div className="sms_text-3">
                                                    <h2>Понял.</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="you-img">
                                            <img src="../img/chat_img/2.png" alt="no photo" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="right_menu">
                                <div className="correspondence font_inter df">
                                    <div className="correspondence_ciril-4 df">
                                        <div className="ciril-img">
                                            <img src="../img/chat_img/тех подержка.png" alt="no photo" />
                                        </div>
                                        <div className="let">
                                            <div className="letter">
                                                <div className="letter_kiril-4 df">
                                                    <div className="letter_text-1">
                                                        <h2>Тех поддержка</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>14:02</h3>
                                                    </div>
                                                </div>
                                                <div className="sms df align">
                                                    <div className="sms_text-2">
                                                        <h2>Мы всегда рады вам помочь)</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="right_menu-img df align">
                                        <img className="ansver" src="../img/chat_img/ответ.png" alt="no photo" />
                                        <img src="../img/chat_img/span.png" alt="no photo" />
                                    </div>
                                </div>
                            </div>
                            <div className="my_chat">
                                <div className="correspondence-active font_inter df">

                                    <div className="right_menu-img df align">
                                        <img src="../img/chat_img/edid.png" alt="no photo" />
                                        <img className="ansver" src="../img/chat_img/ответ.png" alt="no photo" />
                                    </div>

                                    <div className="message__fix">
                                        <div className="correspondence_ciril-3">
                                            <div className="letter_kiril-3 df">
                                                <div className="letter_text-2">
                                                    <h3>13:54</h3>
                                                </div>
                                                <div className="letter_text-1">
                                                    <h4>Вы</h4>
                                                </div>
                                            </div>

                                            <div className="sms df align">
                                                <div className="viewed_img-2">
                                                    <img src="../img/chat_img/просмотрено.png" alt="no photo" />
                                                </div>
                                                <div className="sms_text-3">
                                                    <h2>Спасибо.</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="you-img">
                                            <img src="../img/chat_img/2.png" alt="no photo" />
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="right_menu">
                                <div className="correspondence font_inter df">
                                    <div className="correspondence_ciril-4 df">
                                        <div className="ciril-img">
                                            <img src="../img/chat_img/тех подержка.png" alt="no photo" />
                                        </div>
                                        <div className="let">
                                            <div className="letter">
                                                <div className="letter_kiril-4 df">
                                                    <div className="letter_text-1">
                                                        <h2>Тех поддержка</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>14:02</h3>
                                                    </div>
                                                </div>
                                                <div className="sms df align">
                                                    <div className="sms_text-2">
                                                        <h2>Добрый день! мы убрали ограничение</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="right_menu-img df align">
                                        <img className="ansver" src="../img/chat_img/ответ.png" alt="no photo" />
                                        <img src="../img/chat_img/span.png" alt="no photo" />
                                    </div>
                                </div>
                            </div>



                            <div className="my_chat">
                                <div className="correspondence-active font_inter df">

                                    <div className="right_menu-img df align">
                                        <img src="../img/chat_img/edid.png" alt="no photo" />
                                        <img className="ansver" src="../img/chat_img/ответ.png" alt="no photo" />
                                    </div>

                                    <div className="message__fix">
                                        <div className="correspondence_ciril-3">
                                            <div className="letter_kiril-3 df">
                                                <div className="letter_text-2">
                                                    <h3>13:54</h3>
                                                </div>
                                                <div className="letter_text-1">
                                                    <h4>Вы</h4>
                                                </div>
                                            </div>

                                            <div className="sms df align">
                                                <div className="viewed_img-2">
                                                    <img src="../img/chat_img/просмотрено.png" alt="no photo" />
                                                </div>
                                                <div className="sms_text-3">
                                                    <h2>Добрый день! Помогите я не могу пополнить баланс из-за ограничении</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="you-img">
                                            <img src="../img/chat_img/2.png" alt="no photo" />
                                        </div>
                                    </div>
                                </div>
                            </div>









                        </div>

                        <div className="message_block">
                            {chooseFile ? <div className="frame_icon ">
                                <div className="choice df">
                                    <div className="choice_img">
                                        <img src="../img/chat_img/img.png" alt="no photo" />
                                    </div>
                                    <div className="im_attach pull-left align">
                                        <input type="file" className="im_attach_input"
                                            title="Send file" />
                                        <p>Фото или видео</p>
                                    </div>
                                </div>

                                <div className="folder df">
                                    <div className="choice_img">
                                        <img src="../img/chat_img/folder.png" alt="no photo" />
                                    </div>
                                    <div className="im_attach pull-left align">
                                        <input type="file" className="im_attach_input"
                                            title="Send file" />
                                        <p>Документ</p>
                                    </div>
                                </div>
                            </div> : null}
                            <div className="block_messages-2 font_inter">
                                <div className="magnafire-2 df align">
                                    <div className="magnafire_input-2">
                                        <input className="inp" type="text" placeholder="Введите сообщение..." />
                                    </div>
                                    <div className="nav_message df">
                                        <label htmlFor="file-input" className="clip">
                                            <img onClick={() => IschooseFile(!chooseFile)} src="../img/chat_img/clip.png" alt="no photo" />
                                        </label>
                                        <label htmlFor="file-input" className="clip">
                                            <img src="../img/chat_img/emoji.png" alt="no photo" />
                                        </label>
                                        <div className="plane">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    )
}


export default ChoiceOfReplenishmentMethodCard;