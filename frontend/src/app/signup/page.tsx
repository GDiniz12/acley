import styles from "./signup.module.css";
import acleyLogo from "../assets/newAcleyLogo-removebg-preview.png";
import Image from "next/image";

export default function SignUp() {
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
                        <h3>Crie uma conta no Acley</h3>
                        <input type="email" name="emailInp" placeholder="Seu email"/>
                        <input type="text" name="usernameInp" placeholder="Seu nome de usuário" />
                        <input type="password" name="passwordInp" placeholder="Sua senha" />
                        <button>Criar conta</button>
                    </div>
                </div>
            </div>
        </>
    );
}