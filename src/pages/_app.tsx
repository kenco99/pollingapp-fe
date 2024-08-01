import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import store from '../redux/store';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        let tabID = sessionStorage.tabID ?
            sessionStorage.tabID :
            sessionStorage.tabID = Math.random();

        store.dispatch({ type: 'socket/connect', payload: tabID });

        return () => {
            store.dispatch({ type: 'socket/disconnect' });
        };
    }, []);

  return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
  );
}
