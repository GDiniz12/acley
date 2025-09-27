'use client'

import styles from "./style.module.css";
import Image from "next/image";
import acleyIcon from "../../assets/sorteador.com.png";
import { useState } from "react";

export default function SideBar(props: any) {
    const [isOpenMenu, setIsOpenMenu] = useState(false);

    function toggleMenu(): void {
        setIsOpenMenu((prev: boolean) => !prev);
    }
    return (
        <>
            <aside className={styles.sideBar}>
                <div className={styles.top}>
                    <Image src={acleyIcon} alt="acley logo" className={styles.acleyLogo}/>
                    <div className={styles.openMenu} onClick={toggleMenu}><div></div></div>
                </div>
                <div className={`${styles.menu} ${isOpenMenu ? styles.show : styles.hide}`}>
                    <h3 className={styles.titleDeck}>Decks</h3>
                    <span className={styles.addDeck}>+</span>
                </div>
            </aside>
        </>
    );
}