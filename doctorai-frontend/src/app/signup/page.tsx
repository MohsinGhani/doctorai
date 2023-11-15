"use client";

import { Card, Button, Form, Input, Typography, Select } from "antd";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";
import { StateContext } from "../context";

type FieldType = {
  firstname?: string;
  lastname?: string;
  password?: string;
  userType?: string;
  username?: string;
};

const Signup = () => {
  const { Text, Link } = Typography;
  const { baseURL } = useContext<any>(StateContext);
  const { Option } = Select;
  const router = useRouter();

  const onFinish = async (values: FieldType) => {
    console.log("Success:", values);

    const payload = {
      name: `${values.firstname} ${values.lastname}`,
      password: values.password,
      type: values.userType,
      username: values.username,
    };

    try {
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      router.push("/");
      console.log("Registration successful", data);
    } catch (error) {
      console.error("Error during registration:", error);
    }
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
          <Form.Item
            label="User Name"
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message:
                  "Username must not contain spaces or special characters!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="First Name"
            name="firstname"
            rules={[
              { required: true, message: "Please input your first name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Last Name"
            name="lastname"
            rules={[
              { required: true, message: "Please input your last name!" },
            ]}
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
          <Form.Item<FieldType>
            label="User Type"
            name="userType"
            rules={[
              { required: true, message: "Please select your user type!" },
            ]}
          >
            <Select placeholder="Select a user type">
              <Option value="doctor">Doctor</Option>
              <Option value="reception">Reception</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          <Text>Already have an account? </Text>
          <Link href="/">Sign in</Link>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
