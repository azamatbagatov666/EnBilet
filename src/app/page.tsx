"use client";
import { redirect } from 'next/navigation'

import { useState, useEffect } from "react";

export default function List() {

  

  useEffect(() => {
    (async () => {
      const res = await fetch("/services/account/get/getCities");
      const data = await res.json();
    })();
  }, []);



  return (
    <>

    </>
  );
}
