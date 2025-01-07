import "./App.css";
import useAuth from "./hooks/useAuth";
import Protected from "./components/Protected";
import Public from "./components/Public";

function App() {
  const { isLogin, userInfo, token } = useAuth();

  return isLogin ? <Protected userInfo={userInfo} token={token} /> : <Public />;
}

export default App;
