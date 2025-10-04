import {useEffect, useState} from 'react';
import './titleService.css'
import {Link} from 'react-router-dom'
import { useLanguage } from '../../state/language'

function TitleService() {
    const text = useLanguage();
    const [title, setTitle] = useState("")

    useEffect(() => {
        document.title = text('Service title');
    }, []);
    return (
        <>
            <section className="page-7" style={{paddingBottom: "50px"}}>
                <div className="container_other mobile-container_other fix_width_title">
                    <div className="other_services">
                        <div className="other_services-text">
                            <h2>{text('List a device that is not on the list')} </h2>
                        </div>

                        <div className="other-text">
                            <p>
                                {text('List your device on the exchange. Your device will become visible to thousands of masters, and some of them will make you offers. Study their rating, portfolio and choose the best of them. Confirm the order when you are 100% satisfied with the result. Only after that you can pay the master')}
                            </p>
                        </div>
                    </div>
                    <div className="services">
                        <div className="services_text">
                            <h2>{text('Enter the name of the service title')}</h2>
                        </div>
                        <div className="services_img df align mobile-services_img">
                            <img style={{paddingRight: "7px"}} src="/img/other-service_img/fill.svg" alt="no img"/>
                            <div className="servis_tex">
                                <input type="text" value={title} placeholder='iPhone 13' onChange={(e) => setTitle(e.target.value)} />
                            </div>
                        </div>
                        <p>{text('0 of 55 characters')}</p>
                    </div>
                    <div className="services_but">
                        <Link to={"/client/requests/create/data?title=" + title}>
                            {text('Continue')}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TitleService;