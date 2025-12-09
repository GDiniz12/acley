"use client"

import styles from "./signup.module.css";
import acleyLogo from "../assets/newAcleyLogo-removebg-preview.png";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": username,
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

            alert("Cadastro efetuado com sucesso!");
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
                    <span><button>Entrar</button></span>
                </div>
                <div className={styles.content}>
                    <div className={styles.registerContainer}>
                        <form onSubmit={handleSubmit}>
                            <h3>Crie uma conta no Acley</h3>
                            <input type="email" name="emailInp" placeholder="Seu email" onChange={(e) => setEmail(e.target.value)}/>
                            <input type="text" name="usernameInp" placeholder="Seu nome de usuário" onChange={(e) => setUsername(e.target.value)}/>
                            <input type="password" name="passwordInp" placeholder="Sua senha" onChange={(e) => setPassword(e.target.value)}/>
                            <button type="submit">Criar conta</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}