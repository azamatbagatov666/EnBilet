"use client";
import { useAuth } from "@/src/hooks/useAuth";

import { useState, useEffect } from "react";

export default function List() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [passType, setPassType] = useState<"password" | "text">("password");



  const handleLogin = async () => {
    setFormError("");

    if (username != "" && password != "") {
      try {
        const res = await login(username, password);
        if (res === 401) {
          setFormError("Hatalı kullanıcı adı veya parola.");
        }
        else if (res === 500) {
        setFormError("Bağlantı sorunu.");

        }
      } catch (error) {
      }
    } else setFormError("Kullanıcı adı veya parola boş olamaz.");
  };

  return (
    <>
      <div className="h-[60vh] flex items-center justify-center flex-wrap">
        <div className="p-8 border-2 border-black rounded-3xl bg-base-300 w-auto max-w-full">
          <div className=" text-3xl flex font-bold justify-center mb-8">
            ÜYE GİRİŞİ
          </div>
          <div className="grid grid-rows-3 gap-5">
            <div className="flex relative items-center group justify-left   focus-within:border-black dark:focus-within:border-white border-b-2 border-[rgb(128,128,128)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-6 absolute left-2 z-10 fill-current text-gray-400  group-focus-within:text-black dark:group-focus-within:text-white "
              >
                <path d="M12 1C8.96243 1 6.5 3.46243 6.5 6.5C6.5 9.53757 8.96243 12 12 12C15.0376 12 17.5 9.53757 17.5 6.5C17.5 3.46243 15.0376 1 12 1Z"></path>
                <path d="M7 14C4.23858 14 2 16.2386 2 19V22C2 22.5523 2.44772 23 3 23H21C21.5523 23 22 22.5523 22 22V19C22 16.2386 19.7614 14 17 14H7Z"></path>
              </svg>
              <input
          maxLength={128}
                autoCapitalize="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                className="input group h-14 w-full border-0 rounded-none outline-none!  pl-10  bg-base-300 pr-2   "
                placeholder="Kullanıcı Adı"
              />
            </div>

            <div className="relative flex items-center group justify-left   focus-within:border-black dark:focus-within:border-white border-b-2 border-[rgb(128,128,128)]">
              <svg
                viewBox="0 0 16 16"
                className="size-6 absolute z-10 left-2 fill-current text-gray-400  group-focus-within:text-black dark:group-focus-within:text-white "
              >
                <path
                  fillRule="evenodd"
                  d="M16 5.5C16 8.53757 13.5376 11 10.5 11H7V13H5V15L4 16H0V12L5.16351 6.83649C5.0567 6.40863 5 5.96094 5 5.5C5 2.46243 7.46243 0 10.5 0C13.5376 0 16 2.46243 16 5.5ZM13 4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4Z"
                ></path>
              </svg>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                className="input group w-full h-14 border-0  pr-12 rounded-none outline-none!   bg-base-300 pl-10   "
                type={passType}
                placeholder="Parola"
              />
              <button className="absolute right-3" onClick={(e) => setPassType(passType === "password" ? "text" : "password")}>
                {passType === "password" ? (
                  <svg
                    fill="#000000"
                    viewBox="0 0 24 24"
                    className="size-6  fill-current text-gray-400  group-focus-within:text-black dark:group-focus-within:text-white "
                  >
                    <path d="M2.293,21.707a1,1,0,0,0,1.414,0l3.2-3.2A9.581,9.581,0,0,0,12,20c4.325,0,8.227-3,9.938-7.654a.993.993,0,0,0,0-.692A12.6,12.6,0,0,0,18.7,6.719l3.012-3.012a1,1,0,1,0-1.414-1.414l-3.2,3.2A9.581,9.581,0,0,0,12,4C7.675,4,3.773,7,2.062,11.654a.993.993,0,0,0,0,.692,12.6,12.6,0,0,0,3.243,4.935L2.293,20.293A1,1,0,0,0,2.293,21.707ZM17.266,8.148A10.454,10.454,0,0,1,19.929,12c-1.478,3.657-4.556,6-7.929,6a7.52,7.52,0,0,1-3.632-.954l1.613-1.613A3.947,3.947,0,0,0,12,16a4,4,0,0,0,4-4,3.947,3.947,0,0,0-.567-2.019Zm-7.191,4.363A1.96,1.96,0,0,1,10,12a2,2,0,0,1,2-2,1.96,1.96,0,0,1,.511.075Zm3.85-1.022A1.96,1.96,0,0,1,14,12a2,2,0,0,1-2,2,1.96,1.96,0,0,1-.511-.075ZM4.071,12C5.549,8.343,8.627,6,12,6a7.52,7.52,0,0,1,3.632.954L14.019,8.567A3.947,3.947,0,0,0,12,8a4,4,0,0,0-4,4,3.947,3.947,0,0,0,.567,2.019L6.734,15.852A10.454,10.454,0,0,1,4.071,12Z"></path>
                  </svg>
) : (
                    <svg
                    fill="#000000"
                    viewBox="0 0 24 24"
                    className="size-6  fill-current text-gray-400  group-focus-within:text-black dark:group-focus-within:text-white "
                  >
                      <path d="M2.062,12.346C3.773,17,7.675,20,12,20s8.227-3,9.938-7.654a.993.993,0,0,0,0-.692C20.227,7,16.325,4,12,4S3.773,7,2.062,11.654A.993.993,0,0,0,2.062,12.346ZM12,6c3.373,0,6.451,2.343,7.929,6-1.478,3.657-4.556,6-7.929,6s-6.451-2.343-7.929-6C5.549,8.343,8.627,6,12,6Zm0,10a4,4,0,1,0-4-4A4,4,0,0,0,12,16Zm0-6a2,2,0,1,1-2,2A2,2,0,0,1,12,10Z"></path>
                  </svg>
)}

              
              </button>
            </div>

            <button
              className="btn btn-outline btn-success"
              onClick={() => handleLogin()}
            >
              Giriş Yap
            </button>
          </div>
                        <div
        className="text-red-500 text-center font-bold w-72 mt-2 h-6"
      > {formError}
      
      </div>
        </div>

      </div>
    </>
  );
}
