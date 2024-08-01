import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import store from '../redux/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

const AppWrapper = ({ Component, pageProps }: AppProps) => {
    const router = useRouter();
    const kicked = useSelector((state: any) => state.socket.kicked);

    useEffect(() => {
        let tabID = sessionStorage.tabID ?
            sessionStorage.tabID :
            sessionStorage.tabID = Math.random();

        store.dispatch({ type: 'socket/connect', payload: tabID });

        return () => {
            store.dispatch({ type: 'socket/disconnect' });
        };
    }, []);

    useEffect(() => {
        if (kicked) {
            router.push('/kicked-out');
        }
    }, [kicked, router]);

    return <Component {...pageProps} />;
};

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <AppWrapper Component={Component} pageProps={pageProps} />
        </Provider>
    );
}
