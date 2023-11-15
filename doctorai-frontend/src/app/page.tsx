"use client";

import { Card, Button, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect } from "react";
import { StateContext } from "./context";

type FieldType = {
  username?: string;
  password?: string;
};

export default function Home() {
  const router = useRouter();
  const { Text, Link } = Typography;
  const { baseURL, setUser } = useContext<any>(StateContext);

  useEffect(() => {
    const user: any = localStorage.getItem("user");
    console.log("🚀 ~ user:", JSON.parse(user));
    if (user) {
      setUser(JSON.parse(user));
    } else {
      setUser(null);
    }
  }, []);

  const onFinish = (values: any) => {
    const { username, password } = values;
    fetch(`${baseURL}/login`, {
      // Use the baseURL here
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Login successful", data);
        setUser(data);
        router.push("/reception");

        // Perform any necessary actions after a successful login
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-card-container">
      <Card>
        <Form
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          <Text>Don&apos;t have an account? </Text>
          <Link href="/signup">Sign Up</Link>
        </Form>
      </Card>
    </div>
  );
}
