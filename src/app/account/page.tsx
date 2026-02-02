"use client";

import { useState, useEffect } from "react";
import type { EventType } from "@/src/models/EventType";

export default function List() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
    const [loginFailed, setLoginFailed] = useState(false);
  const [formError, setFormError] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/services/account/get/getCities");
      const data = await res.json();
    })();
  }, []);

  const getEvents = async () => {};

  return (
    <>
      <div
        className="h-[90vh] flex items-center justify-center flex-wrap"
        v-if="!isLogged && showForm"
      >
        <div className="p-8 border-2 border-black rounded-lg bg-white transition-colors duration-300">
          <div className="grid grid-rows-3 gap-5">
            <input value={username} onChange={(e) => setUsername(e.target.value)}
              className="h-14 border-t-0 border-x-0 rounded-none outline-none transition-colors duration-300 focus:border-black bg-white px-2  text-black border-2 border-[rgb(128,128,128)]"
              placeholder="Kullanıcı Adı"
            />
            <input value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-14 border-t-0 border-x-0 rounded-none outline-none transition-colors duration-300 focus:border-black bg-white px-2  text-black border-2 border-[rgb(128,128,128)] "
              type="password"
              placeholder="Parola"
            />
            <button className="btn btn-outline btn-success">Giriş Yap</button>
          </div>
        </div>
      {loginFailed && (
        <div className="text-red-500 font-bold absolute mt-64">
          Hatalı kullanıcı adı veya parola.
        </div>
      )}

      {formError && (
        <div className="text-red-500 font-bold absolute mt-64">
          Kullanıcı adı veya parola boş olamaz.
        </div>
      )}
      </div>
    </>
  );
}
