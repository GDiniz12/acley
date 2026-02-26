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
    const [isOpen, setIsOpen] = useState(false);

    const HomeIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
    );

    const NotesIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
    );

    const TutorIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
    );

    const CardIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    )

    const TooltipIcon = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
        <div className={styles.tooltipWrapper}>
            {icon}
            <span className={styles.tooltip}>{label}</span>
        </div>
    );


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
                    <div onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)} className={styles.glassBox}>
                        <GlassBox
                            width={"120%"}
                            height={isOpen ? "3rem" : "0.5rem"}
                            onMouseEnter={() => setIsOpen(true)}
                            onMouseLeave={() => setIsOpen(false)}
                        >
                            <TooltipIcon icon={<HomeIcon />} label="Home" />
                            <TooltipIcon icon={<NotesIcon />} label="Notes" />
                            <TooltipIcon icon={<TutorIcon />} label="AI Tutor" />
                            <TooltipIcon icon={<CardIcon />} label="Flashcards" />
                        </GlassBox>
                    </div>

                    <h1>{whatTimeIs()}, {finish ? dataUser[0].username : "No found"}</h1>
                </div>
                <div></div>
            </div>
        </>
    );
}