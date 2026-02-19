"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import { use } from 'react'


export default function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const getAllVenues = async () => {
  };

  useEffect(() => {
    getAllVenues();
  }, []);

  const { id } = use(params)

  return (
    <div>
      <p>{id}</p>
    </div>
  )
}

 
