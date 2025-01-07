import { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

const useAuth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [token, setToken] = useState<string>("");

  const isRun = useRef(false);
  const client = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENTID,
  });

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;
    client
      .init({
        onLoad: "login-required",
      })
      .then((authenticated) => {
        setIsLogin(authenticated);
        if (!authenticated) return;
        client.loadUserInfo().then((userInfo: any) => {
          if (!userInfo) return;
          setUserInfo(userInfo);
          setToken(client.token ?? "");
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("token", client.token ?? "");
          localStorage.setItem("isLogin", "true");
          fetch("http://localhost:5000/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${client.token}`,
            },
            body: JSON.stringify({
              name: userInfo.name,
              email: userInfo.email,
              userId: userInfo.sub,
            }),
          });
        });
      });
  }, []);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    const storedToken = localStorage.getItem("token");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return { isLogin, client, userInfo, token };
};

export default useAuth;
