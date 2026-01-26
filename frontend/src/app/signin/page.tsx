"use client";

import styles from "./signin.module.css";
import Image from "next/image";
import acleyLogo from "../assets/newAcleyLogo-removebg-preview.png";
import { useState } from "react";
import Link from "next/link";
import { setToken } from "./auth";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function allNotebooks(theToken: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/user/`, {
                headers: {
                    'Authorization': `Bearer ${theToken}`
                }
            });        
            if (!res.ok) {
                throw new Error('Erro ao carregar notebooks');
            }
        
            const result = await res.json();
            return result;
        } catch(err) {
            console.error(err);
            alert("Erro ao carregar notebooks!");
        }
    }
    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
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

            const token: string = await res.json();

            setToken(token);

            const dataNotebooks = await allNotebooks(token);

            router.push(`/content/${dataNotebooks[0].id}`);
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