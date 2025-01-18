import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@radix-ui/themes/styles.css";
import App from "./App";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
