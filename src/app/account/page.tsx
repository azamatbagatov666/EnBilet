"use client";
import { useAuth } from "@/src/hooks/useAuth";

import { useState, useEffect } from "react";

export default function List() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const [formError, setFormError] = useState(false);

  useEffect(() => {
    (async () => {})();
  }, []);

  const handleLogin = async () => {
    setFormError(false);
    setLoginFailed(false);

    if (username != "" && password != "") {
      try {
        const res = await login(username, password);
        if (!res) {
          setLoginFailed(true);
        }
      } catch (error) {
        setLoginFailed(true);
      }
    } else setFormError(true);
  };

  return (
    <>
      <div className="h-[90vh] flex items-center justify-center flex-wrap">
        <div className="p-8 border-2 border-black rounded-lg bg-white transition-colors duration-300">
          <div className="grid grid-rows-3 gap-5">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 border-t-0 border-x-0 rounded-none outline-none transition-colors duration-300 focus:border-black bg-white px-2  text-black border-2 border-[rgb(128,128,128)]"
              placeholder="Kullanıcı Adı"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 border-t-0 border-x-0 rounded-none outline-none transition-colors duration-300 focus:border-black bg-white px-2  text-black border-2 border-[rgb(128,128,128)] "
              type="password"
              placeholder="Parola"
            />
            <button
              className="btn btn-outline btn-success"
              onClick={() => handleLogin()}
            >
              Giriş Yap
            </button>
          </div>
        </div>
        {loginFailed && (
          <div className="text-red-500 font-bold absolute mt-[20rem]">
            Hatalı kullanıcı adı veya parola.
          </div>
        )}

        {formError && (
          <div className="text-red-500 font-bold absolute mt-[20rem]">
            Kullanıcı adı veya parola boş olamaz.
          </div>
        )}
      </div>
    </>
  );
}
