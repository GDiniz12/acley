'use client'

import styles from "./style.module.css";
import Image from "next/image";
import acleyIcon from "../../assets/sorteador.com.png";
import { useEffect, useRef, useState } from "react";

export default function SideBar(props: any) {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [inputs, setInputs] = useState<string[]>([]);
    const lastInputRef = useRef<HTMLInputElement | null>(null);

    function toggleMenu(): void {
        setIsOpenMenu((prev: boolean) => !prev);
    }

    function addInput() {
        setInputs((prev) => [...prev, ""])
    }

    function handleInputChange(index: number, value: string) {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
    }

    function handleBlur(index: number) {
        if (inputs[index].trim() === "") {
            setInputs((prev) => prev.filter((_, i) => i !== index));
        }
    }

    useEffect(() => {
        if (lastInputRef.current) {
            lastInputRef.current.focus();
        }
    }, [inputs]);
    return (
        <>
            <aside className={styles.sideBar}>
                <div className={styles.top}>
                    <Image src={acleyIcon} alt="acley logo" className={styles.acleyLogo}/>
                    <div className={styles.openMenu} onClick={toggleMenu}><div></div></div>
                </div>
                <div className={`${styles.menu} ${isOpenMenu ? styles.show : styles.hide}`}>
                    <h3 className={styles.titleDeck}>Decks</h3>
                    <span className={styles.addDeck} onClick={addInput}>+</span>
                    {inputs.map((value, index) => (
                        <input key={index} type="text" value={value} onChange={(e) => handleInputChange(index, e.target.value)} className={styles.inpDeck} ref={index === inputs.length - 1 ? lastInputRef : null} onBlur={() => handleBlur(index)}/>
                    ))}
                </div>
            </aside>
        </>
    );
}