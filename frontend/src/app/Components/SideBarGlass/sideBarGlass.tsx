"use client";

import { useState } from "react";
import GlassBox from "../GlassBox/GlassBox";
import styles from "./style.module.css";

export default function SideBarGlass() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className={styles.SideBarGlass} onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}>
                <GlassBox width={isOpen ? "15rem" : "0.5rem"} height="20rem" className={styles.glassBox}>
                    <div className={styles.titleBar}>
                        <h3>Notebooks</h3>
                        <span>+</span>
                    </div>
                    <div className={styles.allNotebooks}>

                    </div>
                </GlassBox>
            </div>
        </>
    );
}