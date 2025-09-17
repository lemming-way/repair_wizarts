import { useEffect } from "react";
import '../addDevices/added-devices.css'
import { Link } from "react-router-dom";
import AddedDevice from "../addDevices/AddedDevice";

function CustomOrders() {
    useEffect(() => {
        document.title = 'Добавленные устройства';
    }, []);

    return (
        <section className="page_7">
            <div className="container_added mobile-container_added">
                <div className="adding_devices font_abel">
                    <div className="device">
                        <div className="device_text-2">
                            <h2>Добавленные устройства</h2>
                            <h3>Заказы</h3>
                        </div>
                    </div>
                    <div className="nav_list-1 df align">
                        <div className="nav_device df mobile-nav_device">
                            <div className="nav_device-1 nav_device-1-active">
                                <Link className="just__flexingfaa" to='/order/actual'>
                                    <h2>Актуальное</h2>
                                    <span className="numbers__faCoigCXff">1</span>
                                </Link>
                            </div>
                            <div className="nav_device-2 mobile-nav_device-2">
                                <Link className="just__flexingfaa" to='/order/archive'>
                                    <h2>Архив</h2>
                                    <span className="numbers__faCoigCXff">1</span>
                                </Link>
                            </div>
                        </div>
                        <div className="nav_device-but mobile-nav_device-but">
                            <Link to="/title-service" className="uihadsfjdsa">
                                Добавить устройство
                            </Link>
                        </div>
                    </div>

                    <div className="h hbb mobile-h">
                        <div className="big_nav-devicefsadsad df align mobile-big_nav-device">
                            <div className="big_nav-text_1 mobile-big_nav-text_1">
                                <h2>Заказы</h2>
                            </div>
                            <div className="big_nav-text_2 df align mobile-big_nav-text_2">
                                <div className="tex-1 df mobile-tex-1">
                                    <h2>Цена</h2>

                                    <h2>Предложение</h2>

                                    <h3>СТАТУС</h3>
                                    <div className="tex-2">
                                        <h2>Управлять</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {requests?.map((v) => (
                            <AddedDevice key={v.id} {...v} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}


export default CustomOrders;