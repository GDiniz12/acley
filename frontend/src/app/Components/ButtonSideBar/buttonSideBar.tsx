import styles from "./style.module.css";

type PropsButton = React.PropsWithChildren<{
    width: string;
    onClick: any;
}>;

export default function ButtonSideBar(props: PropsButton) {

    const IconMenu = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c2bdbde6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
    ); 

    return (
        <>
            <div className={styles.container} onClick={props.onClick}>
                <div className={styles.menuIcon}>
                    <IconMenu />
                </div>
                <div className={styles.search}>
                    <input type="text" placeholder="Pesquisar"/>
                </div>
            </div>
        </>
    );
}