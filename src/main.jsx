import React, { Suspense } from 'react';
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./index.css";
import "./i18n";
import setupAxios from "./setupAxios";

setupAxios();

const LoadingMarkup = () => (
  <div style={{ textAlign: 'center', marginTop: '20%' }}>
    <h2>Loading Page...</h2>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<LoadingMarkup />}>
        <App />
      </Suspense>
    </Provider>
  </React.StrictMode>
);
