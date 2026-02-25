"use client";

import styles from "./style.module.css";
import GlassBox from "../Components/GlassBox/GlassBox";
import Image from "next/image";
import acleyLogo from "../assets/acleylogo-remove-background.png"
import { useEffect, useState } from "react";
import { getToken } from "../signin/auth";

function whatTimeIs() {
    const hour = Date().split(" ")[4];
    if (hour < "12:00:00") {
        return "Bom dia";
    }
    if (hour >= "12:00:00" && hour < "18:00:00") {
        return "Boa tarde";
    }
    return "Boa noite";
}

interface TypeUser {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

export default function HomePage() {
    const [dataUser, setDataUser] = useState<TypeUser[]>([]);
    const [finish, setFinish] = useState(false);

    useEffect(() => {
        async function userDetails() {
         try {
          const token = getToken();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            }
          });

          const data: TypeUser[] = await res.json();
          if (!res.ok) {
            throw new Error('Erro ao carregar dados do usuário');
          }
          console.log(data[0].username)
          setDataUser(data);
          setFinish(true);
         } catch(err) {
            return err
         }   
        }

        userDetails();
    }, [])

    return (
        <>
            <div className={styles.container}>
                <div className={styles.leftSide}>
                    <span className={styles.logo}>
                        <Image src={acleyLogo} alt="Acley logo" width={50} height={50}/> 
                        <h3>Home</h3>    
                    </span>
                </div>
                <div className={styles.main}>
                    <GlassBox width={"25rem"} height={"0.5rem"}/>

                    <h1>{whatTimeIs()}, {finish ? dataUser[0].username : "No found"}</h1>
                </div>
                <div></div>
            </div>
        </>
    );
}