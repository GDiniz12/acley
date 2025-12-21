"use client";

import styles from "./signin.module.css";
import Image from "next/image";
import acleyLogo from "../assets/newAcleyLogo-removebg-preview.png";
import { useState } from "react";
import Link from "next/link";
import { setToken } from "./auth";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "email": email,
                    "password": password
                })
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Unknown error"}));
                console.log("Error: ", err);
                alert("Error!");
                return;
            }

            const data: string = await res.json();
            setToken(data);
        } catch(err) {
            alert("Error: " + err);
        }
    }

    return (
        <>
            <div className={styles.theBody}>
                <div className={styles.fixedBar}>
                    <span className={styles.logoAcley}>
                        <Image src={acleyLogo} alt="Acley logo" className={styles.imgAcley}/>
                    </span>
                    <span><button><Link href={"/signup"}>Registrar</Link></button></span>
                </div>
                <div className={styles.content}>
                    <div className={styles.containerSignIn}>
                        <form onSubmit={handleSubmit}>
                            <h3>Entre no Acley</h3>
                            <input type="email" name="emailInp" placeholder="Seu email" onChange={(e) => setEmail(e.target.value)}/>
                            <input type="password" name="passwordInp" placeholder="Sua senha" onChange={(e) => setPassword(e.target.value)}/>
                            <button type="submit">Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}