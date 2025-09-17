import { useState, useEffect } from 'react'
import FrameMaster from "./FrameMaster";
import Sidebar from "../sidebar";

function FrameMasters(props) {
    const { offers, setSelected } = props

    return (
        <div className="nav_left mobile-nav_left" style={{ cursor: 'pointer' }}>
            <div className="fixed-content9oiktruydtx">
                <Sidebar/>
            </div>
            {offers?.map((v, i) => (
                <FrameMaster order={{...v}} setSelected={setSelected} key={i} />
            ))}
        </div>
    )
}


export default FrameMasters;