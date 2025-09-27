'use client'

import styles from "./style.module.css";
import Image from "next/image";
import acleyIcon from "../../assets/sorteador.com.png";
import { useState } from "react";

export default function SideBar() {
    const [isOpenMenu, setIsOpenMenu] = useState(false);

    function toggleMenu() {
        setIsOpenMenu((prev) => !prev);
    }
    return (
        <>
            <aside className={styles.sideBar}>
                <div className={styles.top}>
                    <Image src={acleyIcon} alt="acley logo" className={styles.acleyLogo}/>
                    <div className={styles.openMenu} onClick={toggleMenu}><div></div></div>
                </div>
                <div className={`${styles.menu} ${isOpenMenu ? styles.show : styles.hide}`}></div>
            </aside>
        </>
    );
}