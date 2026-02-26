import styles from "./style.module.css";
import React from "react";

type ComponentsType = React.PropsWithChildren<{
    width: string;
    height: string;
}>;

export default function glassBox({width, height, children}: ComponentsType) {
    return (
        <>
            <div className={styles.container} style={{width: width, height: height}}>
                {children}
            </div>
        </>
    );
}