"use client";

import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import Patients from "@/app/components/Patients";
import Doctors from "@/app/components/Doctors";
import Appointments from "@/app/components/Report";

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Patients",
    children: <Patients />,
  },
  {
    key: "2",
    label: "Doctors",
    children: <Doctors />,
  },
  {
    key: "3",
    label: "Appointments",
    children: <Appointments />,
  },
];

const ReceptionTabs = () => (
  <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
);

export default ReceptionTabs;
